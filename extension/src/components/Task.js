import { cuAjax } from "../utils/ajax";
import storage, { STORE } from "../utils/storage";
import { getCurrentTab } from "../utils/tabs";
import { Loader } from "./Loader";
import { Timer } from "./Timer";
import { Toastify, TYPES } from "./Toastify";

const createTask = () => {
  const $startButton = $("#startButton");
  const $stopButton = $("#stopButton");
  const $runningTaskTimer = $("#runningTaskTimer");
  const $foundCuTask = $("#foundCuTask");
  const $trackingCuTask = $("#trackingCuTask");

  return {
    runningTask: undefined,
    cuTask: undefined,
    wrongWorkspace: false,
    async init() {
      await this.fetchTaskInfo();
      await this.getRunningTracking();

      $startButton.click(async () => {
        if (this.runningTask) {
          await this.stopTracking();
        }
        this.startTracking();
      });
      $stopButton.click(() => this.stopTracking());
    },
    updateTaskDetail(task, $elm) {
      if (!task) return;
      const { url, name, id } = task;
      $elm.attr("href", url).attr("target", "_blank").text(`#${id}-${name}`);
    },
    async getWrongWsContent() {
      const { taskId, workspace } = await storage.get([
        STORE.taskId,
        STORE.workspace,
      ]);
      return `This ticket <b>${taskId}</b> does not belong to workspace <b>${workspace.name}</b>`;
    },
    async updateFoundCuTaskElm() {
      $foundCuTask.show();
      if (!this.cuTask) {
        $foundCuTask.addClass("bg-sky-100");
        $foundCuTask.removeClass("bg-amber-100");
        $foundCuTask.find(".no-task").show();
        $foundCuTask.find(".task-link").hide();
        $foundCuTask.find(".wrong-ws-task").hide();
        $startButton.hide();
        return;
      }

      if (this.wrongWorkspace) {
        const content = await this.getWrongWsContent();
        $foundCuTask.addClass("bg-amber-100");
        $foundCuTask.removeClass("bg-sky-100");
        $foundCuTask.find(".wrong-ws-task").show().html(content);
        $foundCuTask.find(".task-link").hide();
        $foundCuTask.find(".no-task").hide();
        $startButton.hide();
        return;
      }

      this.updateTaskDetail(this.cuTask, $foundCuTask.find(".task-link a"));
      $startButton.show();
      $foundCuTask.addClass("bg-sky-100");
      $foundCuTask.removeClass("bg-amber-100");
      $foundCuTask.find(".task-link").show();
      $foundCuTask.find(".wrong-ws-task").hide();
      $foundCuTask.find(".no-task").hide();
    },
    updateTrackingCuTaskElm() {
      if (!this.runningTask || this.wrongWorkspace) {
        $trackingCuTask.hide();
        Timer.stop();
        return;
      }
      this.updateTaskDetail(
        this.runningTask,
        $trackingCuTask.find(".task-link a")
      );
      $trackingCuTask.show();
    },
    hideFoundCuTaskIfDuplicated() {
      if (
        !this.wrongWorkspace &&
        this.runningTask &&
        this.cuTask &&
        this.runningTask.id === this.cuTask.id
      ) {
        $foundCuTask.hide();
      }
    },
    async updateDisplay() {
      await this.updateFoundCuTaskElm();
      this.updateTrackingCuTaskElm();
      this.hideFoundCuTaskIfDuplicated();
    },
    async fetchTaskInfo() {
      const { taskId, workspace } = await storage.get([
        STORE.taskId,
        STORE.workspace,
      ]);
      if (!taskId) return;
      const data = await cuAjax({
        action: "getTask",
        params: taskId,
      });
      if (!data) return;
      this.wrongWorkspace = data.team_id && data.team_id !== workspace.id;
      this.cuTask = data;
      await this.updateDisplay();
    },
    async getRunningTracking() {
      const { workspace } = await storage.get([STORE.workspace]);
      if (!workspace) return;
      const { data: tracking } = await cuAjax({
        action: "getRunningTimeEntry",
        params: { teamId: workspace.id },
      });
      this.runningTask = tracking && {
        name: tracking.task.name,
        id: tracking.task.id,
        url: tracking.task_url,
      };
      await this.updateDisplay();
      tracking && Timer.start(tracking.start);
    },
    async stopTracking() {
      const { taskId, workspace } = await storage.get([
        STORE.taskId,
        STORE.workspace,
      ]);
      const data = await cuAjax({
        action: "stopTimeEntry",
        params: { teamId: workspace.id },
      });
      if (!data) return;
      this.runningTask = undefined;
      await this.updateDisplay();
      Timer.stop();
      storage.set({ [STORE.trackingTask]: "" });
    },
    async startTracking() {
      const { taskId, workspace } = await storage.get([
        STORE.taskId,
        STORE.workspace,
      ]);
      const data = await cuAjax({
        action: "startTimeEntry",
        params: { taskId, teamId: workspace.id },
      });
      if (!data) return;
      const { data: startTracking } = data;
      this.runningTask = {
        name: startTracking.task.name,
        id: startTracking.task.id,
        url: this.cuTask.url,
      };
      await this.updateDisplay();
      Timer.start(startTracking.start);
      this.setTrackingTaskStore();
    },
    async setTrackingTaskStore() {
      const currentTab = await getCurrentTab();
      storage.set({ [STORE.trackingTask]: currentTab.id });
    },
  };
};

export const Task = createTask();
