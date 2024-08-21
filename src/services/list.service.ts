import { List } from "../types";
import axios from "axios";

export const fetchListByFolderId = async (
  folderId: string
): Promise<List[]> => {
  const getData = async (folderId: string) => {
    try {
      const res = await axios.get(
        `https://asia-southeast1-ces-insights.cloudfunctions.net/api/bigquery/folder/lists/${folderId}`
      );
      return res.data;
    } catch (error) {
      // Handle errors
    }
  };
  if (!getData(folderId)) return [];
  return getData(folderId);
};
