import { FC, PropsWithChildren, useMemo } from "react";
import { ConfigProvider, ThemeConfig } from "antd";
import zhCN from "antd/locale/zh_CN";
import cloneDeep from "lodash/cloneDeep";
import { useIsMobile } from "../layouts/responsive";
import { THEME_PRIMARY_COLOR } from "@/config";

const globalThemeConfig: ThemeConfig = {
  token: {
    colorPrimary: THEME_PRIMARY_COLOR,
    lineWidth: 2,
    controlOutlineWidth: 1,
  },
  components: {
    Card: {
      colorBorderSecondary: "var(--color-border-secondary)",
      lineHeight: 1.6,
    },
  },
};

/**
 * antd 使用的主题配置
 */
export const AntdConfigProvider: FC<PropsWithChildren> = (props) => {
  const isMobile = useIsMobile();

  const themeConfig: ThemeConfig = useMemo(() => {
    const theme = cloneDeep(globalThemeConfig);
    document.documentElement.style.setProperty(
      "--frontend-app-primary-button-color",
      THEME_PRIMARY_COLOR,
    );

    if (isMobile) theme.token.fontSize = 16;

    return theme;
  }, [isMobile]);

  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      {props.children}
    </ConfigProvider>
  );
};
