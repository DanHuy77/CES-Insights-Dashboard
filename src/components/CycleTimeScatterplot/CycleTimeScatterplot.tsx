import * as Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { DateRange, SelectDateRange } from "../Common/SelectDateRange";
import { useState, useEffect, useCallback, useRef } from "react";
import { StatusSelector } from "./StatusSelector";
import HighchartsAccessibility from "highcharts/modules/accessibility";
import { Chart as HighchartsChart } from "highcharts";
import { Tooltip } from "../AgingWorkItemsChart/Tooltip";
import "./cycleTimeStyle.css";
import { ChartTypes } from "../../types/chartTypes";
import { Status } from "../../types";
import { Task } from "../../types";
import { PlotLineData, Point, GroupedTasks } from "../../types/cycleTime";
import { CycleTimeNotification } from "../../types/notification";

HighchartsAccessibility(Highcharts);

interface CycleTimeScatterplot {
  listTask: Task[];
  statuses: Status[];
}

export const CycleTimeScatterplot = ({
  listTask,
  statuses,
}: CycleTimeScatterplot) => {
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
  const [plotLines, setPlotLines] = useState<
    Highcharts.YAxisPlotLinesOptions[]
  >([]);
  const [customTickPositions, setCustomTickPositions] = useState<number[]>([]);
  const [hoverPoint, setHoverPoint] = useState<Point>();
  const [task, setTask] = useState<Task>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chart, setChart] = useState<HighchartsChart | null>(null);
  const [notification, setNotification] = useState<string>("");
  const [filteredByStatusesData, setFilteredByStatusesData] = useState<Task[]>(
    []
  );
  const [defaultDateRange, setDefaulDateRange] = useState<ValueType>([
    new Date(0),
    new Date(),
  ]);
  const chartComponent = useRef<HighchartsReact.RefObject>(null);
  const tasks = listTask;

  useEffect(() => {
    if (chart && Object.keys(chart).length) return;

    const chartReload = chartComponent.current?.chart;
    if (!chartReload) return;

    setChart(chartReload);
  }, [chart]);

  useEffect(() => {
    if (chart && Object.keys(chart).length) return;

    const chartReload = chartComponent.current?.chart;
    if (!chartReload) return;

    setChart(chartReload);
  }, [chart]);

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

    if (!chart) return;

    const xAxisExtremes = chart.xAxis[0].getExtremes();
    setDrawChart({
      data: drawChart.data,
      min: !xAxisExtremes.dataMin
        ? xAxisExtremes.dataMin
        : xAxisExtremes.dataMin -
          (xAxisExtremes.dataMax - xAxisExtremes.dataMin) / 8,
      max: !xAxisExtremes.dataMax
        ? xAxisExtremes.dataMax
        : xAxisExtremes.dataMax +
          (xAxisExtremes.dataMax - xAxisExtremes.dataMin) / 8,
    });
  }, [drawChart.data]);

  useEffect(() => {
    setSelectedStatuses([
      statuses[0].label,
      statuses[statuses.length - 1].label,
    ]);
  }, [listTask, statuses]);

  useEffect(() => {
    if (!plotLineData) return;
    const newPlotLine: Highcharts.YAxisPlotLinesOptions[] = plotLineData.map(
      (item: PlotLineData) => ({
        id: item.id,
        value: item.value, // x-value where the plot line will appear
        color: "black", // Color of the plot line
        width: 1, // Width of the plot line
        zIndex: 2, // Set the zIndex to ensure the plot line is above the chart elements
        label: {
          text: item.value >= 1 && drawChart.data.length > 1 ? item.name : "", // Label for the plot line
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

  useEffect(() => {
    if (!tasks) return;
    const filteredByStatusesData = filterByStatuses(
      tasks,
      selectedStatuses,
      statuses
    );
    const filteredByDateData = filterByDate(filteredByStatusesData);
    setFilteredByStatusesData(filteredByStatusesData);
    if (isOpen) {
      setIsOpen(false);
    }
    setDrawChart({
      data: getData(filteredByDateData),
      min: drawChart.min,
      max: drawChart.max,
    });
    getDefaultTimeRange(filteredByStatusesData);
  }, [tasks, selectedStatuses]);

  useEffect(() => {
    const filteredByDateData = filterByDate(filteredByStatusesData);
    setDrawChart({
      data: getData(filteredByDateData),
      min: drawChart.min,
      max: drawChart.max,
    });
  }, [pickedDate]);

  const handleSelectStatus = (
    beginStatus: string | null,
    endStatus: string | null
  ) => {
    setSelectedStatuses([beginStatus, endStatus]);
  };

  const handleChangeDateRange = (date: DateRange) => {
    if (!date) return;
    setPickedDate(date);
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
      percent += item[5];
      if (percent >= percentile) {
        result = item[1];
        break;
      }
    }
    return result;
  };

  const dateFormatter = (value: string | number | Date): string => {
    const localDate = new Date(value);
    return Highcharts.dateFormat(
      "%Y-%m-%d",
      Date.UTC(
        localDate.getUTCFullYear(),
        localDate.getUTCMonth(),
        localDate.getUTCDate()
      )
    );
  };

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

  // Function to group tasks by completion date and cycle time
  const getData = (tasks: Task[]): ChartData[] => {
    if (!tasks.length) return [];

    const groupedTasks: GroupedTasks[] = tasks.reduce(
      (groupedTasks: GroupedTasks[], task: Task) => {
        const completionDate = new Date(
          Math.max(...task.status.map((e: Status) => e.date))
        );
        const startDate = new Date(
          Math.min(...task.status.map((e: Status) => e.date))
        );
        const cycleTime = calculateCycleTime(completionDate, startDate);

        const finalCompletionDate = new Date(
          completionDate.setHours(7, 0, cycleTime)
        );
        const finalStartDate = new Date(startDate.setHours(7, 0, cycleTime));

        const existingItem = groupedTasks.find(
          (item: GroupedTasks) =>
            item[0].toLocaleDateString() ===
              finalCompletionDate.toLocaleDateString() && item[1] === cycleTime
        );
        if (existingItem) {
          existingItem[2]++;
          existingItem[3].push(task); // Push the task object to the existing item
        } else {
          groupedTasks.push([
            finalCompletionDate,
            cycleTime,
            1,
            [task],
            finalStartDate,
          ]);
        }
        return groupedTasks;
      },
      []
    );

    const chartData: ChartData[] = groupedTasks
      .reduce((chartData: ChartData[], item: GroupedTasks) => {
        const percentage = parseFloat(
          ((item[2] / tasks.length) * 100).toFixed(2)
        );
        chartData.push([...item, percentage]);
        return chartData;
      }, [])
      .sort((a: ChartData, b: ChartData) => a[1] - b[1]);

    return chartData;
  };

  const filterByStatuses = (
    tasks: Task[],
    selectedStatuses: (string | null)[],
    statuses: Status[]
  ): Task[] =>
    tasks.reduce((filteredTasks: Task[], currentItem: Task) => {
      if (!currentItem.status) return [];

      currentItem.status.sort((a: Status, b: Status) => a.index - b.index);
      const beginIndex = statuses.findIndex(
        (status: Status) => status.label === selectedStatuses[0]
      );
      const endIndex = statuses.findIndex(
        (status: Status) => status.label === selectedStatuses[1]
      );

      const isBeginExisted = currentItem.status.some(
        (status: Status) => status.label === selectedStatuses[0]
      );
      const isEndExisted = currentItem.status.some(
        (status: Status) => status.label === selectedStatuses[1]
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

  const convertMinutes = (num: number) => {
    const days = Math.floor(num / 1440); // 60*24
    const hours = Math.floor((num - days * 1440) / 60);
    const minutes = Math.round(num % 60);

    if (days > 0) {
      return days + " days, " + hours + " hours, " + minutes + " minutes";
    } else {
      return hours + " hours, " + minutes + " minutes";
    }
  };

  const tooltipCallback = useCallback((chart: HighchartsChart) => {
    setChart(chart);
  }, []);

  const handleClosePopup = () => {
    setIsOpen(false);
  };

  const tooltipEvent = (
    formatterContext: Highcharts.TooltipFormatterContextObject
  ) => {
    const { point } = formatterContext;

    const handleClick = (task: Task, point: Point) => {
      setIsOpen(true);
      setTask(task);
      setHoverPoint(point);
    };

    if ((point as Point).destroyed) return <></>;
    return (
      <>
        {
          <>
            <div className="start-date">
              <div>
                <span>
                  <b>Begin Date: </b>
                  {dateFormatter((point as Point).startDate)}
                  <br />
                  <b>End Date: </b>
                  {dateFormatter((point as Point).x)}
                  <br />
                  <b>Cycle Time: </b> {point.y}
                </span>
              </div>
            </div>
            <div className="cycleTime-tasks">
              {(point as Point).data.map((task) => (
                <div
                  key={task.id}
                  className="task"
                  onClick={() => handleClick(task, point as Point)}
                >
                  <p className="task-id">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 16 16"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#067DB7"
                    >
                      <circle cx="8" cy="8" r="8" />
                    </svg>
                    <span>{task.id}</span>
                  </p>
                </div>
              ))}
            </div>
          </>
        }
      </>
    );
  };

  const options = {
    chart: {
      type: "scatter",
      zoomType: "xy",
      height: 600,
    },
    legend: {
      enabled: false,
    },
    title: {
      text: "Cycle Time Scatterplot",
      align: "center",
      margin: 50,
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Completion Date",
        offset: 120,
        style: {
          fontSize: "18px", // Set font size of X-axis title
          color: "black",
        },
      },
      lineColor: "#000", // X-axis border color
      lineWidth: 1, // X-axis border width
      lineDashStyle: "Solid",
      labels: {
        formatter(this: Highcharts.AxisLabelsFormatterContextObject): string {
          return dateFormatter(this.value);
        },
      },
      legend: {
        enabled: false,
      },
      showLastLabel: true,
      gridLineWidth: 1,
      min: drawChart.min,
      max: drawChart.max,
      tickInterval: 2 * 24 * 3600 * 1000,
    },
    yAxis: {
      tickPositioner: function (this: Highcharts.Axis): number[] {
        const defaultPositions = this.tickPositions || []; // Get default tick positions
        const allPositions = defaultPositions.concat(customTickPositions); // Concatenate default and custom tick positions
        allPositions.sort(function (a: number, b: number) {
          return a - b;
        });
        return allPositions;
      },
      title: {
        text: "Cycle Time (Days)",
        offset: 60,
        style: {
          fontSize: "18px", // Set font size of X-axis title
          color: "black",
        },
      },
      lineColor: "#000", // X-axis border color
      lineWidth: 1, // X-axis border width
      lineDashStyle: "Solid",
      labels: {
        format: "{value}",
      },
      plotLines: plotLines,
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          formatter: function (
            this: Highcharts.PointLabelObject
          ): number | string {
            return (this.point as Point)?.z && (this.point as Point).z > 1
              ? (this.point as Point).z
              : "";
          },
          padding: -4.4,
        },
        color: "#067db7",
      },
      scatter: {
        marker: {
          radius: 7,
          symbol: "circle",
          states: {
            hover: {
              enabled: true,
              lineColor: "rgb(100,100,100)",
            },
          },
        },
        states: {
          hover: {
            marker: {
              enabled: false,
            },
          },
        },
        jitter: {
          x: 0.005,
        },
        stacking: "normal",
      },
    },
    series: [
      {
        name: "Done Date",
        marker: {
          symbol: "circle",
        },
        keys: ["x", "y", "z", "data", "startDate"],
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
      {!!tasks.length && (
        <>
          <hr />
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
      <HighchartsReact
        ref={chartComponent}
        highcharts={Highcharts}
        options={options}
        callback={tooltipCallback}
      />
      <Tooltip chart={chart} chartTypes={ChartTypes.CYCLETIME}>
        {tooltipEvent}
      </Tooltip>
      {isOpen && task && (
        <div className="cycleTime-popup">
          <div className="popup-title">
            <p>Work Item Details</p>
            <button className="popup-close" onClick={() => handleClosePopup()}>
              X
            </button>
          </div>
          <div className="popup-infor">
            <p>
              <b>Work Item:</b> {task.id}
            </p>
            <p>
              <b>Title:</b> {task.name}
            </p>
            <p>
              <b>Begin Date:</b>
              {dateFormatter((hoverPoint as Point)?.startDate)}
            </p>
            <p>
              <b>End Date:</b> {dateFormatter((hoverPoint as Point)?.x)}
            </p>
            <p>
              <b>Cycle Time:</b> {(hoverPoint as Point)?.y}
            </p>
          </div>
          <div className="popup-status">
            <b>Age in status</b>
            <table>
              <tbody>
                {task.status.map((item) => (
                  <tr>
                    <td>{item.label}</td>
                    <td>{convertMinutes(item.timeInStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

type ChartData = [Date, number, number, Task[], Date, number];

interface drawChart {
  data: ChartData[];
  min: number | unknown;
  max: number | unknown;
}
