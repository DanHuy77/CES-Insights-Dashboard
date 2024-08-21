import { statusClickup } from "../components/Common/SelectSpace";
import { Task } from "./task";

export interface List {
  name: string;
  type: string;
  id: string;
  tasks?: Task[];
  statuses?: statusClickup[];
}