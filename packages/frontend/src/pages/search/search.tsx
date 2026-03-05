import { useSearchDiary } from "@/services/diary";
import { FC, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  PageContent,
  PageAction,
  ActionIcon,
  ActionSearch,
} from "@/layouts/page-with-action";
import { Button, Card, Col, Flex, Input, Pagination, Row } from "antd";
import { DEFAULT_PAGE_SIZE } from "@/config";
import { DesktopArea } from "@/layouts/responsive";
import {
  LeftOutlined,
  BgColorsOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { usePageTitle } from "@/store/global";
import { ColorList } from "@/components/color-picker";
import { EmptyTip } from "@/components/empty-tip";
import { MobileDrawer } from "@/components/mobile-drawer";
import type { SchemaDiarySearchItemType } from "@shared-types/diary";
import { formatDateStr } from "@/utils/dayjs";

/**
 * 搜索页面
 * 可以通过关键字和颜色来搜索日记
 */
const SearchDiary: FC = () => {
  usePageTitle("搜索日记");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // 搜索关键字
  const [keyword, setKeyword] = useState(
    () => searchParams.get("keyword") || "",
  );
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  // 当前分页
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  // 是否降序排列
  const [desc, setDesc] = useState(true);

  // 搜索结果列表
  const { data: searchResult, isLoading: isSearching } = useSearchDiary({
    keyword,
    colors: selectedColors,
    desc,
    page: currentPage,
  });

  const diaryList = searchResult?.data?.rows || [];
  const total = searchResult?.data?.total || 0;
  const searchStatus =
    keyword || selectedColors.length > 0 ? "success" : "pending";

  const onKeywordSearch = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);

    // 更新 url 参数
    if (value) searchParams.set("keyword", value);
    else searchParams.delete("keyword");
    setSearchParams(searchParams, { replace: true });
  };

  const renderSearchItem = (item: SchemaDiarySearchItemType) => {
    // 格式化日期作为标题
    const title = formatDateStr(item.dateStr);
    const colorfulContent = keyword
      ? item.content.replace(
          new RegExp(keyword, "gi"),
          `<span class='text-red-500'>${keyword}</span>`,
        )
      : item.content;

    return (
      <Link to={`/diary/${item.dateStr}`} key={item.dateStr} className="w-full">
        <Card
          className="mb-4 hover:ring-2 ring-gray-300 dark:ring-neutral-500 transition-shadow"
          size="small"
        >
          <Row>
            <Col span={24}>
              <div className="font-bold text-lg">{title}</div>
            </Col>
            <Col span={24}>
              <div
                className="text-sm text-gray-600 dark:text-neutral-300 mt-2 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: colorfulContent }}
              />
            </Col>
          </Row>
        </Card>
      </Link>
    );
  };

  // 目前只支持单选
  const onSelectColor = (colorCode: string) => {
    const newColors = colorCode ? [colorCode] : [];

    setSelectedColors(newColors);
    setCurrentPage(1);

    // 更新 url 参数
    if (newColors.length > 0) searchParams.set("colors", newColors.join(","));
    else searchParams.delete("colors");
    setSearchParams(searchParams, { replace: true });
  };

  const renderColorList = () => {
    return (
      <ColorList value={selectedColors[0] || ""} onChange={onSelectColor} />
    );
  };

  const renderSearchList = () => {
    if (isSearching) {
      return <EmptyTip title="正在搜索中..." subTitle="请稍候" />;
    }
    if (searchStatus === "pending") {
      return <EmptyTip subTitle="可使用关键词和颜色进行搜索" />;
    }
    if (diaryList.length === 0) {
      return (
        <div data-testid="search-empty-tip">
          <EmptyTip title="没有找到相关日记" subTitle="请尝试其他关键字" />
        </div>
      );
    }

    return (
      <Flex
        vertical
        align="center"
        gap={8}
        className="w-full"
        data-testid="search-result-list"
      >
        {diaryList.map(renderSearchItem)}
        <Pagination
          total={total}
          pageSize={DEFAULT_PAGE_SIZE}
          current={currentPage}
          onChange={setCurrentPage}
        />
      </Flex>
    );
  };

  const renderFilterArea = () => {
    return renderColorList();
  };

  const renderContent = () => {
    return (
      <Flex vertical gap={16} align="center" className="p-4">
        <DesktopArea>
          <Input.Search
            placeholder="请输入正文内容，回车搜索"
            enterButton="搜索"
            autoFocus
            size="large"
            onSearch={onKeywordSearch}
            data-testid="search-keyword-input"
          />
        </DesktopArea>
        <DesktopArea>{renderFilterArea()}</DesktopArea>
        {renderSearchList()}
      </Flex>
    );
  };

  const onToggleSort = () => {
    setDesc(!desc);
    setCurrentPage(1);
  };

  return (
    <>
      <PageContent>{renderContent()}</PageContent>

      <MobileDrawer
        title="日记筛选"
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        footer={
          <Row gutter={8}>
            <Col flex="1">
              <Button
                block
                size="large"
                onClick={() => setOpenFilterDrawer(false)}
              >
                确定
              </Button>
            </Col>
          </Row>
        }
      >
        <Flex vertical gap={16} className="p-4" align="center">
          {renderFilterArea()}
        </Flex>
      </MobileDrawer>

      <PageAction>
        <ActionIcon icon={<LeftOutlined />} onClick={() => navigate(-1)} />
        <ActionIcon
          icon={desc ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
          onClick={onToggleSort}
          title={desc ? "当前降序，点击切换为升序" : "当前升序，点击切换为降序"}
        />
        <ActionIcon
          icon={<BgColorsOutlined />}
          onClick={() => setOpenFilterDrawer(true)}
        />
        <ActionSearch onSearch={onKeywordSearch} />
      </PageAction>
    </>
  );
};

export default SearchDiary;
