import { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TreeMenu } from "@//components/tree-menu";
import {
  PlusOutlined,
  RollbackOutlined,
  InsertRowLeftOutlined,
} from "@ant-design/icons";
import { Button, Col, Row, Tooltip } from "antd";
import s from "./styles.module.css";
import { EMPTY_CLASSNAME, tabOptions, useMenu, TabTypes } from "./use-menu";
import Loading from "../loading";
import { ColorDot } from "@/components/color-picker/color-dot";
import { useCreateArticle } from "@/hooks/use-create-article";
import { useCurrentArticleId } from "@/hooks/use-current-article-id";
import { SchemaArticleMenuType } from "@shared-types/article";

export const Sidebar: FC = () => {
  const menu = useMenu();
  const navigate = useNavigate();
  const currentArticleId = useCurrentArticleId();
  const { createArticle } = useCreateArticle();

  const renderMenuItem = (item: SchemaArticleMenuType) => {
    return (
      <Link key={item.id} to={`/article/${item.id}`}>
        <div className={s.menuItem} title={item.title}>
          <span className="truncate">{item.title}</span>
          <ColorDot color={item.color} />
        </div>
      </Link>
    );
  };

  /** 当位于“标签管理”之类的非文章页面时渲染 */
  const renderConfigMenu = () => {
    return (
      <>
        <Link to={`/article/${menu.currentRootArticleId}`}>
          <Button
            className={`${s.toolBtn} keep-antd-style mb-2`}
            icon={<RollbackOutlined />}
            block
          >
            返回首页
          </Button>
        </Link>
        <Button
          className={`${s.toolBtn} keep-antd-style mb-2`}
          icon={<RollbackOutlined />}
          onClick={() => navigate(-1)}
          block
        >
          返回上一页
        </Button>
      </>
    );
  };

  /** 渲染下属文章列表 */
  const renderSubMenu = () => {
    if (menu.linkLoading) {
      return <Loading tip="加载中..." className="my-8" />;
    }
    const currentMenu = menu.childrenArticles || [];

    return (
      <>
        {menu.parentArticleIds && menu.parentArticleIds.length > 0 && (
          <Link
            to={`/article/${menu.parentArticleIds[menu.parentArticleIds.length - 1]}`}
          >
            <Button
              className={`${s.toolBtn} keep-antd-style mb-2`}
              icon={<RollbackOutlined />}
              block
            >
              返回{menu.parentArticleTitle}
            </Button>
          </Link>
        )}
        {currentMenu.length === 0 ? (
          <div className={EMPTY_CLASSNAME}>暂无子笔记</div>
        ) : (
          currentMenu.map(renderMenuItem)
        )}

        <Button
          className={`${s.toolBtn} keep-antd-style mt-2`}
          icon={<PlusOutlined />}
          onClick={createArticle}
          block
        >
          创建子笔记
        </Button>
      </>
    );
  };

  /** 渲染收藏文章列表 */
  const renderFavoriteMenu = () => {
    if (menu.favoriteLoading) {
      return <Loading tip="加载中..." className="my-8" />;
    }
    const currentMenu = menu.articleFavorite || [];

    return (
      <>
        {currentMenu.length === 0 ? (
          <div className={EMPTY_CLASSNAME}>暂无收藏</div>
        ) : (
          currentMenu.map(renderMenuItem)
        )}
      </>
    );
  };

  const renderCurrentMenu = () => {
    if (!currentArticleId) {
      return renderConfigMenu();
    }

    switch (menu.currentTab) {
      case TabTypes.Sub:
        return renderSubMenu();
      case TabTypes.Favorite:
        return renderFavoriteMenu();
      default:
        return null;
    }
  };

  const renderTabBtns = () => {
    if (!currentArticleId) return null;

    return (
      <Row gutter={8}>
        {tabOptions.map((item) => {
          const className = [s.toolBtn, "keep-antd-style"];
          if (item.value === menu.currentTab) className.push(s.selectedToolBtn);
          return (
            <Col span={12} key={item.value}>
              <Tooltip
                title={item.sidebarLabel}
                placement="bottom"
                color="#4b5563"
              >
                <Button
                  className={className.join(" ")}
                  onClick={() => menu.setCurrentTab(item.value)}
                  // style={{ backgroundColor: item.value === menu.currentTab ? '#f0f0f0' : '' }}
                  icon={item.icon}
                  block
                ></Button>
              </Tooltip>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <section className={s.sideberBox}>
      <div className="flex flex-row flex-nowrap items-center justify-center mb-3">
        <div className="font-black text-lg">Cube Note</div>
      </div>

      {renderTabBtns()}

      <div className="flex-grow flex-shrink overflow-y-auto noscrollbar overflow-x-hidden my-3">
        {renderCurrentMenu()}
      </div>
      <TreeMenu
        treeData={menu.articleTree[0]?.children || []}
        onClickNode={(node) => navigate(`/article/${node.id}`)}
      >
        <Button
          className={`${s.toolBtn} keep-antd-style`}
          icon={<InsertRowLeftOutlined />}
          block
        >
          笔记树
        </Button>
      </TreeMenu>
    </section>
  );
};
