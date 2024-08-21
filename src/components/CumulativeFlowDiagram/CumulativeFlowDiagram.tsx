import { useEffect, useState } from "react";
import * as Highcharts from "highcharts";
import exportingModule from "highcharts/modules/exporting";
import exportingData from "highcharts/modules/export-data";
import HighchartsReact from "highcharts-react-official";
import { SelectDateRange, DateRange } from "../Common/SelectDateRange";
import { Status, Task } from "../../types";
import { ChartTypes } from "../../types/chartTypes";

exportingModule(Highcharts);
exportingData(Highcharts);

interface Data {
  label: string;
  color: string;
  dates: unknown[][];
}

interface DateUTC {
  startDate: number;
  endDate: number;
}

interface drawChart {
  data: Data[] | undefined;
  min: number | unknown;
  max: number | unknown;
  interval: number;
}
interface CumulativeFlowDiagram {
  listTask: Task[];
  statuses: Status[];
}

const countDateOfTasks = (tasks: Task[]): number => {
  const currentDate = new Date();
  const maxDate = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
  let minDate: number = 0;
  tasks.forEach((task) => {
    if (!task.status?.length) return;
    if (!minDate) {
      minDate = Math.min(...task.status.map((item) => item.date));
    } else if (minDate > Math.min(...task.status.map((item) => item.date))) {
      minDate = Math.min(...task.status.map((item) => item.date));
    }
  });
  return Math.floor((maxDate - minDate) / (1000 * 60 * 60 * 24) / 5) + 1;
};

export const CumulativeFlowDiagram = ({
  listTask,
  statuses,
}: CumulativeFlowDiagram) => {
  const countDateOfTask: number = countDateOfTasks(listTask);
  const [tasks, setTasks] = useState<Task[]>(listTask);
  const [dateRangePicked, setdateRangePicked] = useState<DateUTC>();
  const [drawChart, setDrawChart] = useState<drawChart>({
    data: [],
    min: null,
    max: null,
    interval: countDateOfTask,
  });
  useEffect(() => {
    setTasks(listTask);
  }, [listTask]);

  useEffect(() => {
    setDrawChart({
      data: drawChart.data,
      min: dateRangePicked?.startDate,
      max: dateRangePicked?.endDate,
      interval: countDateOfTask,
    });
  }, [dateRangePicked]);

  useEffect(() => {
    setDrawChart({
      data: getDataChartCDF(tasks, statuses),
      min: drawChart.min,
      max: drawChart.max,
      interval: countDateOfTask,
    });
  }, [tasks]);

  const handleConvertDateRange = (date: DateRange) => {
    if (!date) return;
    if (
      convertToDayUTC(date.startDate) === convertToDayUTC(new Date(0)) &&
      convertToDayUTC(date.endDate) === convertToDayUTC(new Date(0))
    ) {
      setDrawChart({
        data: drawChart.data,
        min: null,
        max: null,
        interval: countDateOfTask,
      });
    } else {
      setdateRangePicked({
        startDate: Date.UTC(
          date.startDate.getFullYear(),
          date.startDate.getMonth(),
          date.startDate.getDate()
        ),
        endDate: Date.UTC(
          date.endDate.getFullYear(),
          date.endDate.getMonth(),
          date.endDate.getDate()
        ),
      });
    }
  };

  //Convert day to UTC
  function convertToDayUTC(date: Date) {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function removeDuplicateObjects(array: Status[], property: string) {
    const uniqueIds: number[] = [];
    if (!array.length) return;
    if (property === "date") {
      const unique = array.filter((element) => {
        if (!uniqueIds.length) {
          uniqueIds.push(element[property] as number);
          return true;
        } else {
          const isDuplicate = uniqueIds.includes(element[property] as number);
          if (!isDuplicate) {
            uniqueIds.push(element[property] as number);

            return true;
          }

          return false;
        }
      });

      return unique;
    }
  }

  // Convert data chart CFD from list task.
  function getDataChartCDF(dataFromClikup: Task[], listStatus: Status[]) {
    let finalDatas = [];
    const currentDate = new Date();
    const maxDate = Date.UTC(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const listDataStatus: Status[] = dataFromClikup.reduce(function (
      acc: any,
      item: Task
    ) {
      if (!item.status) return;
      const statusReverse = [...item.status];
      const unique = removeDuplicateObjects(statusReverse.reverse(), "date");
      if (!unique) return;
      const sorted = unique.sort((a: Status, b: Status) => b.date - a.date);
      let currentStatus: Status;
      if (!unique) return;
      const newdata = sorted
        .reverse()
        .reduce((accumulator: Status[], status: Status) => {
          if (!currentStatus) {
            currentStatus = { ...status };
            return [currentStatus];
          }
          let dateDif = 0;
          if (
            status.date &&
            currentStatus.date &&
            status.date > currentStatus.date
          ) {
            dateDif =
              Math.ceil(
                Math.abs(status.date - currentStatus.date) /
                  (1000 * 60 * 60 * 24)
              ) - 1;
          }
          const param: Status = { ...currentStatus };
          currentStatus = { ...status };
          const date = param?.date ?? 0;
          return [
            ...accumulator,
            ...Array.from({ length: dateDif }).map((_day, index) => ({
              ...param,
              date: date + 86400000 * (index + 1),
            })),
            currentStatus,
          ];
        }, [])
        .reverse();
      const date = newdata.map((item: Status) => {
        if (!item.date) return 0;
        return item.date;
      });
      const maxDateNewData = Math.max(...date);
      if (!maxDate) return;
      if (maxDate > maxDateNewData) {
        const statusMaxDate = newdata.find(
          (item: Status) => item.date === maxDateNewData
        );
        const numberDateDif = Math.ceil(
          Math.abs(maxDate - maxDateNewData) / (1000 * 60 * 60 * 24)
        );
        if (!statusMaxDate) return;
        let data: Status[] = [];
        if (numberDateDif >= 1) {
          const dateMaxDate = statusMaxDate.date ?? 0;
          data = [
            ...Array.from({ length: numberDateDif }).map((_day, index) => ({
              ...statusMaxDate,
              date: dateMaxDate + 86400000 * (index + 1),
            })),
          ];
        }
        finalDatas = [...newdata, ...data];
      } else {
        finalDatas = [...newdata];
      }
      return [...acc, ...finalDatas.sort((a: any, b: any) => a.date - b.date)];
    },
    []);
    const dates = [
      ...new Set(
        listDataStatus.map(function (status: any) {
          return status.date;
        })
      ),
    ];

    const datesSorted = dates.sort((a: number, b: number) => a - b);

    const dataDefault = listStatus.map((value) => ({
      label: value.label,
      color: value.color,
      dates: datesSorted.reduce((acc, date) => ({ ...acc, [date]: 0 }), {}),
    }));

    listDataStatus.forEach((status: Status) => {
      const data = dataDefault.find(({ label }) => label === status.label);
      if (!data?.dates) return;
      if (!status.date) return;
      const selectedData = data.dates[status.date];
      data.dates = { ...data.dates, [status.date]: selectedData + 1 };
    });

    return dataDefault.map((item) => {
      return {
        ...item,
        dates: Object.entries(item.dates).map(([key, value]) => [
          parseInt(key),
          value,
        ]),
      };
    });
  }
  // Convert data to series.
  function generateSeries(dataDefault: Data[]) {
    if (!dataDefault) {
      return [];
    }
    return dataDefault.map((value) => ({
      name: value.label,
      color: value.color,
      data: value.dates,
      showInLegend: true,
      marker: {
        symbol: "circle",
      },
    }));
  }
  if (!drawChart.data) return;
  const options = {
    chart: {
      type: "area",
      zoomType: "x",
      panning: true,
      panKey: "shift",
    },
    legend: {
      enabled: true,
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      itemStyle: {
        fontWeight: "normal",
        fontSize: "16px",
        fontFamily: "Segoe UI",
      },
    },
    title: {
      text: "Cumulative Flow Diagram (CFD)",
    },

    xAxis: {
      title: {
        text: "",
      },
      labels: {
        style: {
          fontWeight: "normal",
          fontSize: "12px",
          fontFamily: "Segoe UI",
          color: "black",
        },
        formatter: function (this: any): string {
          const localDate: Date = new Date(this.value);
          return Highcharts.dateFormat(
            "%Y-%m-%d",
            Date.UTC(
              localDate.getFullYear(),
              localDate.getMonth(),
              localDate.getDate()
            )
          );
        },
      },
      type: "datetime",
      gridLineWidth: 1,
      min: drawChart.min,
      max: drawChart.max,
    },
    credits: {
      enabled: false,
    },
    yAxis: {
      title: {
        text: "Work Items",
        style: {
          fontWeight: "normal",
          fontSize: "12px",
          fontFamily: "Segoe UI",
          color: "black",
        },
      },
      lineWidth: 1,
      labels: {
        style: {
          fontWeight: "normal",
          fontSize: "12px",
          fontFamily: "Segoe UI",
          color: "black",
        },
      },
    },
    tooltip: {
      useHTML: true,
      crosshairs: true,
      footerFormat: "<div>Total: <b>{point.total}</b></div>",
      shared: true,
      headerFormat: "<div>{point.key}</div>",
    },
    plotOptions: {
      area: {
        stacking: "normal",
        lineColor: "#666666",
        lineWidth: 0,
        marker: { enabled: false },
      },
    },
    series: generateSeries(drawChart.data),
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
          <SelectDateRange
            defaultDateRangeValue={[new Date(), new Date()]}
            chartType={ChartTypes.CFD}
            setDateRangeCallBack={handleConvertDateRange}
          />
        </>
      )}
      <HighchartsReact highcharts={Highcharts} options={options} />
    </>
  );
};
