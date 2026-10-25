import {
  getInput,
  getBooleanInput,
  info,
  warning,
  setFailed,
} from "@actions/core";
import { getExecOutput } from "@actions/exec";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type WorkspacePackage = {
  name: string;
  version?: string;
  path: string;
  private: boolean;
};

type Release = {
  tag_name: string;
  html_url: string;
};

const RELEASES_PER_PAGE = 100;

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} env variable isn't set`);
  }

  return value;
}

/** Minimal GitHub REST API client for the current repository */
function createGitHubClient(token: string) {
  const apiUrl = process.env["GITHUB_API_URL"] ?? "https://api.github.com";
  const repository = getEnv("GITHUB_REPOSITORY");

  return async function request<T>(
    method: "GET" | "POST",
    path: string,
    body?: object,
  ): Promise<T> {
    const response = await fetch(`${apiUrl}/repos/${repository}${path}`, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "create-github-release",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API ${method} ${path} failed with ${response.status}: ${await response.text()}`,
      );
    }

    return (await response.json()) as T;
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
      if (found) break;

      const heading = line.split(/\s+/)[1]?.replace(/[[\]]/g, "");
      if (heading === version) {
        found = true;
        continue;
      }
    }

    if (found) notes.push(line);
  }

  return notes.join("\n").trim();
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
  const workspacePackages: WorkspacePackage[] = JSON.parse(
    workspacePackagesOutput,
  );

  const request = createGitHubClient(token);

  // Includes drafts, which, unlike published releases, may share a tag. The
  // get-release-by-tag endpoint doesn't return drafts, hence the full list
  const existingTags = new Set<string>();

  for (let page = 1; ; page++) {
    const releases = await request<Release[]>(
      "GET",
      `/releases?per_page=${RELEASES_PER_PAGE}&page=${page}`,
    );

    for (const release of releases) {
      existingTags.add(release.tag_name);
    }

    if (releases.length < RELEASES_PER_PAGE) break;
  }

  for (const { name, version, path, private: isPrivate } of workspacePackages) {
    if (isPrivate || !version) continue;

    const tag = `v${version}`;

    if (existingTags.has(tag)) {
      info(`Release ${tag} already exists, skipping`);
      continue;
    }

    let notes = getReleaseNotes(
      readFileSync(join(path, "CHANGELOG.md"), "utf8"),
      version,
    );

    if (!notes) {
      warning(`No CHANGELOG.md section found for ${name}@${version}`);
      notes = `Release ${name}@${version}`;
    }

    // Creates the tag as well, pointing to the released commit. For a draft,
    // the tag is created once the draft is published
    const release = await request<Release>("POST", "/releases", {
      tag_name: tag,
      target_commitish: sha,
      name: tag,
      body: notes,
      draft,
    });

    info(`Created ${draft ? "draft " : ""}release ${release.html_url}`);
  }
} catch (error) {
  setFailed(error instanceof Error ? error.message : String(error));
}
