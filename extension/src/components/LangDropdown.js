import storage, { STORE } from "../utils/storage";
import { Toastify } from "./Toastify";

const createLangDropdown = () => {
  const $container = $("#langContainer");
  const $button = $("#langButton");
  const $value = $("#lang");
  const $dropdown = $("#langDropdown");
  return {
    value: undefined,
    show: false,
    async updateDisplay() {
      $value.text(this.value);
      $dropdown
        .find(`input:not([name='${this.value}'])`)
        .prop("checked", false);
    },
    toggle() {
      this.show = !this.show;
      const action = this.show ? "removeClass" : "addClass";
      $dropdown[action]("hidden");
    },
    close() {
      this.show = false;
      $dropdown.addClass("hidden");
    },
    async init() {
      const { lang } = await storage.get([STORE.lang]);
      this.value = lang;

      const $selectedOption = $dropdown.find(`input[name='${this.value}']`);
      $selectedOption.prop("checked", true);
      await this.updateDisplay();

      $button.click(() => this.toggle());
      $dropdown.find("input[type=radio]").change(async (e) => {
        this.value = e.target.value;
        storage.set({ [STORE.lang]: this.value });
        await this.updateDisplay();
        this.close();
        Toastify.show();
      });
    },
  };
};

export const LangDropdown = createLangDropdown();
