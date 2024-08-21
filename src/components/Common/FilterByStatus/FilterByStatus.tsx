
import { Checkbox } from "rsuite";
import { Status } from "../../../types";

export const FilterByStatus = ({
  setStatusCallBack, statuses
}: {
  setStatusCallBack: (status: { name: string; checked: boolean }) => void;
  statuses: Status[]
}) => {
  const handleCheckedStatus = (value: string, checked: boolean) => {
    setStatusCallBack({ name: value, checked: checked });
  };

  return (
    <>
    <div>
      {statuses.map((item) => (
        <Checkbox key={item.name} defaultChecked value={item.label} onChange={handleCheckedStatus}>
          {item.label}
        </Checkbox>
      ))}
      </div>
    </>
  );
};
