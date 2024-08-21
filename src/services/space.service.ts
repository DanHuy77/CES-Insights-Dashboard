import { Space } from "../types";
import axios from "axios";

export const fetchSpaces = async (): Promise<Space[]> => {
  const getData = async () => {
    try {
      const res = await axios.get(`https://asia-southeast1-ces-insights.cloudfunctions.net/api/bigquery/spaces`);
      return res.data;
    } catch (error) {
      // Handle errors
    }
  };
  if (!getData()) return [];
  return getData();
};
