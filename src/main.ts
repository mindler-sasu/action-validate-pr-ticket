import * as core from "@actions/core";
import * as github from "@actions/github";
import { parseConfig } from "./parseConfig";
import { validatePrTitle } from "./validatePrTitle";
async function run(): Promise<void> {
  try {
    const { githubBaseUrl, ignoreLabels, teams } = parseConfig();
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
    const commits = [];

    for await (const response of client.paginate.iterator(
      client.rest.pulls.listCommits,
      {
        owner,
        repo,
        pull_number: contextPullRequest.number,
      }
    )) {
      commits.push(...response.data);
    }
    const nonMergeCommits = commits.filter((commit) => {
      if (!commit) return false;
      return commit.parents.length < 2;
    });

    const textsToValidate = [
      pullRequest.title,
      pullRequest.head.ref,
      ...nonMergeCommits.map((commit) => commit.commit.message.trim()),
    ];
    core.debug(JSON.stringify(textsToValidate));

    const isLinkingTicket = textsToValidate.some((text) => {
      return validatePrTitle(text, {
        ignoreLabels,
        teams,
      });
    });
    core.debug(
      JSON.stringify({ strings: textsToValidate, isLinking: isLinkingTicket })
    );

    const newStatus = isLinkingTicket ? "success" : "pending";

    await client.request("POST /repos/:owner/:repo/statuses/:sha", {
      owner,
      repo,
      sha: pullRequest.head.sha,
      state: newStatus,
      target_url: "https://github.com/mindler-sasu/action-validate-pr-ticket",
      description: isLinkingTicket
        ? "Ready for review & merge."
        : "Ticket not referenced in pull request!",
      context: "action-validate-pr-ticket",
    });
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
