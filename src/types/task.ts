import { Status } from "./status";

export interface Task {
  name: string;
  id: string;
  status: Status[];
  dateCreated: {
    value: string;
  };
  dateUpdated: {
    value: string;
  };
}