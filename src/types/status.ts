export interface Status {
  name: string;
  label: string;
  color: string;
  date: number;
  isCurrent: boolean;
  timeInStatus: number;
  type: string;
  order: string;
  index: number;
}

export interface StatusData {
  index: string;
  label: string;
  value: string;
  type: string;
}
