import { Flex } from "antd";

interface PageLoadingProps {
  tip?: string;
}

export const PageLoading = ({ tip = "加载中..." }: PageLoadingProps) => {
  return (
    <Flex justify="center" align="center" style={{ height: "100%" }}>
      {tip}
    </Flex>
  );
};
