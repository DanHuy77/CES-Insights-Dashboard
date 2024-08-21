import {
  getMaxAge,
  countWIP,
  drawPercentageEachTask,
  calculatePercentage,
  calculatePercentageEachTask,
  getRandomNumberInRange,
  countTaskSameAge,
  getDecimalPart,
} from "./DataChartAging";
import {
  Workflows,
  TaskAging,
  ChartRender,
  SeriesData,
  PercentageResult,
} from "../../types/aging";
import { Status } from "../../types";

function removeDuplicatesPercentages(data: PercentageResult[]) {
  return data.filter((element, index, array) => {
    return (
      (index === 0 || element.totalAge !== array[index - 1].totalAge) &&
      element.totalAge !== 0
    );
  });
}

export const colors = [
  "rgb(94, 130, 44)",
  "rgb(16, 224, 16)",
  "rgb(240, 240, 16)",
  "rgb(232, 128, 16)",
];

export const listPercentage = [0.5, 0.7, 0.85, 0.95];

function getColorByName(statuses: Status[], name: string) {
  const status = statuses.find((status) => status.name === name);
  return status ? status.color : "#067DB7";
}

export const chartData = (
  data: TaskAging[],
  workflows: Workflows,
  statuses: Status[]
): ChartRender => {
  const dataRender = countTaskSameAge(data, workflows);

  const series = workflows.map((workflowName) => ({
    name: workflowName,
    zIndex: 6,
    color: getColorByName(statuses, workflowName),
    data: dataRender
      .filter((task) => task.currentStatus === workflowName)
      .map(
        (task, index): SeriesData => ({
          x:
            workflows.indexOf(task.currentStatus) +
            getDecimalPart((index % 5) * 0.1) * getRandomNumberInRange(),
          y: task.totalAge,
          startDate: task.startDate,
          count: task.count,
          data: task.data,
        })
      ),
  }));

  const done = workflows[workflows.length - 1];

  const percentages = calculatePercentageEachTask(
    data,
    listPercentage,
    workflows,
    done
  );

  const desiredPercentages = calculatePercentage(
    data,
    [0.5, 0.7, 0.85, 0.95],
    done
  );

  const plotCountWIP = countWIP(data, workflows).map((wip, index) => ({
    value: index,
    width: 0, // Customize the width of the lines
    zIndex: 1, // Set zIndex to ensure lines are on top
    label: {
      text: "WIP:" + wip.countWIP,
      align: "center", // Align text to the right
      style: {
        color: "black", // Label color
        fontSize: "12px",
      },
      rotation: 0,
      y: -10,
    },
  }));

  const plotLines = removeDuplicatesPercentages(desiredPercentages).map(
    (percentage) => ({
      dashStyle: "dash",
      width: 1,
      value: percentage.totalAge,
      label: {
        text: percentage.percentage * 100 + "%",
        align: "right",
        x: 25,
        y: 4,
        style: {
          color: "black",
          fontSize: "10px",
        },
      },
      zIndex: 4,
    })
  );

  return {
    data: dataRender,
    series,
    colors,
    plotCountWIP,
    plotLines,
    desiredPercentages,
    percentages,
  };
};

export const getOptions = (
  data: ChartRender,
  workflows: Workflows
): Highcharts.Options => ({
  chart: {
    type: "scatter",
    spacingRight: 40,
    height: 600,
    zooming: {
      type: "xy",
    },
  },
  title: {
    text: "Aging Work In Progress",
    margin: 30,
  },
  xAxis: {
    categories: workflows,
    gridLineWidth: 1,
    gridLineColor: "lightgray",
    min: 0,
    max: workflows.length - 1,
    plotLines: data.plotCountWIP,
    gridZIndex: 8,
  } as Highcharts.XAxisOptions,
  yAxis: {
    title: {
      text: "Age (Day)",
    },
    lineWidth: 2,
    plotLines: data.plotLines,
    max: getMaxAge([...data.data, ...data.desiredPercentages]) + 1,
  } as Highcharts.YAxisOptions,
  plotOptions: {
    scatter: {
      marker: {
        symbol: "circle",
        radius: 6,
      },
      dataLabels: {
        enabled: true,
        format: "{point.count}",
        style: {
          fontWeight: "normal",
          color: "black",
          textOutline: "none",
        },
        verticalAlign: "middle",
        padding: -5,
      },
    },
  },
  series: [
    ...data.series,
    ...drawPercentageEachTask(data.percentages, data.colors),
  ] as Array<Highcharts.SeriesOptionsType>,
  tooltip: {},
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
});
