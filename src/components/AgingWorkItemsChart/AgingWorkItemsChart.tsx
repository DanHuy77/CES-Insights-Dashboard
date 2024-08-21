import { useState, useCallback, useEffect, useRef } from "react";
import * as Highcharts from "highcharts";
import { Chart as HighchartsChart } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsAccessibility from "highcharts/modules/accessibility";
import { Tooltip } from "./Tooltip";
import { Status, Task } from "../../types";
import { SelectWorkflow } from "./SelectWorkflow";
import "./style.css";
import { calculateAge, convertMinutes } from "./DataChartAging";
import { Workflows, TaskAging, Point } from "../../types/aging";
import {
  chartData,
  getOptions,
  colors,
  listPercentage,
} from "./DrawChartAging";
import { ChartTypes } from "../../types/chartTypes";

HighchartsAccessibility(Highcharts);

interface AgingWorkItemsChart {
  listTask: Task[];
  statuses: Status[];
}

export const AgingWorkItemsChart = ({
  listTask = [],
  statuses,
}: AgingWorkItemsChart) => {
  const [chart, setChart] = useState<HighchartsChart | null>(null);
  const [options, setOptions] = useState<Highcharts.Options>({
    series: [],
  });
  const [task, setTask] = useState<TaskAging>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const chartComponent = useRef<HighchartsReact.RefObject>(null);
  const [workflows, setWorkflows] = useState<string[]>(
    statuses.map(({ name }) => name)
  );

  const tasks = listTask;

  useEffect(() => {
    setWorkflows(statuses.map(({ name }) => name));
  }, [listTask, statuses]);

  useEffect(() => {
    if (chart && Object.keys(chart).length) return;

    const chartReload = chartComponent.current?.chart;
    if (!chartReload) return;

    setChart(chartReload);
  }, [chart]);

  useEffect(() => {
    if (options.series?.length) return;

    const taskAgings = calculateAge(tasks, workflows);
    const chartRender = chartData(taskAgings, workflows, statuses);
    const newOptions = getOptions(chartRender, workflows);
    setOptions(newOptions);
  }, [options]);

  useEffect(() => {
    if (!tasks.length) return;

    const newChartOptions = {
      ...options,
      series: [],
    };
    setOptions(newChartOptions);
  }, [workflows, tasks]);

  const tooltipCallback = useCallback((chart: HighchartsChart) => {
    setChart(chart);
  }, []);

  const sortWorkflow = (statuses: Status[], workflows: Workflows) => {
    const workflowsResult: string[] = [];
    statuses.forEach((status: Status) => {
      if (workflows.includes(status.name)) workflowsResult.push(status.name);
    });
    setWorkflows(workflowsResult);
  };

  const ageInStatus = (task: TaskAging, workflows: Workflows) => {
    const taskHistory = tasks.find(({ id }) => id === task.ID)?.status;
    const result = { ...task };
    workflows.forEach((workflow) => {
      const timeInStatus = taskHistory?.find(
        ({ name }) => name === workflow
      )?.timeInStatus;
      if (timeInStatus) {
        result[workflow] = convertMinutes(timeInStatus);
      }
    });
    return result;
  };

  const handleChangeStatus = (workflowItem: {
    name: string;
    checked: boolean;
  }) => {
    if (!workflowItem) return;

    if (workflowItem.checked && !workflows.includes(workflowItem.name)) {
      sortWorkflow(statuses, [...workflows, workflowItem.name]);
      return;
    }
    const newStatus = workflows.filter(
      (workflowName) => workflowName !== workflowItem.name
    );
    sortWorkflow(statuses, newStatus);
  };

  const handleClosePopup = () => {
    setIsOpen(false);
  };

  const tooltipEvent = (
    formatterContext: Highcharts.TooltipFormatterContextObject
  ) => {
    const { point } = formatterContext;
    const handleClick = (task: TaskAging) => {
      setTask(ageInStatus(task, workflows));
      setIsOpen(true);
    };

    if ((point as Point).destroyed) return <></>;

    return (
      <>
        {
          <>
            <div className="start-date">
              <b>Start Date:</b>
              <p> {(point as Point).startDate}</p>
            </div>
            <div className="current-age">
              <b>Current Age (Y axis):</b>
              <p>{point.y}</p>
            </div>
            <div className="tasks">
              {(point as Point).data.map((task) => (
                <div
                  key={task.ID}
                  className="task"
                  onClick={() => handleClick(task)}
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
                    <span>{task.ID}</span>
                  </p>
                  <p className="task-age">{task.totalAge} days</p>
                </div>
              ))}
            </div>
          </>
        }
      </>
    );
  };
  return (
    <>
      {tasks.length ? (
        <div className="chartComponent">
          <SelectWorkflow
            setStatusCallBack={handleChangeStatus}
            statuses={statuses}
          />{" "}
          <hr />
          <HighchartsReact
            ref={chartComponent}
            highcharts={Highcharts}
            options={options}
            callback={tooltipCallback}
          />
          <Tooltip chart={chart} chartTypes={ChartTypes.AGING}>
            {tooltipEvent}
          </Tooltip>
          <div className="list-color">
            {listPercentage.map((percentage, index) => (
              <div key={`color-${index}`} className="color">
                <svg>
                  <rect
                    width="10"
                    height="10"
                    style={{ fill: colors[index] }}
                  />
                </svg>
                <span>{percentage * 100}% </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {isOpen && task && (
        <div className="popup">
          <div className="popup-title">
            <p>Work Item Details</p>
            <button className="popup-close" onClick={() => handleClosePopup()}>
              {" "}
              X{" "}
            </button>
          </div>
          <div className="popup-infor">
            <p>Work Item: {task.ID}</p>
            <p>Title: {task.Title} </p>
            <p>Start Date: {task.startDate} </p>
          </div>
          <div className="popup-status">
            Time in status
            <table>
              <tbody>
                {workflows.map(
                  (workflow, index) =>
                    typeof task[workflow] !== "undefined" && (
                      <tr key={`workflow-${index}`}>
                        <td>{workflow} </td>
                        <td>{task[workflow]}</td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
