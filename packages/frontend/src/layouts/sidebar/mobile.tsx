import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Flex, Row } from "antd";
import { MobileDrawer } from "@/components/mobile-drawer";
import { TreeMenu } from "@/components/tree-menu/mobile";
import {
  EMPTY_CLASSNAME,
  tabOptions,
  useMenu,
} from "@/layouts/sidebar/use-menu";
import { SplitLine } from "@/components/cell";
import { ColorDot } from "@/components/color-picker/color-dot";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { TabTypes } from "./use-menu";
import { SchemaArticleMenuType } from "@shared-types/article";

interface SidebarMobileProps {
  currentArticleId: string;
  open: boolean;
  onClose: () => void;
}

export const SidebarMobile: FC<SidebarMobileProps> = (props) => {
  const { currentArticleId, open, onClose } = props;
  const navigate = useNavigate();
  const menu = useMenu();
  /** 当前 treeMenu 所处的层级 */
  const [treeMenuPath, setTreeMenuPath] = useState<string[]>([]);
  /** 面包屑功能 */
  const { renderBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    const totalPath = [...(menu.parentArticleIds || []), currentArticleId];
    setTreeMenuPath(totalPath.slice(1));
  }, [menu.parentArticleIds, currentArticleId]);

  const onCloseDrawer = () => {
    onClose();
    setTreeMenuPath(menu.parentArticleIds || []);
  };

  /** 渲染下属文章列表 */
  const renderSubMenu = () => {
    if (!open) return null;
    if (menu.linkLoading) return <div className="my-8">加载中...</div>;

    return (
      <>
        <TreeMenu
          value={treeMenuPath}
          onChange={setTreeMenuPath}
          onClickNode={(node) => {
            navigate(`/article/${node.id}`);
            onClose();
          }}
          treeData={menu?.articleTree?.[0]?.children || []}
        />
      </>
    );
  };

  const renderMenuItem = (
    item: SchemaArticleMenuType,
    index: number,
    list: SchemaArticleMenuType[],
  ) => {
    return (
      <div key={item.id}>
        <div
          className="py-2 px-4 flex justify-between items-center h-[32px] text-base"
          onClick={() => {
            navigate(`/article/${item.id}`);
            onClose();
          }}
        >
          <span className="truncate">{item.title}</span>
          <ColorDot color={item.color} />
        </div>
        {index < list.length - 1 ? <SplitLine /> : null}
      </div>
    );
  };

  /** 渲染收藏文章列表 */
  const renderFavoriteMenu = () => {
    if (menu.favoriteLoading) return <div className="my-8">加载中...</div>;
    const currentMenu = menu.articleFavorite || [];

    return (
      <>
        {currentMenu.length === 0 ? (
          <div className={EMPTY_CLASSNAME}>暂无收藏</div>
        ) : (
          currentMenu.map((i, index) => renderMenuItem(i, index, currentMenu))
        )}
      </>
    );
  };

  const renderCurrentMenu = () => {
    switch (menu.currentTab) {
      case TabTypes.Sub:
        return renderSubMenu();
      case TabTypes.Favorite:
        return renderFavoriteMenu();
      default:
        return null;
    }
  };

  return (
    <MobileDrawer
      title={
        <div className="w-[95vw] overflow-x-auto">{renderBreadcrumb()}</div>
      }
      open={open}
      onClose={onCloseDrawer}
      footer={
        <Row gutter={8}>
          {/* <Col flex="0">
              <Button
                size="large"
                icon={<HomeOutlined />}
                onClick={onBackHomePage}
              />
            </Col> */}
          <Col flex="1">
            <Button block size="large" onClick={onCloseDrawer}>
              关闭
            </Button>
          </Col>
        </Row>
      }
      height="80%"
    >
      <div className="flex flex-col flex-nowrap h-full">
        <div className="flex-grow overflow-y-auto">{renderCurrentMenu()}</div>
        <div className="flex-shrink-0 mx-2">
          <Flex gap={8}>
            {tabOptions.map((tab) => {
              return (
                <Button
                  key={tab.value}
                  size="large"
                  block
                  type={menu.currentTab === tab.value ? "primary" : "default"}
                  onClick={() => menu.setCurrentTab(tab.value)}
                  icon={tab.icon}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Flex>
        </div>
      </div>
    </MobileDrawer>
  );
};
