import { Task } from "../types";
import axios from "axios";

export const fetchTaskByListId = async (listIds: string[]): Promise<Task[]> => {
  if (!listIds) return [];
  const getData = async (listIds: string[]) => {
    try {
      const res = await axios.get(
        `https://asia-southeast1-ces-insights.cloudfunctions.net/api/bigquery/tasks`, {
          params: {
            listIds: listIds
          }
        }
      );
      return res.data;
    } catch (error) {
      // Handle errors
    }
  };
  if (!getData(listIds)) return [];
  return getData(listIds);
};
