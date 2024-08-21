import { cuAjax } from "../utils/ajax";
import storage, { STORE } from "../utils/storage";
import { Loader } from "./Loader";
import { TABS, Tabs } from "./Tabs";

const styles = {
  workspace:
    "mt-1 py-1 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-sky-700 focus:z-10 focus:ring-4 focus:ring-gray-200",
  active: "bg-sky-700 hover:bg-sky-800 text-white hover:text-white-700",
  inactive: "bg-white hover:bg-gray-100 text-gray-900 hover:text-sky-700",
};

const createWorkspaces = () => {
  const $workspaces = $("#workspaces");
  const $content = $("#workspacesContent");

  return {
    setActive(teamId) {
      if (!teamId) return;
      const $workspace = $(`#${teamId}`);
      if (!$workspace) return;
      $workspace.addClass(styles.active);
      $workspace.removeClass(styles.inactive);
    },
    setInactive(teamId) {
      if (!teamId) return;
      const $workspace = $(`#${teamId}`);
      if (!$workspace) return;
      $workspace.addClass(styles.inactive);
      $workspace.removeClass(styles.active);
    },
    createWorkspace(team) {
      const { id, color, name } = team;
      return $("<button/>")
        .attr("id", id)
        .addClass(styles.workspace)
        .text(name)
        .click(() => {
          storage.set({ [STORE.workspace]: { id, name } });
        });
    },
    hide() {
      $workspaces.addClass("hidden");
    },
    show() {
      $workspaces.removeClass("hidden");
    },
    display({ teams }) {
      if (!teams) return;
      const workspaces = teams.map(this.createWorkspace);

      $workspaces.addClass("flex");
      $workspaces.removeClass("hidden");
      $content.append(workspaces);
    },
    clear() {
      $content.empty();
      storage.set({ [STORE.workspace]: undefined });
    },
    async fetch() {
      const { workspace } = await storage.get([STORE.workspace]);
      let data = await cuAjax({
        action: "getTeams",
      });
      if (data) {
        this.display(data);
        if (data.teams.length === 1) {
          const {
            teams: [autoWorkspace],
          } = data;
          storage.set({ [STORE.workspace]: autoWorkspace });
          this.setActive(autoWorkspace.id);
          return;
        }
        workspace && this.setActive(workspace.id);
        return;
      }
      this.hide();
      this.clear();
      Tabs.disable(TABS.taskInfo);
    },
  };
};

export const Workspaces = createWorkspaces();
