import { getInput, setOutput, info, setFailed } from "@actions/core";
import { exec, getExecOutput } from "@actions/exec";
import { getOctokit, context } from "@actions/github";

type ReleasePlan = {
  name: string;
  currentVersion: string;
  newVersion: string;
}[];

try {
  const token = getInput("token", { required: true });
  const appSlug = getInput("app-slug", { required: true });
  const base = getInput("base", { required: true });
  const branch = process.env["RELEASE_BRANCH_NAME"];

  if (!branch) {
    throw new Error("RELEASE_BRANCH_NAME env variable isn't set");
  }

  const octokit = getOctokit(token);
  const { owner, repo } = context.repo;

  // Commit as the GitHub App's bot user
  const bot = `${appSlug}[bot]`;
  const { data: botUser } = await octokit.rest.users.getByUsername({
    username: bot,
  });
  await exec("git", ["config", "user.name", bot]);
  await exec("git", [
    "config",
    "user.email",
    `${botUser.id}+${bot}@users.noreply.github.com`,
  ]);
  // Silent, so the command line with the token isn't echoed to the log
  await exec(
    "git",
    [
      "remote",
      "set-url",
      "origin",
      `https://x-access-token:${token}@github.com/${owner}/${repo}.git`,
    ],
    { silent: true },
  );
  await exec("git", ["switch", "-C", branch]);

  const { stdout: planOutput } = await getExecOutput("pnpm", [
    "version",
    "-r",
    "--json",
  ]);
  const plan: ReleasePlan = JSON.parse(planOutput);

  if (plan.length === 0) {
    throw new Error("`pnpm version -r` produced an empty release plan");
  }

  // Format only the files pnpm touched
  await exec("git", ["add", "-A"]);
  const { stdout: changedFilesOutput } = await getExecOutput(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=d", "-z"],
    { silent: true },
  );
  const changedFiles = changedFilesOutput.split("\0").filter(Boolean);

  if (changedFiles.length > 0) {
    await exec("pnpm", ["exec", "oxfmt", ...changedFiles]);
  }

  const title = `chore: release ${plan
    .map(({ name, newVersion }) => `${name}@${newVersion}`)
    .join(", ")}`;

  const body = [
    "Merging this PR publishes the following packages to npm and creates their GitHub releases:",
    "",
    ...plan.map(
      ({ name, currentVersion, newVersion }) =>
        `- \`${name}\`: ${currentVersion} → ${newVersion}`,
    ),
    "",
    `It is updated automatically when new change intents land on \`${base}\`.`,
  ].join("\n");

  await exec("git", ["add", "-A"]);
  await exec("git", ["commit", "-m", title]);
  await exec("git", ["push", "--force", "origin", branch]);

  const { data: pulls } = await octokit.rest.pulls.list({
    owner,
    repo,
    head: `${owner}:${branch}`,
    base,
    state: "open",
  });

  const existing = pulls[0];

  if (existing) {
    await octokit.rest.pulls.update({
      owner,
      repo,
      pull_number: existing.number,
      title,
      body,
    });
    info(`Updated release PR ${existing.html_url}`);
    setOutput("pr-number", existing.number);
  } else {
    const { data: created } = await octokit.rest.pulls.create({
      owner,
      repo,
      head: branch,
      base,
      title,
      body,
    });
    info(`Opened release PR ${created.html_url}`);
    setOutput("pr-number", created.number);
  }
} catch (error) {
  setFailed(error instanceof Error ? error.message : String(error));
}
