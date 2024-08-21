import { ENV } from "../config/constants";
import storage, { STORE } from "./storage";

const CORE_REVIEW_FILE = "CodeReview";
const TIPS_FILE = "Tips";
const CONFIG_ENV = "config";

const getFileContent =
  ({ name, ext = "", withLang = false }) =>
  async (gist) => {
    let fileName = `${name}${ext}`;
    if (withLang) {
      const lang = await getLanguage();
      fileName = `${name}_${lang}${ext}`;
    }

    const { files } = gist;
    const file = files[fileName];
    return file?.content || "";
  };

export const getContent = {
  codeReview: getFileContent({
    name: CORE_REVIEW_FILE,
    ext: ".md",
    withLang: true,
  }),
  tips: getFileContent({
    name: TIPS_FILE,
    ext: ".md",
    withLang: true,
  }),
  env: getFileContent({
    name: CONFIG_ENV,
    ext: ".env",
  }),
};

export const getLanguage = async () => {
  const { lang } = await storage.get([STORE.lang]);
  return lang;
};
