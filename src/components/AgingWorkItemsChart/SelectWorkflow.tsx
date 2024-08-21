import { Checkbox } from "rsuite";
import { Status } from "../../types";

interface SelectWorkflow {
  setStatusCallBack: (status: { name: string; checked: boolean }) => void;
  statuses: Status[];
}

export const SelectWorkflow = ({
  setStatusCallBack,
  statuses,
}: SelectWorkflow) => {
  const handleCheckedStatus = (value: string, checked: boolean) => {
    setStatusCallBack({ name: value, checked: checked });
  };

  return (
    <>
      {statuses.map((item) => (
        <Checkbox
          key={item.name}
          defaultChecked
          value={item.name}
          onChange={handleCheckedStatus}
        >
          {item.label}
        </Checkbox>
      ))}
    </>
  );
};
