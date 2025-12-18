import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { echarts } from "@/components/echarts/lib";
import { EChartsOption } from "echarts";

interface EchartsProps {
  options?: EChartsOption;
}

export interface EchartsRef {
  chartRef: React.MutableRefObject<echarts.ECharts | null>;
}

/**
 * react 组件中渲染 echarts 图表组件
 */
export const Echarts = forwardRef<EchartsRef, EchartsProps>((props, ref) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useImperativeHandle(ref, () => ({
    chartRef,
  }));

  useEffect(() => {
    if (!props.options) return;
    if (!chartRef.current) {
      chartRef.current = echarts.init(chartContainerRef.current);
    }
    try {
      chartRef.current.setOption(props.options, {
        notMerge: false,
        lazyUpdate: false,
      });
    } catch (e) {
      console.debug("echarts 渲染异常", e, props.options);
    }
  }, [JSON.stringify(props.options)]);

  // 图表自适应尺寸
  useEffect(() => {
    const resize = () => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    };

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <div ref={chartContainerRef} className="h-full w-full" />;
});
