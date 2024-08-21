import { convertEnvToObj, DEFAULT_LANGUAGE } from "../utils";
import { getContent } from "../../src/utils";
import storage, { STORE } from "../../src/utils/storage";
import { GithubApi } from "../utils/GithubApi";

const createGist = () => {
  return {
    async getGist() {
      if (this.gist) return this.gist;
      const gist = await GithubApi().getGist();
      this.gist = gist;
      return gist;
    },
    async fetch() {
      await this.setStorageContent(STORE.env, convertEnvToObj);
      await this.setCurrentLanguage();
      await this.setStorageContent(STORE.tips);
    },
    async setStorageContent(key, converter = (value) => value) {
      const gist = await this.getGist();
      const fileContent = await getContent[key](gist);
      storage.set({ [key]: converter(fileContent) });
    },
    async setCurrentLanguage() {
      const { lang, env } = await storage.get([STORE.lang, STORE.env]);
      if (lang) return;
      storage.set({ [STORE.lang]: env.DEFAULT_LANGUAGE || DEFAULT_LANGUAGE });
    },
    async updateTips() {
      await this.setStorageContent(STORE.tips);
    },
  };
};

export const Gist = createGist();
