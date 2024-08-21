import storage, { STORE } from "../src/utils/storage";
import { ENV } from "../src/config/constants";
import { GithubApi } from "./utils/GithubApi";
import { ClickupApi } from "./utils/ClickupApi";
import {
  checkIsGithubUrl,
  DEFAULT_LANGUAGE,
  getCurrentTab,
  getTaskIdFromCommit,
  GITHUB_REPO_REGEX,
} from "./utils";
import { Gist, Notifications } from "./components";

const STATUS = {
  complete: "complete",
  loading: "loading",
};

const TIPS_ALARM = "tipsAlarm";

const showNotifications = async (url) => {
  if (!checkIsGithubUrl(url)) return;
  const { taskId, trackingTask } = await storage.get([
    STORE.taskId,
    STORE.trackingTask,
  ]);
  if (!taskId || trackingTask) return;

  Notifications.create();
};

const fetchTaskId = async (url) => {
  const { ghApiKey: apiKey } = await storage.get([STORE.ghApiKey]);
  if (!apiKey) return;

  const ghApi = GithubApi(apiKey);
  const ghPR = await ghApi.getPR(url);
  if (!ghPR) return;
  const { commits_url: commitsUrl } = ghPR;
  const commits = await ghApi.getUrlData(commitsUrl);
  const taskId = getTaskIdFromCommit(commits[0]);
  return taskId;
};

const executingScript = async (tab) => {
  const { taskId } = await storage.get([STORE.taskId]);
  if (!taskId) return;
  await chrome.scripting.insertCSS({
    files: ["styles/toastify.css"],
    target: { tabId: tab.id },
  });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["browser.js"],
  });
};

const createChromeAlarm = async () => {
  await chrome.alarms.clear(TIPS_ALARM);
  const { env } = await storage.get([STORE.env]);
  const { TIPS_PRERIOD: tipsPeriod = 1 } = env;

  await chrome.alarms.create(TIPS_ALARM, {
    delayInMinutes: +tipsPeriod || 1,
    periodInMinutes: +tipsPeriod || 1,
  });

  chrome.alarms.onAlarm.addListener(async () => {
    const tab = await getCurrentTab();
    if (!tab || !checkIsGithubUrl(tab.url)) return;
    await executingScript(tab);
  });
};

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  const taskId = checkIsGithubUrl(tab.url) ? await fetchTaskId(tab.url) : "";
  storage.set({ taskId });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const { status, url } = changeInfo;
  if (status !== STATUS.loading || !url) return;
  const taskId = checkIsGithubUrl(url) ? await fetchTaskId(url) : "";
  storage.set({ taskId });
  if (taskId) await showNotifications(url);
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  const { cuApiKey } = await storage.get([STORE.cuApiKey]);
  const cuApi = ClickupApi(cuApiKey);
  await cuApi.stopTrackingTask(tabId);
});

!(async function init() {
  storage.onChanged(async (changes) => {
    const {
      [STORE.lang]: langChange,
      [STORE.ghApiKey]: ghApiKeyChange,
      [STORE.env]: envChange,
    } = changes;

    if (envChange) {
      await createChromeAlarm();
    }

    if (langChange) {
      await Gist.updateTips();
    }

    if (ghApiKeyChange) {
      const tab = await getCurrentTab();
      if (!tab) return;
      const { url } = tab;
      const taskId = checkIsGithubUrl(url) ? await fetchTaskId(url) : "";
      storage.set({ taskId });
    }
  });

  await Gist.fetch();
})();
