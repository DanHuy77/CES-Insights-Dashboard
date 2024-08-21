import {
  Container,
  Header,
  Sidebar,
  Sidenav,
  Content,
  Navbar,
  Nav,
  InputPicker,
  Button,
  Form,
  ButtonToolbar,
} from "rsuite";

import MagicIcon from "@rsuite/icons/legacy/Magic";
import { useEffect, useState } from "react";
import {
  SelectSpace,
  Statuses,
  calculatedStatuses,
  tasksCaculated,
} from "../Common/SelectSpace";
import { Task } from "../../types";
import FolderFillIcon from "@rsuite/icons/FolderFill";
import { CumulativeFlowDiagram } from "../CumulativeFlowDiagram";
import { AgingWorkItemsChart } from "../AgingWorkItemsChart";
import { CycleTimeScatterplot } from "../CycleTimeScatterplot";
import CogIcon from "@rsuite/icons/legacy/Cog";
import { Histogram } from "../Histogram";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../provider/authProvider";
import { fetchTaskByListId } from "../../services/task.service";
import { fetchTaskStatusByTaskId } from "../../services/taskStatus.service";
import { fetchListByFolderId } from "../../services/list.service";

interface ChartType {
  key: string;
  value: string;
  element: any;
}

export interface savedData {
  id: number;
  name: string;
  space: string;
  folder: string;
  list: string[];
}
export interface Data {
  label: string;
  value: number;
}
const chartTypes: ChartType[] = [
  {
    key: "1",
    value: "Cumulative Flow Diagram (CFD)",
    element: CumulativeFlowDiagram,
  },
  {
    key: "2",
    value: "Aging Work Items Chart",
    element: AgingWorkItemsChart,
  },
  {
    key: "3",
    value: "Cycle Time Scatterplot",
    element: CycleTimeScatterplot,
  },
  {
    key: "4",
    value: "Histogram",
    element: Histogram,
  },
];

const NavToggle = ({ handleLogout }: { handleLogout: () => void }) => {
  return (
    <Navbar appearance="subtle" className="nav-toggle">
      <Nav>
        <Nav.Menu
          noCaret
          placement="topStart"
          trigger="click"
          title={<CogIcon />}
        >
          <Nav.Item onClick={handleLogout}>Sign out</Nav.Item>
        </Nav.Menu>
      </Nav>
    </Navbar>
  );
};

export const LayoutKanban = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const [chart, setChart] = useState<ChartType>();
  const handleSelectChart = (eventKey: string) => {
    const chart = chartTypes.find((chart) => chart.key === eventKey);
    setChart(chart);
    setActive(eventKey);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setToken("");
        navigate("/", { replace: true });
        localStorage.clear();
      })
      .catch(() => {
        // An error happened.
      });
  };
  const tasksFromLocalStorage = JSON.parse(
    localStorage.getItem("tasks") || "[]"
  );
  const statusFromLocalStorage = JSON.parse(
    localStorage.getItem("statuses") || "[]"
  );
  const dataSavedFromLocalStorage = JSON.parse(
    localStorage.getItem("savedData") || "[]"
  );
  const [savedData, setSavedData] = useState<savedData[]>(
    dataSavedFromLocalStorage
  );
  const [tasks, setTasks] = useState<Task[]>(tasksFromLocalStorage);
  const [finalStatus, setFinalStatus] = useState<Statuses[]>(
    statusFromLocalStorage
  );
  const handleSetDataCallBack = (listTask: Task[], statuses: Statuses[]) => {
    setTasks(listTask);
    setFinalStatus(statuses);
  };

  const [active, setActive] = useState<string>();
  const [savedDataSelect, setSavedDataSelect] = useState<Data[]>([]);
  const [idSavedData, setIdSavedData] = useState<number>();
  useEffect(() => {
    if (!savedData.length) return;
    const data = savedData.map((element: savedData) => {
      return {
        label: element.name,
        value: element.id,
      };
    });
    setSavedDataSelect(data);
  }, [savedData]);

  const handleChangeSavedData = (value: number) => {
    setIdSavedData(value);
  };
  const handleSubmitUseSavedData = async () => {
    setLoading(true);
    const dataFromLocalStorage = savedData.find(
      (element: savedData) => element.id === idSavedData
    );
    if (!dataFromLocalStorage) return;
    const tasksFormSavedData: Task[] = await fetchTaskByListId(
      dataFromLocalStorage.list
    );
    const lists = await fetchListByFolderId(dataFromLocalStorage.folder);
    const listPicked = lists.filter(({ id }) =>
      dataFromLocalStorage.list.includes(id)
    );
    const finalStatus = calculatedStatuses(listPicked);
    const taskIds = tasksFormSavedData.map(({ id }) => id);
    const statusFormSavedData = await fetchTaskStatusByTaskId(taskIds);
    const finalTasks = tasksCaculated(tasksFormSavedData, statusFormSavedData);
    setLoading(false);
    setTasks(finalTasks);
    setFinalStatus(finalStatus);
  };
  const handleSavedData = (value: savedData[]) => {
    setSavedData(value);
  };
  return (
    <div className="show-fake-browser sidebar-page">
      <Container>
        <Sidebar
          style={{ display: "flex", flexDirection: "column" }}
          collapsible
        >
          <Sidenav defaultOpenKeys={["3"]} appearance="subtle">
            <Sidenav.Body>
              <Nav>
                <Nav.Menu
                  eventKey="1"
                  trigger="hover"
                  title="Draw Chart"
                  icon={<MagicIcon />}
                  placement="rightStart"
                >
                  {chartTypes &&
                    chartTypes.map((element) => (
                      <Nav.Item
                        key={element.key}
                        onSelect={handleSelectChart}
                        eventKey={element.key}
                        active={element.key === active}
                      >
                        {element.value}
                      </Nav.Item>
                    ))}
                </Nav.Menu>
                <Nav.Menu
                  eventKey="2"
                  trigger="hover"
                  title="Select Task"
                  icon={<FolderFillIcon />}
                  placement="rightStart"
                >
                  <SelectSpace
                    setDataCallback={handleSetDataCallBack}
                    setSavedData={handleSavedData}
                  />
                </Nav.Menu>
                <Nav.Menu
                  eventKey="4"
                  trigger="hover"
                  title="Saved Data"
                  icon={<FolderFillIcon />}
                  placement="rightStart"
                >
                  <Form className="form-save-data">
                    <Form.Group>
                      <InputPicker
                        label="Saved Data"
                        data={savedDataSelect}
                        onChange={handleChangeSavedData}
                        style={{ width: 224 }}
                      />
                    </Form.Group>{" "}
                    <Form.Group>
                      <ButtonToolbar>
                        <Button
                          appearance="primary"
                          onClick={handleSubmitUseSavedData}
                          loading={loading}
                          disabled={!idSavedData}
                        >
                          Submit
                        </Button>
                      </ButtonToolbar>
                    </Form.Group>
                  </Form>
                </Nav.Menu>
              </Nav>
            </Sidenav.Body>
          </Sidenav>
          <NavToggle handleLogout={handleLogout} />
        </Sidebar>

        <Container>
          <Header>{chart && <h2>{chart.value}</h2>}</Header>
          <Content>
            {!!finalStatus.length && !!tasks.length && chart && (
              <chart.element listTask={tasks} statuses={finalStatus} />
            )}
          </Content>
        </Container>
      </Container>
    </div>
  );
};
