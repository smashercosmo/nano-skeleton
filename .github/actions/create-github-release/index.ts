import {
  getInput,
  getBooleanInput,
  info,
  warning,
  setFailed,
} from "@actions/core";
import { getExecOutput } from "@actions/exec";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { z } from "zod";

const WorkspacePackageSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  path: z.string(),
  private: z.boolean().default(false),
});

const ReleaseSchema = z.object({
  tag_name: z.string(),
  html_url: z.url(),
});

type RequestOptions<TSchema extends z.ZodType> =
  | Readonly<{ method: "GET"; endpoint: `/${string}`; schema: TSchema }>
  | Readonly<{
      method: "POST";
      endpoint: `/${string}`;
      schema: TSchema;
      body: Readonly<Record<string, unknown>>;
    }>;

const RELEASES_PER_PAGE = 100;

function getEnv(name: string) {
  const value = process.env[name];

  if (value === undefined) {
    throw new Error(`${name} env variable isn't set`);
  }

  return value;
}

/** Minimal GitHub REST API client for the current repository */
function createGitHubClient(token: string) {
  const apiUrl = process.env["GITHUB_API_URL"] ?? "https://api.github.com";
  const repository = getEnv("GITHUB_REPOSITORY");

  return async function request<TSchema extends z.ZodType>(
    options: RequestOptions<TSchema>,
  ): Promise<z.infer<TSchema>> {
    const { method, endpoint, schema } = options;
    const response = await fetch(`${apiUrl}/repos/${repository}${endpoint}`, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "create-github-release",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.method === "POST"
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(options.method === "POST"
        ? { body: JSON.stringify(options.body) }
        : {}),
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API ${method} ${endpoint} failed with ${response.status}: ${await response.text()}`,
      );
    }

    const result = schema.safeParse(await response.json());

    if (!result.success) {
      throw new Error(
        `GitHub API ${method} ${endpoint} returned an unexpected response:\n${z.prettifyError(result.error)}`,
      );
    }

    return result.data;
  };
}

/**
 * Returns the section from "## <version>" (or "## [<version>] - <date>") up to
 * the next "## " heading
 */
function getReleaseNotes(changelog: string, version: string) {
  const notes: string[] = [];
  let found = false;

  for (const line of changelog.split("\n")) {
    if (line.startsWith("## ")) {
      if (found) {
        break;
      }

      const heading = line.split(/\s+/v)[1]?.replaceAll(/[\[\]]/gv, "");
      found = heading === version;
    } else if (found) {
      notes.push(line);
    }
  }

  return notes.join("\n").trim();
}

/**
 * Includes drafts, which, unlike published releases, may share a tag. The
 * get-release-by-tag endpoint doesn't return drafts, hence the full list. Pages
 * are fetched one after another, as the total count isn't known upfront
 */
async function getExistingTags(
  request: ReturnType<typeof createGitHubClient>,
  page = 1,
  tags: readonly string[] = [],
): Promise<readonly string[]> {
  const releases = await request({
    method: "GET",
    endpoint: `/releases?per_page=${RELEASES_PER_PAGE}&page=${page}`,
    schema: z.array(ReleaseSchema),
  });
  const collected = [...tags, ...releases.map((release) => release.tag_name)];

  return releases.length < RELEASES_PER_PAGE
    ? collected
    : getExistingTags(request, page + 1, collected);
}

/**
 * The commit that set the package's current version: the last one that added or
 * removed the `"version": "<version>"` line of its package.json.
 *
 * That's the commit to tag. The commit the workflow runs on can be a later one,
 * e.g. when a failed release is retried by hand after more commits have landed
 * on main. Falls back to the workflow's commit when the history has no answer,
 * e.g. in a shallow clone.
 */
async function getVersionCommit(
  packagePath: string,
  version: string,
  fallback: string,
) {
  const { stdout, exitCode } = await getExecOutput(
    "git",
    [
      "log",
      "-1",
      "--format=%H",
      `-S"version": "${version}"`,
      "--",
      path.join(packagePath, "package.json"),
    ],
    { silent: true, ignoreReturnCode: true },
  );
  const commit = stdout.trim();

  if (exitCode !== 0 || commit === "") {
    warning(
      `Couldn't find the commit that set version ${version}, tagging ${fallback} instead`,
    );
    return fallback;
  }

  return commit;
}

try {
  const token = getInput("token", { required: true });
  const draft = getBooleanInput("draft");
  const sha = getEnv("GITHUB_SHA");

  const { stdout: workspacePackagesOutput } = await getExecOutput(
    "pnpm",
    ["ls", "-r", "--depth", "-1", "--json"],
    { silent: true },
  );
  const workspacePackages = z
    .array(WorkspacePackageSchema)
    .parse(JSON.parse(workspacePackagesOutput));

  /**
   * Tags are "v<version>", which is only unique with one public package. More
   * packages need "<name>@<version>" tags, which would break the existing tag
   * history, so fail instead of creating clashing tags
   */
  const publicPackages = workspacePackages.filter(
    ({ private: isPrivate, version }) => !isPrivate && version !== undefined,
  );
  if (publicPackages.length > 1) {
    throw new Error(
      `"v<version>" tags only work with one public package, found ${publicPackages.length}: ${publicPackages.map(({ name }) => name).join(", ")}`,
    );
  }

  const request = createGitHubClient(token);

  const existingTags = new Set(await getExistingTags(request));

  const packagesToRelease = workspacePackages.flatMap(
    ({ name, version, path: packagePath, private: isPrivate }) => {
      if (isPrivate || version === undefined) {
        return [];
      }

      const tag = `v${version}`;

      if (existingTags.has(tag)) {
        info(`Release ${tag} already exists, skipping`);
        return [];
      }

      return [{ name, version, packagePath, tag }];
    },
  );

  await Promise.all(
    packagesToRelease.map(async ({ name, version, packagePath, tag }) => {
      let notes = getReleaseNotes(
        fs.readFileSync(path.join(packagePath, "CHANGELOG.md"), "utf8"),
        version,
      );

      if (notes === "") {
        warning(`No CHANGELOG.md section found for ${name}@${version}`);
        notes = `Release ${name}@${version}`;
      }

      const commit = await getVersionCommit(packagePath, version, sha);

      /**
       * Creates the tag as well, pointing to the released commit. For a draft,
       * the tag is created once the draft is published
       */
      const release = await request({
        method: "POST",
        endpoint: "/releases",
        schema: ReleaseSchema,
        body: {
          tag_name: tag,
          target_commitish: commit,
          name: tag,
          body: notes,
          draft,
        },
      });

      info(`Created ${draft ? "draft " : ""}release ${release.html_url}`);
    }),
  );
} catch (error) {
  setFailed(error instanceof Error ? error.message : String(error));
}
