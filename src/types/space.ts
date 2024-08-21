import { Folder } from "./folder";
import { List } from "./list";
import { Task } from "./task";

export interface Space {
  name: string;
  type?: string;
  id: string;
  folders?: Folder[];
  lists?: List[];
  tasks?: Task[];
}
