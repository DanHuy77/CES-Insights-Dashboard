import { ENV } from "../config/constants";
import jQuery from "../utils/initJquery";

const BASE_URL = ENV.CLICKUP_API_URL;

export const ClickupService = (apiKey) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: apiKey,
  };

  return {
    getTask(taskId) {
      return $.ajax({
        url: `${BASE_URL}/task/${taskId}`,
        headers,
      });
    },
    getTeams() {
      return $.ajax({
        url: `${BASE_URL}/team`,
        headers,
      });
    },
    getRunningTimeEntry({ teamId }) {
      return $.ajax({
        method: "GET",
        url: `${BASE_URL}/team/${teamId}/time_entries/current`,
        headers,
      });
    },
    startTimeEntry({ teamId, taskId }) {
      return $.ajax({
        method: "POST",
        url: `${BASE_URL}/team/${teamId}/time_entries/start`,
        headers,
        data: JSON.stringify({
          description: "code review",
          tid: taskId,
          billable: false,
        }),
      });
    },
    stopTimeEntry({ teamId }) {
      return $.ajax({
        method: "POST",
        url: `${BASE_URL}/team/${teamId}/time_entries/stop`,
        headers,
      });
    },
  };
};
