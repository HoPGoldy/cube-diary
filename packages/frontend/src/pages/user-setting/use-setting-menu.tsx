import React, { useState } from "react";
import { logout, stateUserJwtData } from "@/store/user";
import { SmileOutlined, BellOutlined } from "@ant-design/icons";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { useQueryArticleCount } from "@/services/article";

export interface SettingLinkItem {
  label: string;
  icon: React.ReactNode;
  onClick?: () => unknown;
}

export const useSettingMenu = () => {
  const userInfo = useAtomValue(stateUserJwtData);
  const navigate = useNavigate();
  /** 是否展示关于弹窗 */
  const [aboutVisible, setAboutVisible] = useState(false);

  const { data: countInfo } = useQueryArticleCount();

  const settingConfig = [
    {
      label: "标签管理",
      icon: <BellOutlined />,
      onClick: () => {
        navigate("/tags");
      },
    },
    {
      label: "关于",
      icon: <SmileOutlined />,
      onClick: () => setAboutVisible(true),
    },
  ].filter(Boolean) as SettingLinkItem[];

  const onLogout = () => {
    logout();
  };

  const articleCount = countInfo?.data?.articleCount || "---";
  const articleLength = countInfo?.data?.articleLength || "---";
  const userName = userInfo?.username || "---";

  return {
    articleCount,
    articleLength,
    userName,
    onLogout,
    aboutVisible,
    setAboutVisible,
    settingConfig,
  };
};
