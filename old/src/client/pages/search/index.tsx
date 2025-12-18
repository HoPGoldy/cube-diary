import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent, PageAction, ActionIcon, ActionSearch } from '../../layouts/pageWithAction';
import { Button, Col, Input, Pagination, Row, Spin } from 'antd';
import { PAGE_SIZE } from '@/config';
import { DesktopArea } from '@/client/layouts/responsive';
import {
  BgColorsOutlined,
  LeftOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { PageTitle } from '@/client/components/pageTitle';
import { useSearchDiary } from '@/client/services/diary';
import { DiaryListItem } from '../monthList/listItem';
import { MobileDrawer } from '@/client/components/mobileDrawer';
import { ColorMutiplePicker } from '@/client/components/colorPicker';
import { messageSuccess } from '@/client/utils/message';
import s from '@/client/pages/monthList/styles.module.css';

const TIP_CLASS = 'mt-8 text-gray-500 dark:text-neutral-500 cursor-default';

/**
 * 搜索页面
 * 可以通过关键字和标签来搜索笔记
 */
const SearchDiary: FC = () => {
  const navigate = useNavigate();
  /** 搜索关键字 */
  const [keyword, setKeyword] = useState('');
  /** 是否显示颜色选择器 */
  const [showColorPicker, setShowColorPicker] = useState(false);
  /** 当前选中的颜色 */
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  /** 当前分页 */
  const [currentPage, setCurrentPage] = useState(1);
  /** 是否降序排列 */
  const [desc, setDesc] = useState(true);
  // 搜索结果列表
  const { data: diaryListResp, isLoading: isSearching } = useSearchDiary({
    keyword,
    colors: selectedColor,
    desc,
    page: currentPage,
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
        <div className={s.listContainer}>
          {diaryListResp?.data?.rows.map((item) => <DiaryListItem key={item.date} item={item} />)}
        </div>
        <Pagination
          className='mt-4'
          pageSize={PAGE_SIZE}
          current={currentPage}
          onChange={setCurrentPage}
          total={diaryListResp?.data?.total || 0}
        />
      </>
    );
  };

  return (
    <>
      <PageTitle title='搜索日记' />

      <PageContent>
        <div className='p-4'>
          <DesktopArea>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Input.Search
                  placeholder='请输入标题或者正文，回车搜索'
                  enterButton='搜索'
                  size='large'
                  autoFocus
                  onSearch={onKeywordSearch}
                />
              </Col>
              <Col span={24}>
                <ColorMutiplePicker value={selectedColor} onChange={setSelectedColor} />
              </Col>
            </Row>
          </DesktopArea>
          <div className='md:my-4 flex flex-col flex-nowrap justify-center items-center'>
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
            messageSuccess(desc ? '升序，日期较早的展示在前' : '降序，日期较晚的展示在前');
          }}
        />
        <ActionIcon icon={<BgColorsOutlined />} onClick={() => setShowColorPicker(true)} />
        <ActionSearch onSearch={onKeywordSearch} />
      </PageAction>

      <MobileDrawer
        title='选择颜色'
        open={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        height='16rem'
        footer={
          <Button
            block
            size='large'
            onClick={() => {
              setShowColorPicker(false);
              setSelectedColor([]);
            }}>
            清空
          </Button>
        }>
        <ColorMutiplePicker value={selectedColor} onChange={setSelectedColor} />
      </MobileDrawer>
    </>
  );
};

export default SearchDiary;
