import { since } from "./since";

export interface taskStatus {
  id: string;
  name: string;
  color: string;
  status: string;
  since: since;
  isCurrent: boolean;
  time: number;
  index: number;
  type: string;
  order: string;
}
