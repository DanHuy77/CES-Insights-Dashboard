import {
  ApiKeySetting,
  LangDropdown,
  TABS,
  Tabs,
  Task,
  Workspaces,
} from "./components";
import { Loader } from "./components/Loader";
import jQuery from "./utils/initJquery";
import storage, { STORE } from "./utils/storage";

storage.onChanged(async (changes) => {
  const {
    [STORE.cuApiKey]: cuApiKeyChange,
    [STORE.ghApiKey]: ghApiKeyChange,
    [STORE.workspace]: workspaceChange,
    [STORE.taskId]: taskIdChange,
  } = changes;
  if (cuApiKeyChange) {
    await Workspaces.fetch();
  }

  if (workspaceChange) {
    Workspaces.setInactive(workspaceChange.oldValue?.id);
    Workspaces.setActive(workspaceChange.newValue?.id);
    workspaceChange.newValue && Tabs.enable(TABS.taskInfo);
    await Task.init();
  }

  if (taskIdChange) {
    await Task.init();
  }
});

$(async () => {
  Tabs.init();
  await LangDropdown.init();

  const { workspace } = await storage.get([STORE.workspace]);
  if (workspace) {
    Tabs.enable(TABS.taskInfo);
    Tabs.selectTab(TABS.taskInfo);
  }

  await ApiKeySetting.init();
  await Workspaces.fetch();
  await Task.init();
});
