import ToastifyJS from "toastify-js";

const DEFAULT_TEXT = "Saved";

export const TYPES = {
  info: "Info",
  error: "Error",
};

const CONFIG = {
  info: { style: { background: "#0369a1" } },
  error: { style: { background: "#be123c" } },
};

const createToastify = () => {
  const generateCallbacks = (scope) => {
    return Object.entries(TYPES).reduce(
      (prev, [type, label]) => ({
        ...prev,
        [`show${label}`]: (message) => scope.show({ text: message, type }),
      }),
      {}
    );
  };

  const module = {
    toastify: undefined,
    config: { duration: 3000 },
    show({ text, type } = { type: TYPES.info }) {
      this.toastify = ToastifyJS({
        ...this.config,
        ...(CONFIG[type] || {}),
        text: text || DEFAULT_TEXT,
      });
      this.toastify.showToast();
    },
    hide() {
      this.toastify.hideToast();
      this.toastify = undefined;
    },
  };

  return {
    ...module,
    ...generateCallbacks(module),
  };
};

export const Toastify = createToastify();
