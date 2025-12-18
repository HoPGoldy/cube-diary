import { createRoot } from "react-dom/client";
import { routes } from "./route";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./services/base";
// import { ReactQueryDevtools } from 'react-query/devtools'
import { App as AntdApp } from "antd";
import { RouterProvider } from "react-router-dom";
import "./styles/index.css";
import { useInitMessage } from "./utils/message";
import { AntdConfigProvider } from "./components/antd-config-provider";
import { ResponsiveProvider } from "./layouts/responsive";
import { initDayjs } from "./utils/dayjs";

initDayjs();

const App = () => {
  useInitMessage();
  return (
    <>
      <RouterProvider router={routes} />
      {/* <ReactQueryDevtools initialIsOpen={false} position="bottom-right" /> */}
    </>
  );
};

/**
 * React.StrictMode会导致 SortableJS 在移动端无法正常放下元素（可以拖动，不能放下）
 * 所以这里并没有使用 StrictMode
 * @see https://github.com/SortableJS/react-sortablejs/issues/241
 */
createRoot(document.getElementById("root")!).render(
  <ResponsiveProvider>
    <AntdConfigProvider>
      <QueryClientProvider client={queryClient}>
        <AntdApp className="h-full">
          <App />
        </AntdApp>
      </QueryClientProvider>
    </AntdConfigProvider>
  </ResponsiveProvider>,
);
