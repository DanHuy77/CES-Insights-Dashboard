import { Task } from "../../types";
import {
  TaskAging,
  Workflows,
  PercentageResult,
  PercentageEachTask,
  DrawPercentageEachTask,
  CountWIP,
  DataRender,
} from "../../types/aging";
function convertTimestampToDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based, so add 1
  const day = date.getDate().toString().padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}
function getDateUtcNow() {
  const now = new Date();
  const date = now.getUTCDate();
  const year = now.getFullYear();
  const month = now.getUTCMonth();
  return Date.UTC(year, month, date);
}
function calculateDateDifference(doneDate: Date, creationDate: Date): number {
  const millisecondsInDay = 1000 * 60 * 60 * 24;
  return (
    Math.round(
      (doneDate.getTime() - creationDate.getTime()) / millisecondsInDay
    ) + 1
  );
}

export function calculateAge(data: Task[], workflows: Workflows): TaskAging[] {
  const results: TaskAging[] = [];
  data.forEach((task) => {
    const result = workflows.reduce((obj: TaskAging, workflow) => {
      obj[workflow] = undefined;
      return obj;
    }, {});
    result["ID"] = task.id;
    result["Title"] = task.name;
    for (const workflow in workflows) {
      const history = task.status?.find(
        ({ name }) => name === workflows[workflow]
      );
      result[workflows[workflow]] = history ? history.date : undefined;
      if (history?.isCurrent) {
        result["currentStatus"] = workflows[workflow];
        break;
      }
    }
    for (let i = 0; i < workflows.length; i++) {
      if (!result[workflows[i]]) {
        continue;
      }
      if (!result["startDate"]) {
        result["startDate"] = result[workflows[i]];
      }
      if (!result[workflows[i + 1]]) {
        if (i === workflows.length - 1) {
          result[workflows[i]] = calculateDateDifference(
            new Date(result[workflows[i]] as string),
            new Date(result["startDate"] as string)
          );
        } else {
          let index = 0;
          for (let j = i + 1; j < workflows.length; j++) {
            if (result[workflows[j]]) {
              result[workflows[i]] = calculateDateDifference(
                new Date(result[workflows[j]] as string),
                new Date(result["startDate"] as string)
              );
              index = j;
              break;
            }
          }
          if (index === 0) {
            result[workflows[i]] = calculateDateDifference(
              new Date(getDateUtcNow()),
              new Date(result["startDate"] as string)
            );
            result["totalAge"] = result[workflows[i]] as number;
            break;
          }
        }
        result["totalAge"] = result[workflows[i]] as number;
      } else {
        result[workflows[i]] = calculateDateDifference(
          new Date(result[workflows[i + 1]] as string),
          new Date(result["startDate"] as string)
        );
      }
    }
    if (result["startDate"] !== "") {
      result["startDate"] = convertTimestampToDateTime(
        result["startDate"] as string
      );
      results.push(result);
    }
  });
  return results;
}

export function calculatePercentage(
  data: TaskAging[],
  percentages: number[],
  done: string
): PercentageResult[] {
  const listAge: number[] = data
    .filter(({ currentStatus }) => currentStatus === done)
    .map(({ totalAge }) => totalAge as number);
  listAge.sort((a: number, b: number): number => a - b);
  const results: PercentageResult[] = [];
  percentages.forEach((percentage) => {
    const result: PercentageResult = { percentage: percentage, totalAge: 0 };

    const listAgeFilter = listAge.filter((age) => age !== undefined);
    if (listAgeFilter.length > 0) {
      const index = Math.round(listAgeFilter.length * percentage);
      result["totalAge"] = listAgeFilter[index - 1];
    } else {
      result["totalAge"] = 0;
    }
    results.push(result);
  });
  return results;
}

export function calculatePercentageEachTask(
  data: TaskAging[],
  percentages: number[],
  workflows: string[],
  done: string
): PercentageEachTask[] {
  const taskDone = data.filter(({ currentStatus }) => currentStatus === done);
  const results: PercentageEachTask[] = [];
  for (let i = 0; i < workflows.length - 1; i++) {
    const result: PercentageEachTask = { name: workflows[i], percentages: [] };
    percentages.forEach((percentage) => {
      taskDone.sort((a: TaskAging, b: TaskAging): number => {
        const aValue = a[workflows[i]] as number;
        const bValue = b[workflows[i]] as number;
        return aValue - bValue;
      });
      const taskFilter = taskDone.filter(
        (task) => task[workflows[i]] !== undefined
      );
      if (taskFilter.length > 0) {
        const index = Math.round(taskFilter.length * percentage);
        result.percentages.push(taskFilter[index - 1][workflows[i]] as number);
      } else {
        result.percentages.push(0);
      }
    });
    results.push(result);
  }
  return results;
}

export function drawPercentageEachTask(
  percentages: PercentageEachTask[],
  colors: string[]
): DrawPercentageEachTask[] {
  const results: DrawPercentageEachTask[] = [];
  colors.forEach((color, index) => {
    const result: DrawPercentageEachTask = {
      data: [],
      type: "area",
      fillColor: color,
      lineWidth: 0,
      marker: {
        enabled: false,
      },
      zIndex: colors.length + 1 - index,
      showInLegend: false,
      enableMouseTracking: false,
    };
    percentages.forEach((percentage, indexWorkFlow) => {
      result.data.push([indexWorkFlow - 0.5, percentage.percentages[index]]);
      result.data.push([indexWorkFlow + 0.5, percentage.percentages[index]]);
    });
    results.push(result);
  });
  const redArea: DrawPercentageEachTask = {
    data: [],
    type: "area",
    fillColor: "rgb(224, 16, 16)", // Customize area fill color
    lineWidth: 0, // Hide area line
    marker: {
      enabled: false, // Hide area markers
    },
    zIndex: 1,
    showInLegend: false,
    enableMouseTracking: false,
  };
  const maxAgeArea = 1000;
  percentages.forEach((percentage, indexWorkFlow) => {
    if (percentage.percentages.some((percentage) => percentage !== 0)) {
      redArea.data.push([indexWorkFlow - 0.5, maxAgeArea]);
      redArea.data.push([indexWorkFlow + 0.5, maxAgeArea]);
      return;
    }
    redArea.data.push([indexWorkFlow - 0.5, 0]);
    redArea.data.push([indexWorkFlow + 0.5, 0]);
  });
  results.push(redArea);
  return results;
}

export function countWIP(data: TaskAging[], workflows: string[]): CountWIP[] {
  const results: CountWIP[] = [];
  workflows.forEach((workflow) => {
    const WIP = { name: workflow, countWIP: 0 };
    data.forEach((task) => {
      if (task.currentStatus == workflow) {
        WIP.countWIP = WIP.countWIP + 1;
      }
    });
    results.push(WIP);
  });
  return results;
}

export function countTaskSameAge(
  data: TaskAging[],
  workflows: string[]
): DataRender[] {
  const results: DataRender[] = [];
  workflows.slice(0, workflows.length - 1).forEach((workflow) => {
    const listTask = data.filter(
      ({ currentStatus }) => currentStatus === workflow
    );
    const listTaskSameAge = listTask.map(({ totalAge }) => totalAge);
    const listTaskSameAgeUnique = [...new Set(listTaskSameAge)];
    listTaskSameAgeUnique.forEach((age) => {
      const arr = listTask.filter(({ totalAge }) => totalAge === age);
      const result: DataRender = {
        startDate: arr[0].startDate as string,
        totalAge: age as number,
        currentStatus: workflow as string,
        data: arr,
        count: arr.length == 1 ? null : arr.length,
      };
      results.push(result);
    });
  });
  return results;
}
export function drawHistoryTask(task: TaskAging, workflows: string[]) {
  let html = "";
  const currentStatus = task.currentStatus as string;
  const index = workflows.indexOf(currentStatus);
  for (let i = 0; i <= index; i++) {
    html += `<p>${workflows[i]} : ${task[workflows[i]]}</p>`;
  }
  return `<div class="task-history">` + html + `</div>`;
}

export function getMaxAge(data: (DataRender | PercentageResult)[]) {
  if (data.length === 0) {
    return 0;
  }
  return data.reduce(function (
    max: number,
    item: DataRender | PercentageResult
  ) {
    return item.totalAge > max ? item.totalAge : max;
  },
  0);
}

export function getRandomNumberInRange() {
  return Math.random() < 0.5 ? -1 : 1;
}
export function getDecimalPart(number: number) {
  return number - Math.floor(number);
}

export const convertMinutes = (num: number) => {
  const days = Math.floor(num / 1440); // 60*24
  const hours = Math.floor((num - days * 1440) / 60);
  const minutes = Math.round(num % 60);

  if (days > 0) {
    return days + " days, " + hours + " hours, " + minutes + " minutes";
  } else {
    return hours + " hours, " + minutes + " minutes";
  }
};
