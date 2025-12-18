import React, { useMemo } from 'react';
import { AppTheme } from '@/types/user';
import { changeTheme, getUserTheme, logout, stateUser } from '@/client/store/user';
import { useQueryDiaryCount, useSetTheme } from '@/client/services/user';
import {
  LockOutlined,
  DatabaseOutlined,
  TagsOutlined,
  SmileOutlined,
  ContactsOutlined,
} from '@ant-design/icons';
import { useJwtPayload } from '@/client/utils/jwt';
import { useAtomValue } from 'jotai';
import useChangePassword from '../changePassword';
import useAbout from '../about';
import useUserManage from '../userInvite';
import useImportDiary from '../importDiary';
import useExportDiary from '../exportDiary';

export interface SettingLinkItem {
  label: string;
  icon: React.ReactNode;
  hidden?: boolean;
  onClick: () => void;
}

export const useSetting = () => {
  const userInfo = useAtomValue(stateUser);
  /** 修改密码功能 */
  const changePassword = useChangePassword();
  /** 用户管理 */
  const userManage = useUserManage();
  /** 关于页面 */
  const about = useAbout();
  /** 日记导入 */
  const importDiary = useImportDiary();
  /** 日记导出 */
  const exportDiary = useExportDiary();
  // 数量统计接口
  const { data: countInfo } = useQueryDiaryCount();
  /** 是否是管理员 */
  const jwtPayload = useJwtPayload();
  /** 主题设置 */
  const { mutateAsync: updateAppTheme } = useSetTheme();

  const settingConfig = useMemo(() => {
    const list: SettingLinkItem[] = [
      {
        label: '修改密码',
        icon: <LockOutlined />,
        onClick: changePassword.showModal,
      },
      {
        label: '用户管理',
        icon: <ContactsOutlined />,
        onClick: userManage.showModal,
        hidden: !jwtPayload?.isAdmin,
      },
      { label: '导入', icon: <DatabaseOutlined />, onClick: importDiary.showModal },
      { label: '导出', icon: <TagsOutlined />, onClick: exportDiary.showModal },
      { label: '关于', icon: <SmileOutlined />, onClick: about.showModal },
    ].filter((i) => !i.hidden);

    return list;
  }, [jwtPayload?.isAdmin]);

  const onSwitchTheme = () => {
    const newTheme = userInfo?.theme === AppTheme.Light ? AppTheme.Dark : AppTheme.Light;
    updateAppTheme(newTheme);
    changeTheme(newTheme);
  };

  const onLogout = () => {
    logout();
  };

  const diaryCount = countInfo?.data?.diaryCount || '---';
  const diaryLength = countInfo?.data?.diaryLength || '---';
  const userName = userInfo?.username || '---';
  const userTheme = getUserTheme(userInfo);

  const renderModal = () => {
    return (
      <>
        {changePassword.renderModal()}
        {userManage.renderModal()}
        {importDiary.renderModal()}
        {exportDiary.renderModal()}
        {about.renderModal()}
      </>
    );
  };

  return {
    diaryCount,
    diaryLength,
    userName,
    onLogout,
    settingConfig,
    userTheme,
    onSwitchTheme,
    renderModal,
  };
};
