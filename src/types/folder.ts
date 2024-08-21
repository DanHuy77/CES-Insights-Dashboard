import { List } from "./list";

export interface Folder {
  name: string;
  type?: string;
  id: string;
  lists?: List[];
}
