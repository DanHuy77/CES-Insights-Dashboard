import { ENV } from "../config/constants";
import storage, { STORE } from "../utils/storage";
import { Toastify } from "./Toastify";

const createApikeySetting = () => {
  return {
    async init() {
      await this.initApiKey(STORE.cuApiKey, ENV.CLICKUP_SETTING_URL);
      await this.initApiKey(STORE.ghApiKey, ENV.GITHUB_SETTING_URL);
    },
    async initApiKey(key, settingUrl) {
      const $elm = $(`#${key}`);
      const $saveButton = $elm.find("button");
      const $input = $elm.find("input");
      const $link = $elm.find("a");

      $link.prop("href", settingUrl);

      $saveButton.click(() => {
        storage.set({ [key]: $input.val() });
        Toastify.show();
      });

      const storeValue = await storage.get([key]);
      storeValue[key] && $input.val(storeValue[key]);
    },
  };
};

export const ApiKeySetting = createApikeySetting();
