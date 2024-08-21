export const TABS = {
  setting: "setting",
  taskInfo: "taskInfo",
};

const styles = {
  active:
    "text-sky-600 border-sky-600 active dark:text-sky-500 dark:border-sky-500",
  inactive:
    "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300",
  disable: "pointer-events-none opacity-25",
  enable: "pointer-events-auto opacity-100",
};

const createTabs = () => {
  const $tabsContent = $("#tabsContent");

  return {
    currentTab: TABS.setting,
    init() {
      Object.values(TABS).forEach((tab) => {
        $(`#${tab}Tab`).click(() =>
          this.selectTab($(`#${tab}Tab`).data("tab"))
        );
      });
      this.disable(TABS.taskInfo);
      this.selectTab(this.currentTab);
    },
    setActive(tab) {
      $(`#${tab}Tab`).addClass(styles.active);
      $(`#${tab}Tab`).removeClass(styles.inactive);
      $(`#${tab}`).removeClass("hidden");
    },
    setInactive(tab) {
      $(`#${tab}Tab`).removeClass(styles.active);
      $(`#${tab}Tab`).addClass(styles.inactive);
      $(`#${tab}`).addClass("hidden");
    },
    selectTab(tab) {
      this.setInactive(this.currentTab);
      this.setActive(tab);
      this.currentTab = tab;
    },
    disable(tab) {
      $(`#${tab}Tab`).addClass(styles.disable);
      $(`#${tab}Tab`).removeClass(styles.enable);
    },
    enable(tab) {
      $(`#${tab}Tab`).addClass(styles.enable);
      $(`#${tab}Tab`).removeClass(styles.disable);
    },
  };
};

export const Tabs = createTabs();
