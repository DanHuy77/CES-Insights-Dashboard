export const STORE = {
  cuApiKey: "cuApiKey",
  ghApiKey: "ghApiKey",
  taskId: "taskId",
  workspace: "workspace",
  trackingTask: "trackingTask",
  lang: "lang",
  tips: "tips",
  env: "env",
};

export default {
  set: (data) => chrome.storage.sync.set(data),
  get: (data) => chrome.storage.sync.get(data),
  onChanged: (event) => chrome.storage.onChanged.addListener(event),
};
