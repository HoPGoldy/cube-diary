import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageContent,
  PageAction,
  ActionIcon,
  ActionSearch,
} from "@/layouts/page-with-action";
import { Button, Col, Input, Pagination, Row, Spin } from "antd";
import {
  BgColorsOutlined,
  LeftOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useSearchDiary } from "@/services/diary";
import { DiaryListItem } from "../month-list/list-item";
import { MobileDrawer } from "@/components/mobile-drawer";
import { ColorMultiplePicker } from "@/components/color-picker";
import { message } from "antd";

const TIP_CLASS = "mt-8 text-gray-500 dark:text-neutral-500 cursor-default";
const DEFAULT_PAGE_SIZE = 20;

/**
 * 搜索页面
 * 可以通过关键字和标签来搜索日记
 */
const DiarySearch: FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [desc, setDesc] = useState(true);

  const { data: diaryListResp, isLoading: isSearching } = useSearchDiary({
    keyword,
    colors: selectedColor,
    desc,
    page: currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const onKeywordSearch = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
  };

  const renderContent = () => {
    if (isSearching) return <Spin spinning={isSearching} />;

    if (!keyword && !selectedColor.length) {
      return <div className={TIP_CLASS}>输入关键字或选择颜色进行搜索</div>;
    }

    if (!diaryListResp?.data?.rows.length) {
      return <div className={TIP_CLASS}>没有找到相关日记</div>;
    }

    return (
      <>
        <div className="w-full">
          {diaryListResp?.data?.rows.map((item) => (
            <DiaryListItem key={item.date} item={item} />
          ))}
        </div>
        <Pagination
          className="mt-4"
          pageSize={DEFAULT_PAGE_SIZE}
          current={currentPage}
          onChange={setCurrentPage}
          total={diaryListResp?.data?.total || 0}
        />
      </>
    );
  };

  return (
    <>
      <PageContent>
        <div className="p-4">
          <div className="hidden md:block">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Input.Search
                  placeholder="请输入标题或者正文，回车搜索"
                  enterButton="搜索"
                  size="large"
                  autoFocus
                  onSearch={onKeywordSearch}
                />
              </Col>
              <Col span={24}>
                <ColorMultiplePicker
                  value={selectedColor}
                  onChange={setSelectedColor}
                />
              </Col>
            </Row>
          </div>
          <div className="md:my-4 flex flex-col flex-nowrap justify-center items-center">
            {renderContent()}
          </div>
        </div>
      </PageContent>

      <PageAction>
        <ActionIcon icon={<LeftOutlined />} onClick={() => navigate(-1)} />
        <ActionIcon
          icon={desc ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
          onClick={() => {
            setDesc(!desc);
            message.success(
              desc ? "升序，日期较早的展示在前" : "降序，日期较晚的展示在前",
            );
          }}
        />
        <ActionIcon
          icon={<BgColorsOutlined />}
          onClick={() => setShowColorPicker(true)}
        />
        <ActionSearch onSearch={onKeywordSearch} />
      </PageAction>

      <MobileDrawer
        title="选择颜色"
        open={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        height="auto"
        footer={
          <Button
            block
            size="large"
            onClick={() => {
              setShowColorPicker(false);
              setSelectedColor([]);
            }}
          >
            清空
          </Button>
        }
      >
        <ColorMultiplePicker
          value={selectedColor}
          onChange={setSelectedColor}
        />
      </MobileDrawer>
    </>
  );
};

export default DiarySearch;
