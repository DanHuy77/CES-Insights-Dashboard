import {
  Chart,
  TooltipFormatterCallbackFunction,
  TooltipFormatterContextObject,
} from "highcharts";
import { Point, Label } from "../../types/aging";
import { useEffect, useState, useRef } from "react";
import * as ReactDOM from "react-dom";
import { Tooltip as TooltipType } from "highcharts";
import { ChartTypes } from "../../types/chartTypes";

const generateTooltipId = (chartId: number) =>
  `highcharts-custom-tooltip-${chartId}`;

interface Props {
  chart: Chart | null;
  chartTypes: ChartTypes;
  children(formatterContext: TooltipFormatterContextObject): JSX.Element;
}

export const Tooltip = ({ chart, children, chartTypes }: Props) => {
  const isInit = useRef(false);
  const [context, setContext] = useState<TooltipFormatterContextObject | null>(
    null
  );
  useEffect(() => {
    if (chart) {
      const formatter: TooltipFormatterCallbackFunction = function () {
        // Ensures that tooltip DOM container is rendered before React portal is created.
        if (!isInit.current) {
          isInit.current = true;
          // TODO: Is there a better way to create tooltip DOM container?
          chart.tooltip.refresh.apply(chart.tooltip, [this.point]);
          chart.tooltip.hide(0);
        }
        setContext(this);
        return `<div class="tooltip-custom" id="${generateTooltipId(
          chart.index
        )}"></div>`;
      };
      if (Object.keys(chart).length) {
        chart.update({
          tooltip: {
            useHTML: true,
            formatter,
            stickOnContact: true,
            hideDelay: 100,
            shared: true,
            positioner: function (_labelWidth, labelHeight, point) {
              // Calculate the desired position below the data point
              const x =
                chartTypes === ChartTypes.CYCLETIME
                  ? point.plotX - 70
                  : point.plotX;
              const y =
                chartTypes === ChartTypes.CYCLETIME
                  ? point.plotY + labelHeight - 48
                  : point.plotY + labelHeight; // You can adjust the value to control the distance from the point
              return {
                x: x,
                y: y,
              };
            },
            style: {
              pointerEvents: "auto",
            },
          },
        });
      }
    }
  }, [chart]);

  useEffect(() => {
    if (context) {
      const tooltip: TooltipType = context.series.chart.tooltip;
      const numberOfTask = (context.point as Point).data?.length || 0;
      (tooltip.getLabel() as Label).box.attr({
        height: 50 + numberOfTask * 18,
        width: 140,
      });
    }
  }, [context]);
  const node = chart && document.getElementById(generateTooltipId(chart.index));

  return node && context
    ? ReactDOM.createPortal(children(context), node)
    : null;
};
