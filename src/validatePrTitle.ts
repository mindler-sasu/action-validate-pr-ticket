type ValidateOptions = {
  teams: string[];
  ignoreLabels: string[];
};

export const validatePrTitle = async (
  inputTitle: string,
  options: ValidateOptions
): Promise<boolean> => {
  const cleaned = inputTitle.replaceAll(/\n/g, "").trim();
  const ignoreLabels = options.ignoreLabels;
  const ignored = ignoreLabels.some((label) => cleaned.includes(`[${label}]`));
  if (ignored) return true;

  const regex = new RegExp(
    options.teams.reduce((builtRegex, team, i) => {
      return `${builtRegex}${i !== 0 ? "|" : ""}${team}`;
    }, "(") + ")[\\-_\\s][0-9]+",
    "gi"
  );
  const matches = cleaned.match(regex);
  return !!matches;
};
