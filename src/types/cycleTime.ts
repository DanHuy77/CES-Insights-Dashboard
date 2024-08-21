import { Task } from "./task";

export interface PlotLineData {
  id: string;
  name: string;
  value: number;
}

export interface Point extends Highcharts.Point {
  z: number;
  data: Task[];
  x: number;
  startDate: Date;
  destroyed: boolean;
}

export type GroupedTasks = [Date, number, number, Task[], Date];
