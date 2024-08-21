import { taskStatus } from "../types";
import axios from "axios";

export const fetchTaskStatusByTaskId = async (
  taskIds: string[]
): Promise<taskStatus[]> => {
  const getData = async (taskIds: string[]) => {
    try {
      const res = await axios.get(
        `https://asia-southeast1-ces-insights.cloudfunctions.net/api/bigquery/task-status`,
        {
          params: {
            taskIds: taskIds,
          },
        }
      );
      return res.data;
    } catch (error) {
      // Handle errors
    }
  };
  if (!getData(taskIds)) return [];
  return getData(taskIds);
};
