import React, { useState } from "react";
import { logout, stateUserJwtData } from "@/store/user";
import {
  SmileOutlined,
  BellOutlined,
  DatabaseOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { useQueryDiaryCount } from "@/services/diary";

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
  /** 是否展示导入弹窗 */
  const [importVisible, setImportVisible] = useState(false);
  /** 是否展示导出弹窗 */
  const [exportVisible, setExportVisible] = useState(false);

  const { data: countInfo } = useQueryDiaryCount();

  const settingConfig = [
    {
      label: "标签管理",
      icon: <BellOutlined />,
      onClick: () => {
        navigate("/tags");
      },
    },
    {
      label: "导入",
      icon: <DatabaseOutlined />,
      onClick: () => setImportVisible(true),
    },
    {
      label: "导出",
      icon: <ExportOutlined />,
      onClick: () => setExportVisible(true),
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

  const diaryCount = countInfo?.data?.diaryCount || "---";
  const diaryLength = countInfo?.data?.diaryLength || "---";
  const userName = userInfo?.username || "---";

  return {
    diaryCount,
    diaryLength,
    userName,
    onLogout,
    aboutVisible,
    setAboutVisible,
    importVisible,
    setImportVisible,
    exportVisible,
    setExportVisible,
    settingConfig,
  };
};
