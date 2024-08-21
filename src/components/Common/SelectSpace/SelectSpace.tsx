import { useState, useEffect, useRef } from "react";
import {
  InputPicker,
  CheckPicker,
  Button,
  Loader,
  Whisper,
  Popover,
  Form,
  ButtonToolbar,
} from "rsuite";
import { Space, Folder, Task, List, Status, taskStatus } from "../../../types";
import { fetchSpaces } from "../../../services/space.service";
import { fetchFolderBySpaceId } from "../../../services/folder.service";
import { fetchListByFolderId } from "../../../services/list.service";
import { fetchTaskByListId } from "../../../services/task.service";
import { fetchTaskStatusByTaskId } from "../../../services/taskStatus.service";
import { savedData } from "../../Layout";

export interface data {
  label: string;
  value: string;
}

export interface statusClickup {
  id: string;
  status: string;
  order: string;
  color: string;
  type: string;
  isCurrent: boolean;
}

export interface Statuses {
  name: string;
  label: string;
  color: string;
  checked: boolean;
  type: string;
  order: string;
}

interface Props {
  setDataCallback: (tasks: Task[], statuses: Statuses[]) => void;
  setSavedData: (savedData: savedData[]) => void;
}

export const tasksCaculated = (
  tasks: Task[],
  statusFormClickUp: taskStatus[]
) => {
  const newTasks = tasks.map((task) => {
    const status = statusFormClickUp.filter(({ id }) => task.id === id);
    const newStatus: Status[] = status.map((item) => {
      let arr = item.status?.split(" ");
      if (!arr) {
        arr = [];
      }
      for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
      }
      const label = arr.join(" ");
      const dates = new Date(item.since?.value);
      const dateUTC = Date.UTC(
        dates.getFullYear(),
        dates.getMonth(),
        dates.getDate()
      );
      return {
        name: item.status,
        label: label,
        color: item.color,
        date: dateUTC,
        isCurrent: item.isCurrent,
        timeInStatus: item.time,
        index: item.index,
        type: item.type,
        order: item.order,
      };
    });
    return { ...task, status: newStatus };
  });
  const finalTasks: Task[] = newTasks.filter(({ status }) => status.length > 0);
  return finalTasks;
};

export const calculatedStatuses = (listPicked: List[]): Statuses[] => {
  const arrStatus = listPicked.map(({ statuses }) => {
    if (!statuses?.length) return [];
    return statuses;
  });
  if (!arrStatus.length) return [];
  const listStatus = arrStatus.reduce((acc, item) => {
    return [...acc, ...item];
  }, []);

  const newStatus = listStatus.sort(function (a, b) {
    return parseInt(a.order) - parseInt(b.order);
  });
  const uniqueStatus = newStatus.map(({ status }) => status);
  const statusFiltered = newStatus.filter(
    ({ status }, index) => !uniqueStatus.includes(status, index + 1)
  );
  const finalStatus: Statuses[] = statusFiltered.map((item) => {
    let arr = item.status?.split(" ");
    if (!arr) {
      arr = [];
    }
    for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    const label = arr.join(" ");
    return {
      name: item.status,
      label: label,
      color: item.color,
      checked: true,
      type: item.type,
      order: item.order,
    };
  });
  return finalStatus;
};

export const SelectSpace = ({ setDataCallback, setSavedData }: Props) => {
  const ref = useRef<any>();
  const [spaces, setSpaces] = useState<Space[]>();
  const [dataSpace, setDataSpace] = useState<data[]>([]);
  const [spaceFromClickUp, setSpaceFromClikUp] = useState<Space[]>();
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [selectedList, setSelectedList] = useState<Space>();
  const [dataList, setDataList] = useState<data[]>([]);
  const [dataFolder, setDataFolder] = useState<data[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFilter, setLoadingFilter] = useState<boolean>(false);
  const [loadingFilterSpace, setLoadingFilterSpace] = useState<boolean>(false);

  const [dataFetchFolder, setDataFetchFolder] = useState<Folder[]>();
  const [dataFetchList, setDataFetchList] = useState<List[]>([]);
  const [finalStatus, setFinalStatus] = useState<Statuses[]>([]);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!spaces?.length) return;
    const uniqueSpaces: Space[] = Object.values(
      spaces.reduce((acc, cur) => Object.assign(acc, { [cur.id]: cur }), {})
    );
    const spaceFromClickUp = uniqueSpaces.map((item) => ({
      name: item.name,
      id: item.id,
      type: "space",
    }));
    const dataSpace = uniqueSpaces.map((item) => ({
      label: item.name,
      value: item.id,
    }));
    setDataSpace(dataSpace);
    setSpaceFromClikUp(spaceFromClickUp);
    setLoadingFilterSpace(false);
  }, [spaces]);

  useEffect(() => {
    setLoadingFilterSpace(true);
    async function fetchDataSpace() {
      const spaces: Space[] = await fetchSpaces();
      setSpaces(spaces);
    }
    fetchDataSpace();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    if (!selectedListIds.length) {
      if (!selectedList) return;
      const tasks: Task[] = selectedList.tasks || [];
      setDataCallback(tasks, finalStatus);
      return;
    }
    const tasks: Task[] = await fetchTaskByListId(selectedListIds);
    const taskIds = tasks.map(({ id }) => id);
    const statusFormClickUp = await fetchTaskStatusByTaskId(taskIds);
    const finalTasks = tasksCaculated(tasks, statusFormClickUp);
    setLoading(false);
    localStorage.setItem("tasks", JSON.stringify(finalTasks));
    localStorage.setItem("statuses", JSON.stringify(finalStatus));
    setDataCallback(finalTasks, finalStatus);
  };

  const handleSelectSpace = (value: string) => {
    setDataFetchFolder([]);
    setDataFetchList([]);
    if (!spaceFromClickUp?.length) return;

    const space = spaceFromClickUp.find(({ id }) => id === value);
    if (!space) return;

    if (space.type === "list") {
      setSelectedList(space);
    }
    setSelectedSpace(space);
  };

  useEffect(() => {
    if (!selectedSpace) return;

    setLoadingFilter(true);
    async function fetchDataFolder(id: string) {
      const data = await fetchFolderBySpaceId(id);

      setDataFetchFolder(data);
      setLoadingFilter(false);
    }

    async function fetchDatalist(id: string) {
      const data = await fetchListByFolderId(id);
      setDataFetchList(data);
    }
    if (selectedSpace?.type === "space") {
      fetchDataFolder(selectedSpace?.id);
    } else if (selectedSpace?.type === "folder") {
      fetchDatalist(selectedSpace.id);
    }
  }, [selectedSpace]);

  useEffect(() => {
    if (!dataFetchFolder?.length) return;
    const newData = dataFetchFolder.map((folder) => ({
      label: folder.name,
      value: folder.id,
    }));
    setDataFolder(newData);
  }, [dataFetchFolder]);

  const handleCleanSpace = () => {
    setSelectedSpace(null);
  };

  const handleCleanFolder = () => {
    setSelectedFolder(null);
    setDataFetchList([]);
  };

  const handleSelectFolder = (value: string) => {
    if (!dataFetchFolder?.length) return;

    setSelectedListIds([]);
    const folder = dataFetchFolder.find(({ id }) => id === value);
    if (!folder) return;

    setSelectedFolder(folder);
  };

  useEffect(() => {
    if (!selectedFolder) return;

    setLoadingFilter(true);
    async function fetchDatalist(id: string) {
      const data = await fetchListByFolderId(id);
      setDataFetchList(data);
      setLoadingFilter(false);
    }
    if (!selectedFolder) return;

    fetchDatalist(selectedFolder.id);
  }, [selectedFolder]);

  useEffect(() => {
    if (!dataFetchList?.length) return;

    const newData = dataFetchList.map((list) => ({
      label: list.name,
      value: list.id,
    }));
    setDataList(newData);
  }, [dataFetchList]);

  const handleSelectList = (value: string[]) => {
    setSelectedListIds(value);
    const listPicked = dataFetchList.filter(({ id }) => value.includes(id));
    const finalStatus = calculatedStatuses(listPicked);
    setFinalStatus(finalStatus);
  };

  const handleSaveFilter = () => {
    const savedData: savedData[] = JSON.parse(
      localStorage.getItem("savedData") || "[]"
    );
    const newData: savedData = {
      id: Math.floor(Math.random() * 100000000000000),
      name: name,
      space: selectedSpace?.id ?? "",
      folder: selectedFolder?.id ?? "",
      list: selectedListIds,
    };
    const newSavedData: savedData[] = [...savedData, newData];
    setSavedData(newSavedData);
    localStorage.setItem("savedData", JSON.stringify(newSavedData));
    if (ref.current) {
      ref.current.close();
    }
  };

  return (
    <>
      <div className="filter-space">
        {loadingFilterSpace && (
          <div className="loader">
            <Loader />
          </div>
        )}
        {!!dataSpace.length && (
          <InputPicker
            label="Space"
            className="item"
            data={dataSpace}
            style={{ width: 224 }}
            onChange={handleSelectSpace}
            onClean={handleCleanSpace}
          />
        )}
        {!selectedFolder && loadingFilter && (
          <div className="loader">
            <Loader />
          </div>
        )}

        {dataFetchFolder && !!dataFetchFolder?.length && (
          <InputPicker
            label="Folder"
            className="item"
            data={dataFolder}
            style={{ width: 224 }}
            onChange={handleSelectFolder}
            onClean={handleCleanFolder}
          />
        )}
        {/* List */}
        {!!selectedFolder && loadingFilter && (
          <div className="loader">
            <Loader />
          </div>
        )}
        {dataFetchList && !!dataFetchList?.length && (
          <CheckPicker
            label="Lists"
            className="item"
            data={dataList}
            style={{ width: 224 }}
            onChange={handleSelectList}
            value={selectedListIds}
          />
        )}
      </div>
      <ButtonToolbar>
        <Button
          appearance="primary"
          onClick={handleSubmit}
          disabled={
            selectedSpace?.type != "list" && selectedListIds.length === 0
          }
          loading={loading}
        >
          Submit
        </Button>
        <Whisper
          placement="top"
          trigger="click"
          ref={ref}
          className="filter-save"
          speaker={
            <Popover arrow={false}>
              <Form>
                <Form.Group controlId="name">
                  <Form.ControlLabel>Name</Form.ControlLabel>
                  <Form.Control onChange={setName} name="name" />
                </Form.Group>{" "}
                <Form.Group>
                  <ButtonToolbar>
                    <Button appearance="primary" onClick={handleSaveFilter}>
                      Save
                    </Button>
                  </ButtonToolbar>
                </Form.Group>
              </Form>
            </Popover>
          }
        >
          <Button
            disabled={
              selectedSpace?.type != "list" && selectedListIds.length === 0
            }
            appearance="default"
          >
            Save Filter
          </Button>
        </Whisper>
      </ButtonToolbar>
    </>
  );
};
