import {
  getInput,
  setOutput,
  setSecret,
  saveState,
  debug,
  setFailed,
} from "@actions/core";
import { getOctokit, context } from "@actions/github";
import { createAppAuth } from "@octokit/auth-app";

type Permission = "read" | "write";

function getPermissionInput(name: string): Permission {
  const value = getInput(name) || "read";

  if (value !== "read" && value !== "write") {
    throw new Error(`${name} value can be only \`read\` or \`write\``);
  }

  return value;
}

try {
  const clientId = getInput("client-id", { required: true });
  const privateKey = getInput("private-key", { required: true });

  const permissions = {
    contents: getPermissionInput("permission-contents"),
    pull_requests: getPermissionInput("permission-pull-requests"),
  };

  const appAuth = createAppAuth({
    // Accepts the client ID as well, which GitHub recommends over the app ID
    appId: clientId,
    privateKey,
  });

  const authentication = await appAuth({ type: "app" });
  const octokit = getOctokit(authentication.token);

  const { data: installation } = await octokit.rest.apps.getRepoInstallation({
    ...context.repo,
  });

  const { data } = await octokit.rest.apps.createInstallationAccessToken({
    installation_id: installation.id,
    // Without it the token can access every repository of the installation
    repositories: [context.repo.repo],
    permissions,
  });

  // Outputs aren't masked automatically
  setSecret(data.token);

  debug("Auth token has been successfully created");
  saveState("token", data.token);
  setOutput("app-slug", installation.app_slug);
  setOutput("token", data.token);
} catch (error) {
  setFailed(error instanceof Error ? error.message : String(error));
}
