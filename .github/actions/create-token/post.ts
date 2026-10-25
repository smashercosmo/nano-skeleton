import { getState, warning, info } from "@actions/core";
import { getOctokit } from "@actions/github";

const token = getState("token");

// The main step failed before creating a token
if (token) {
  try {
    const octokit = getOctokit(token);
    await octokit.rest.apps.revokeInstallationAccessToken();
    info("Token revoked");
  } catch (error) {
    warning(error instanceof Error ? error.message : String(error));
  }
}
