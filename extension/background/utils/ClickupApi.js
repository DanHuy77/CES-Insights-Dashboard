import { ENV } from "../../src/config/constants";
import storage, { STORE } from "../../src/utils/storage";

export const ClickupApi = (apiKey) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: apiKey,
  };

  return {
    async stopTrackingTask(removedTabId) {
      const { trackingTask, workspace } = await storage.get([
        STORE.trackingTask,
        STORE.workspace,
      ]);
      if (!trackingTask || !workspace || trackingTask !== removedTabId) return;

      await fetch(
        `${ENV.CLICKUP_API_URL}/team/${workspace.id}/time_entries/stop`,
        {
          method: "POST",
          headers,
        }
      );
    },
  };
};

export const stopTrackingTask = async (removedTabId) => {};
