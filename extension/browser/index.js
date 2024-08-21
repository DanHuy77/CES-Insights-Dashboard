import Toastify from "toastify-js";
import { ENV } from "../src/config/constants";
import storage, { STORE } from "../src/utils/storage";
import { convertToHtml } from "../src/utils/markdown";

const getTip = (tips, period) => {
  if (!tips) return "";
  const lines = tips.split("\n\n");
  const currentSecond = new Date().getTime() / 1000;
  const posByTime = Math.floor(currentSecond / (period * 60)) % lines.length;
  return lines[posByTime];
};

const createContent = (tip) => {
  const content = document.createElement("div");
  content.innerHTML = convertToHtml(tip);
  return content;
};

!(async function init() {
  const { tips, env } = await storage.get([STORE.tips, STORE.env]);
  const { TIPS_PRERIOD: tipsPeriod = 1, TIPS_DURATION: tipsDuration = 1 } = env;
  const tip = getTip(tips, +tipsPeriod);
  if (tip) {
    const toast = Toastify({
      node: createContent(tip),
      duration: +tipsDuration * 1000,
      position: "center",
      close: true,
      className: "noti",
      style: {
        background: "#0284c7",
        fontSize: "16px",
      },
    });
    toast.showToast();
  }
})();
