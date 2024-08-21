import { useEffect, useState } from "react";
import { SelectPicker, Button } from "rsuite";
import { Status, StatusData } from "../../types";
import "./cycleTimeStyle.css";

export const StatusSelector = ({
  selectStatusCallBack,
  dataStatuses,
  notification,
}: {
  selectStatusCallBack: (
    beginStatus: string | null,
    endStatus: string | null
  ) => void;
  dataStatuses: Status[];
  notification: string;
}) => {
  const [beginStatus, setBeginStatus] = useState<string | null>("");
  const [endStatus, setEndStatus] = useState<string | null>("");
  const [statusNotification, setStatusNotification] = useState<string>("");
  const [endStatusLabels, setEndStatusLabels] = useState<StatusData[]>([]);
  const [defaultStatusLabels, setDefaultStatusLabels] = useState<StatusData[]>(
    []
  );

  const data = dataStatuses.map((item) => ({
    index: item.order,
    label: item.label,
    value: item.label,
    type: item.type,
  }));

  const handleSubmit = () => {
    if (!beginStatus && !endStatus) return;
    const beginIndex = dataStatuses.findIndex(
      (status) => status.label === beginStatus
    );
    const endIndex = dataStatuses.findIndex(
      (status) => status.label === endStatus
    );

    if (endIndex >= beginIndex) {
      // End status index is equal or greater than begin status index
      selectStatusCallBack(beginStatus, endStatus);
    }
  };

  useEffect(() => {
    setDefaultStatusLabels(data);
    setBeginStatus(data[0].value);
    setEndStatus(data[data.length - 1].value);
  }, [dataStatuses]);

  useEffect(() => {
    setStatusNotification(notification);
  }, [notification]);

  useEffect(() => {
    if (!beginStatus || !endStatus) return;
    handleSubmit();
  }, [beginStatus, endStatus]);

  useEffect(() => {
    if (!beginStatus || !endStatus) return;
    const currentBeginStatus = defaultStatusLabels.find(
      (item) => item.label === beginStatus
    );
    const currentEndStatus = defaultStatusLabels.find(
      (item) => item.label === endStatus
    );
    if (!currentBeginStatus || !currentEndStatus) return;
    const endStatusLabels = defaultStatusLabels.filter(
      (item) => parseInt(item.index) >= parseInt(currentBeginStatus?.index)
    );
    setEndStatusLabels(endStatusLabels);
    if (parseInt(currentEndStatus?.index) > parseInt(currentBeginStatus?.index))
      return;
    setEndStatus(endStatusLabels[0].value);
  }, [beginStatus]);

  const resetStatus = () => {
    setBeginStatus(defaultStatusLabels[0].value);
    setEndStatus(defaultStatusLabels[defaultStatusLabels.length - 1].value);
    selectStatusCallBack(
      defaultStatusLabels[0].value,
      defaultStatusLabels[defaultStatusLabels.length - 1].value
    );
  };

  return (
    <>
      <div className="selector-title">
        Status Selector
        <br />
        {statusNotification ? (
          <span className="notice">{statusNotification}</span>
        ) : (
          <span>
            <br />
          </span>
        )}
      </div>
      <div className="status-selector">
        <SelectPicker
          label={"Begin"}
          className="item"
          data={defaultStatusLabels}
          style={{ width: 220 }}
          cleanable={false}
          value={beginStatus}
          onChange={(value) => setBeginStatus(value)}
        />

        <SelectPicker
          label={"End"}
          className="item"
          data={endStatusLabels}
          style={{ width: 220 }}
          onChange={(value) => setEndStatus(value)}
          value={endStatus}
          cleanable={false}
        />
      </div>
      <div className="submit-btn">
        <Button appearance="primary" onClick={resetStatus}>
          Reset
        </Button>
      </div>
    </>
  );
};
