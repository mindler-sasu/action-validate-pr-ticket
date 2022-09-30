const ENUM_SPLIT_REGEX = /[,\s]\s*/;
const DEFAULT_IGNORE_LABELS = [
  "ninja",
  "chore",
  "running with scissors",
  "fire",
];

export const parseConfig = (): {
  wip?: string;
  githubBaseUrl?: string;
  ignoreLabels: string[];
  teams: string[];
} => {
  const wip = process.env.INPUT_WIP;
  const githubBaseUrl = process.env.INPUT_GITHUBBASEURL;
  const ignoreLabels = [
    ...new Set(
      (process.env.INPUT_IGNORELABELS ?? "")
        .split(ENUM_SPLIT_REGEX)
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .concat(DEFAULT_IGNORE_LABELS)
    ),
  ];

  const teams = [
    ...new Set(
      (process.env.INPUT_TEAMS ?? "")
        .split(ENUM_SPLIT_REGEX)
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
    ),
  ];

  return {
    wip,
    githubBaseUrl,
    ignoreLabels,
    teams,
  };
};
