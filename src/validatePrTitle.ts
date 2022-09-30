import * as core from "@actions/core";
type ValidateOptions = {
  teams: string[];
  ignoreLabels: string[];
};

export const validatePrTitle = (
  inputTitle: string,
  options: ValidateOptions
): boolean => {
  const cleaned = inputTitle.replaceAll(/\n/g, "").trim();
  const ignoreLabels = options.ignoreLabels;
  const ignored = ignoreLabels.some((label) => cleaned.includes(`[${label}]`));
  if (ignored) {
    core.info("ignored");
    return true;
  }

  const regex = new RegExp(
    options.teams.reduce((builtRegex, team, i) => {
      return `${builtRegex}${i !== 0 ? "|" : ""}${team}`;
    }, "(") + ")[\\-_\\s][0-9]+",
    "gi"
  );
  const matches = cleaned.match(regex);
  core.info(
    `${regex}: ${cleaned}. Matches: ${matches} AcualMatch: ${!!matches}`
  );
  return !!matches;
};
