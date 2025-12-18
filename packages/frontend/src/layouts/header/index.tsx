import { FC, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Popover, Tooltip } from "antd";
import s from "./styles.module.css";
import { DesktopSetting } from "@/pages/user-setting";
import { useAtomValue } from "jotai";
import { stateUserJwtData } from "@/store/user";
import { statePageTitle } from "@/store/global";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { Link } from "react-router-dom";

interface Props {
  onClickCollasedIcon: () => void;
  collapsed: boolean;
}

const Header: FC<Props> = (props) => {
  const { onClickCollasedIcon, collapsed } = props;
  /** 是否打开用户管理菜单 */
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  /** 用户名 */
  const userInfo = useAtomValue(stateUserJwtData);
  /** 侧边栏展开按钮 */
  const CollasedIcon = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined;
  const currentPageTitle = useAtomValue(statePageTitle);
  const { renderBreadcrumb } = useBreadcrumb();

  return (
    <header className={s.headerBox}>
      <div className="flex flex-nowrap flex-grow overflow-hidden">
        <CollasedIcon onClick={onClickCollasedIcon} className="text-xl mr-4" />
        <div>{currentPageTitle || renderBreadcrumb()}</div>
      </div>
      <div className="flex flex-nowrap flex-shrink-0 ml-2">
        <Tooltip title="搜索文章 Ctrl + F">
          <Link to="/search">
            <Button icon={<SearchOutlined />} className="w-60">
              搜索
            </Button>
          </Link>
        </Tooltip>
        <Popover
          placement="bottomRight"
          trigger="click"
          content={<DesktopSetting onClick={() => setUserMenuVisible(false)} />}
          open={userMenuVisible}
          onOpenChange={setUserMenuVisible}
          arrow
        >
          <div className="flex flex-nowrap justify-center items-center ml-2 flex-shrink-0">
            <UserOutlined className="cursor-pointer text-xl mr-2" />
            <span className="cursor-pointer flex-shrink-0 max-w-[300px] truncate">
              {userInfo?.username}
            </span>
          </div>
        </Popover>
      </div>
    </header>
  );
};

export default Header;
