import * as Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { SelectDateRange, DateRange } from "../Common/SelectDateRange";
import { useState, useEffect } from "react";
import { StatusSelector } from "../CycleTimeScatterplot/StatusSelector";
import { Status } from "../../types";
import { Task } from "../../types";
import { PlotLineData } from "../../types/cycleTime";
import { CycleTimeNotification } from "../../types/notification";
import { ChartTypes } from "../../types/chartTypes";

interface Histogram {
  listTask: Task[];
  statuses: Status[];
}

export const Histogram = ({ listTask, statuses }: Histogram) => {
  const [selectedStatuses, setSelectedStatuses] = useState<(string | null)[]>([
    statuses[0].label,
    statuses[statuses.length - 1].label,
  ]);
  const [pickedDate, setPickedDate] = useState<DateRange>({
    startDate: new Date(0),
    endDate: new Date(),
  });
  const [drawChart, setDrawChart] = useState<drawChart>({
    data: [],
    min: null,
    max: null,
  });
  const [plotLineData, setPlotLineData] = useState<PlotLineData[]>([]);
  const [plotLines, setPlotLines] =
    useState<Highcharts.XAxisPlotLinesOptions[]>();
  const [customTickPositions, setCustomTickPositions] = useState<number[]>([]);
  const [notification, setNotification] = useState<string>("");
  const [filteredByStatusesData, setFilteredByStatusesData] = useState<Task[]>(
    []
  );
  const [defaultDateRange, setDefaulDateRange] = useState<ValueType>([
    new Date(0),
    new Date(),
  ]);
  const tasks = listTask;

  useEffect(() => {
    if (!tasks) return;
    const filteredByStatusesData = filterByStatuses(
      tasks,
      selectedStatuses,
      statuses
    );
    const filteredByDateData = filterByDate(filteredByStatusesData);
    setFilteredByStatusesData(filteredByStatusesData);
    setDrawChart({
      data: getData(filteredByDateData),
      min: drawChart.min,
      max: drawChart.max,
    });
    getDefaultTimeRange(filteredByStatusesData);
  }, [tasks, selectedStatuses]);

  useEffect(() => {
    const data = filterByDate(filteredByStatusesData);
    setDrawChart({
      data: getData(data),
      min: drawChart.min,
      max: drawChart.max,
    });
  }, [pickedDate]);

  useEffect(() => {
    if (!drawChart.data?.length) return;

    setNotification("");
    const point50: PlotLineData = {
      id: "1",
      name: "50%",
      value: calculatePlotPoint(50, drawChart.data),
    };
    const point85: PlotLineData = {
      id: "2",
      name: "85%",
      value: calculatePlotPoint(85, drawChart.data),
    };
    const point95: PlotLineData = {
      id: "3",
      name: "95%",
      value: calculatePlotPoint(95, drawChart.data),
    };
    const plotlines = [point50, point85, point95];
    const finalPlotlinedata = [point50];
    plotlines.forEach((plotLine: PlotLineData) => {
      if (
        plotLine.value !== finalPlotlinedata[finalPlotlinedata.length - 1].value
      ) {
        finalPlotlinedata.push(plotLine);
      }
    });
    setPlotLineData(finalPlotlinedata);
    setCustomTickPositions([point50.value, point85.value, point95.value]);
  }, [drawChart.data]);

  useEffect(() => {
    setSelectedStatuses([
      statuses[0].label,
      statuses[statuses.length - 1].label,
    ]);
  }, [listTask, statuses]);

  useEffect(() => {
    if (!plotLineData) return;
    const newPlotLine: Highcharts.XAxisPlotLinesOptions[] = plotLineData.map(
      (item: PlotLineData) => ({
        id: item.id,
        value: item.value, // x-value where the plot line will appear
        color: "black", // Color of the plot line
        width: 1, // Width of the plot line
        zIndex: 2, // Set the zIndex to ensure the plot line is above the chart elements
        label: {
          text: item.value > 0 && drawChart.data.length > 1 ? item.name : "", // Label for the plot line
          align: "right", // Alignment of the label relative to the plot line
          y: -10, // Horizontal offset from the plot line
          x: 10,
          style: {
            fontSize: "13px", // Font size of the label text
          },
          rotation: 0,
        },
        dashStyle: "Dash",
      })
    );

    setPlotLines(newPlotLine);
  }, [plotLineData]);

  const filterByStatuses = (
    tasks: Task[],
    selectedStatus: (string | null)[],
    statuses: Status[]
  ): Task[] =>
    tasks.reduce((filteredTasks: Task[], currentItem: Task) => {
      if (!currentItem.status) return [];

      const beginIndex = statuses.findIndex(
        (status: Status) => status.label === selectedStatus[0]
      );
      const endIndex = statuses.findIndex(
        (status: Status) => status.label === selectedStatus[1]
      );

      const isBeginExisted = currentItem.status.some(
        (status: Status) => status.label === selectedStatus[0]
      );
      const isEndExisted = currentItem.status.some(
        (status: Status) => status.label === selectedStatus[1]
      );

      if (isBeginExisted && isEndExisted) {
        const beginStatus = statuses[beginIndex].label;
        const endStatus = statuses[endIndex].label;
        if (
          currentItem.status[0].label !== beginStatus ||
          currentItem.status[currentItem.status.length - 1].label !== endStatus
        ) {
          const newItem = { ...currentItem };
          const newStatusesLabel = statuses.slice(beginIndex, endIndex + 1);
          const newStatues = currentItem.status.filter((item) => {
            return newStatusesLabel.some(
              (status) => status.label === item.label
            );
          });
          newItem.status = newStatues;
          filteredTasks.push(newItem);
        } else {
          filteredTasks.push(currentItem);
        }
      }
      return filteredTasks;
    }, []);

  const filterByDate = (tasks: Task[]): Task[] => {
    const timeRangeDefaultDate = new Date(0).toLocaleDateString();
    if (!pickedDate) return tasks;
    if (
      pickedDate.startDate.toLocaleDateString() === timeRangeDefaultDate &&
      pickedDate.endDate.toLocaleDateString() === timeRangeDefaultDate
    )
      return tasks;
    const filteredItems: Task[] = tasks.reduce(
      (newTasks: Task[], task: Task) => {
        const completionDate = new Date(
          Math.max(...task.status.map((e: Status) => e.date))
        );
        const finalCompletionDate = new Date(
          completionDate.getFullYear(),
          completionDate.getMonth(),
          completionDate.getDate()
        );
        const finalStartDate = new Date(
          pickedDate.startDate.getFullYear(),
          pickedDate.startDate.getMonth(),
          pickedDate.startDate.getDate()
        );
        const finalEndDate = new Date(
          pickedDate.endDate.getFullYear(),
          pickedDate.endDate.getMonth(),
          pickedDate.endDate.getDate()
        );
        if (
          finalCompletionDate < finalStartDate ||
          finalCompletionDate > finalEndDate
        )
          return newTasks;
        newTasks.push(task);
        return newTasks;
      },
      []
    );
    return filteredItems;
  };

  const handleChangeDateRange = (date: DateRange) => {
    if (!date) return;
    setPickedDate(date);
  };

  const handleSelectStatus = (
    beginStatus: string | null,
    endStatus: string | null
  ) => {
    setSelectedStatuses([beginStatus, endStatus]);
  };

  // Function to calculate cycle time from given dates
  const calculateCycleTime = (doneDate: Date, startDate: Date): number => {
    const millisecondsInDay = 1000 * 60 * 60 * 24;
    return (
      Math.round(
        (doneDate.getTime() - startDate.getTime()) / millisecondsInDay
      ) + 1
    );
  };

  // Function to calculate plot points based on percentile and grouped data
  const calculatePlotPoint = (
    percentile: number,
    data: ChartData[]
  ): number => {
    if (!data.length) return 0;
    let percent = 0;
    let result = 0;

    for (const item of data) {
      percent += item[2];
      if (percent >= percentile) {
        result = item[0];
        break;
      }
    }
    return result;
  };

  const getDefaultTimeRange = (tasks: Task[]) => {
    if (!tasks.length) {
      setDefaulDateRange([new Date(), new Date()]);
      setNotification(CycleTimeNotification.EMPTYDATA);
    } else {
      let minEndDate = new Date();
      let maxEndDate = new Date(0);
      tasks.forEach((task: Task) => {
        const taskStatus = task?.status;
        if (!taskStatus) return;
        const completionDate = new Date(
          Math.max(...taskStatus.map((e: Status) => e.date))
        );
        if (completionDate > maxEndDate) maxEndDate = completionDate;
        if (completionDate < minEndDate) minEndDate = completionDate;
      });
      const defaultDateRange: ValueType = [
        new Date(minEndDate),
        new Date(maxEndDate),
      ];
      setDefaulDateRange(defaultDateRange);
    }
  };

  const getData = (tasks: Task[]): ChartData[] => {
    if (!tasks.length) return [];
    const cycleTimeCounts: CycleTimeCounts = {};
    tasks.forEach((task: Task) => {
      const taskStatus = task?.status;
      if (!taskStatus) return;
      const completionDate = new Date(
        Math.max(...taskStatus.map((e: Status) => e.date))
      );
      const startDate = new Date(
        Math.min(...taskStatus.map((e: Status) => e.date))
      );
      const cycleTime = calculateCycleTime(completionDate, startDate);
      cycleTimeCounts[cycleTime] = (cycleTimeCounts[cycleTime] || 0) + 1;
    });
    const result: ChartData[] = Object.entries(cycleTimeCounts).map(
      ([cycleTime, count]: [string, number]) => [
        parseInt(cycleTime, 10),
        count,
        parseFloat(((count / tasks.length) * 100).toFixed(2)),
      ]
    );
    result.sort((a, b) => a[0] - b[0]);
    return result;
  };

  const tooltipFormatter = function (
    this: Highcharts.TooltipFormatterContextObject
  ): string | undefined {
    if (!this.points) return;
    const point = this.points[0].point as Point;
    const tooltip = `${this.y} items (${point.z}%)
      completed in ${this.x} days`;
    return tooltip;
  };

  const options = {
    chart: {
      type: "column",
      height: 550,
      zoomType: "x",
    },

    plotOptions: {
      column: {
        stacking: "normal",
        color: "#067db7", // Set the color of the columns
        borderRadius: "2px",
        groupPadding: 0.01,
        pointPadding: 0.02,
        pointWidth: 30,
      },
    },
    tooltip: {
      formatter: tooltipFormatter,
      backgroundColor: "rgba(255, 255, 255, 0.85)", // Tooltip background color
      borderColor: "#ccc", // Tooltip border color
      borderRadius: 10, // Tooltip border radius
      style: {
        color: "#333", // Tooltip text color
      },
      shared: true,
    },
    legend: {
      enabled: false, // Hide the legend
    },
    title: {
      text: "Cycle Time Histogram",
      margin: 40,
    },
    xAxis: {
      tickPositioner: function (this: Highcharts.Axis): number[] {
        const defaultPositions = this.tickPositions || []; // Get default tick positions
        return defaultPositions.concat(customTickPositions); // Concatenate default and custom tick positions
      },
      title: {
        text: "Cycle Time (Days)",
        offset: 60,
        style: {
          fontSize: "22px", // Set font size of X-axis title
          color: "black",
        },
      },
      lineColor: "#000", // X-axis border color
      lineWidth: 1, // X-axis border width
      lineDashStyle: "Solid",
      tickInterval: 5,
      gridLineWidth: 1,
      plotLines: plotLines,
    },
    yAxis: {
      title: {
        text: "Frequency (# of Work Items)",
        offset: 60,
        style: {
          fontSize: "22px", // Set font size of X-axis title
          color: "black",
        },
      },
      lineColor: "#000", // X-axis border color
      lineWidth: 1, // X-axis border width
      lineDashStyle: "Solid",
      tickInterval: 1,
    },
    series: [
      {
        name: "Frequency",
        keys: ["x", "y", "z"],
        data: drawChart.data,
      },
    ],
    exporting: {
      buttons: {
        contextButton: {
          x: 10,
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS",
          ],
        },
      },
    },
  };

  return (
    <>
      <hr />
      {!!tasks.length && (
        <>
          <StatusSelector
            selectStatusCallBack={handleSelectStatus}
            dataStatuses={statuses}
            notification={notification}
          />
          <hr />
          <SelectDateRange
            defaultDateRangeValue={defaultDateRange}
            chartType={ChartTypes.CYCLETIME}
            setDateRangeCallBack={handleChangeDateRange}
          />
        </>
      )}
      <HighchartsReact highcharts={Highcharts} options={options} />
    </>
  );
};

interface CycleTimeCounts {
  [cycleTime: number]: number;
}

interface Point extends Highcharts.Point {
  z: number;
}

type ChartData = [number, number, number];

interface drawChart {
  data: ChartData[];
  min: number | unknown;
  max: number | unknown;
}
