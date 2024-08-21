import { SVGElement } from "highcharts";

export interface TaskAging {
  [key: string]: string | number | undefined;
}

export type Workflows = string[];

export interface PercentageResult {
  percentage: number;
  totalAge: number;
}

export interface PercentageEachTask {
  name: string;
  percentages: number[];
}

export interface DrawPercentageEachTask {
  data: [number, number][];
  type: string;
  fillColor: string;
  lineWidth: number;
  marker: {
    enabled: boolean;
  };
  zIndex: number;
  showInLegend: boolean;
  enableMouseTracking: boolean;
}

export interface CountWIP {
  name: string;
  countWIP: number;
}

export interface DataRender {
  startDate: string;
  totalAge: number;
  currentStatus: string;
  data: TaskAging[];
  count: number | null;
}

export interface SeriesData {
  x: number;
  y: number;
  startDate: string;
  count: number | null;
  data: TaskAging[];
}

export interface Series {
  name: string;
  zIndex: number;
  data: SeriesData[];
}

export interface ChartRender {
  data: DataRender[];
  series: Series[];
  percentages: PercentageEachTask[]; 
  colors: string[];
  desiredPercentages: PercentageResult[]; 
  plotCountWIP: {
    value: number;
    width: number;
    zIndex: number;
    label: {
      text: string;
      align: string;
      style: {
        color: string;
        fontSize: string;
      };
      rotation: number;
      y: number;
    };
  }[];
  plotLines: {
    dashStyle: string;
    width: number;
    value: number;
    zIndex: number;
    label: {
      text: string;
      align: string;
      x: number;
      y: number;
      style: {
        color: string;
        fontSize: string;
      };
    };
  }[];
}

export interface Point extends Highcharts.Point {
  startDate: string;
  data: TaskAging[];
  destroyed: boolean;
}

export interface Label extends SVGElement {
  box: SVGElement;
}
