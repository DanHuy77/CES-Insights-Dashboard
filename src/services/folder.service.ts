import { Folder } from "../types";
import axios from "axios";

export const fetchFolderBySpaceId = async (
  spaceId: string
): Promise<Folder[]> => {
  const getData = async (spaceId: string) => {
    try {
      const res = await axios.get(
        `https://asia-southeast1-ces-insights.cloudfunctions.net/api/bigquery/folders/${spaceId}`
      );
      return res.data;
    } catch (error) {
      // Handle errors
    }
  };
  if (!getData(spaceId)) return [];
  return getData(spaceId);
};
