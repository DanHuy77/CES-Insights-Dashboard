export const GITHUB_REPO_REGEX =
  /https:\/\/github.com\/([\w-]+)\/([\w-]+)\/pull\/([\d]+).*/;

const CLICKUP_TASK_REGEX = /((CU|#)(-\w+\b){0,}-\w+\b)$/;

export const DEFAULT_LANGUAGE = "vi";

export const getCurrentTab = async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

export const getTaskIdFromCommit = (commit) => {
  if (!commit) return "";
  const {
    commit: { message },
  } = commit;
  const [taskId] = message.match(CLICKUP_TASK_REGEX);
  if (!taskId) return "";
  return taskId.split("-")[1];
};

export const checkIsGithubUrl = (url) => Boolean(url.match(GITHUB_REPO_REGEX));

export const convertEnvToObj = (envString) => {
  const lines = envString.split("\n");
  return lines.reduce((previous, line) => {
    if (line.startsWith("#")) return previous;
    const [key, value] = line.split("=");
    return {
      ...previous,
      [key]: value,
    };
  }, {});
};
