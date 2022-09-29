import * as core from "@actions/core";
import * as github from "@actions/github";
import { parseConfig } from "./parseConfig";
import { validatePrTitle } from "./validatePrTitle";
async function run(): Promise<void> {
  try {
    core.info("blblblbl, running shit");
    const { githubBaseUrl, ignoreLabels, wip, teams } = parseConfig();
    const client = github.getOctokit(process.env.GITHUB_TOKEN || "", {
      baseUrl: githubBaseUrl,
    });

    const contextPullRequest = github.context.payload.pull_request;
    if (!contextPullRequest) {
      throw new Error(
        "This action can only be invoked in `pull_request_target` or `pull_request` events. Otherwise the pull request can't be inferred."
      );
    }
    const owner = contextPullRequest.base.user.login;
    const repo = contextPullRequest.base.repo.name;

    // The pull request info on the context isn't up to date. When
    // the user updates the title and re-runs the workflow, it would
    // be outdated. Therefore fetch the pull request via the REST API
    // to ensure we use the current title.
    const { data: pullRequest } = await client.rest.pulls.get({
      owner,
      repo,
      pull_number: contextPullRequest.number,
    });
    let validationError;
    const isWip = wip && /^\[WIP\]\s/.test(pullRequest.title);

    if (ignoreLabels) {
      const labelNames = pullRequest.labels.map((label) => label.name);
      for (const labelName of labelNames) {
        if (ignoreLabels.includes(labelName)) {
          core.info(
            `Validation was skipped because the PR label "${labelName}" was found.`
          );
          return;
        }
      }
    }
    try {
      await validatePrTitle(pullRequest.title, {
        ignoreLabels,
        teams,
      });
    } catch (error) {
      validationError = error;
    }
    const newStatus = isWip || validationError != null ? "pending" : "success";

    const wat = await client.request("POST /repos/:owner/:repo/statuses/:sha", {
      owner,
      repo,
      sha: pullRequest.head.sha,
      state: newStatus,
      target_url: "https://github.com/mindler-sasu/blbllb",
      description: isWip
        ? 'This PR is marked with "[WIP]".'
        : validationError
        ? "PR title validation failed"
        : "Ready for review & merge.",
      context: "action-ticketed-pull-request",
    });
    core.info(JSON.stringify(wat.data));
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
