import jQuery from "../utils/initJquery";
import { Loader } from "../components";
import { ClickupService, GithubService } from "../services";
import storage, { STORE } from "./storage";
import { getCurrentTab } from "./tabs";

$.ajaxSetup({
  beforeSend: () => {
    Loader.show();
  },
  dataFilter: (data) => {
    Loader.hide();
    return data;
  },
});

const callApi =
  ({ service, prepare }) =>
  async ({ action, params }) => {
    const args = await prepare();
    if (!args) return;

    try {
      const result = await service(...args)[action](params);
      return result;
    } catch (error) {
      Loader.hide();
      return;
    }
  };

const prepareApiKey = (key) => async () => {
  const storeValue = await storage.get([key]);
  const apiKey = (storeValue || {})[key];
  return apiKey ? [apiKey] : undefined;
};

export const cuAjax = callApi({
  service: ClickupService,
  prepare: prepareApiKey(STORE.cuApiKey),
});

export const ghAjax = callApi({
  service: GithubService,
  prepare: prepareApiKey(STORE.ghApiKey),
});
