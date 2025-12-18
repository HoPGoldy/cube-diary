import { FC, Fragment } from "react";
import { Button, Card, Col, Drawer, Flex, Row, Statistic } from "antd";
import {
  CloseCircleOutlined,
  HighlightOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import { UserOutlined, RightOutlined, LogoutOutlined } from "@ant-design/icons";
import { Cell, SplitLine } from "@/components/cell";
import { SettingLinkItem, useSettingMenu } from "./use-setting-menu";
import { AboutModal } from "../about";

interface DesktopProps {
  onClick: () => void;
}

export const DesktopSetting: FC<DesktopProps> = (props) => {
  /** 设置功能 */
  const settingHook = useSettingMenu();

  const renderConfigItem = (item: SettingLinkItem) => {
    return (
      <Col span={24} key={item.label}>
        <Button block onClick={item.onClick} icon={item.icon}>
          {item.label}
        </Button>
      </Col>
    );
  };

  return (
    <div style={{ width: "16rem" }}>
      <div style={{ margin: "0 0 1rem 0" }}>
        <Row gutter={[16, 16]} justify="space-around">
          <Col>
            <Statistic
              title="笔记数量"
              value={settingHook.articleCount}
              prefix={<SnippetsOutlined />}
            />
          </Col>
          <Col>
            <Statistic
              title="总字数"
              value={settingHook.articleLength}
              prefix={<HighlightOutlined />}
            />
          </Col>
        </Row>
      </div>
      <Row gutter={[0, 8]} onClick={props.onClick}>
        {settingHook.settingConfig.map(renderConfigItem)}

        <Col span={24}>
          <Button
            block
            danger
            onClick={settingHook.onLogout}
            icon={<CloseCircleOutlined />}
          >
            登出
          </Button>
        </Col>
      </Row>

      <AboutModal
        open={settingHook.aboutVisible}
        onClose={() => settingHook.setAboutVisible(false)}
      />
    </div>
  );
};

interface MobileProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
}

export const MobileSetting: FC<MobileProps> = (props) => {
  /** 设置功能 */
  const settingHook = useSettingMenu();

  const renderConfigItem = (item: SettingLinkItem, index: number) => {
    return (
      <Fragment key={item.label}>
        <Cell
          title={
            <div>
              {item.icon} &nbsp;{item.label}
            </div>
          }
          onClick={item.onClick}
          extra={<RightOutlined />}
        />
        {index !== settingHook.settingConfig.length - 1 && <SplitLine />}
      </Fragment>
    );
  };

  return (
    <Drawer
      open={props.visible}
      onClose={() => props.onVisibleChange(false)}
      width="100%"
      placement="left"
      styles={{
        header: { display: "none" },
        footer: { padding: 8, borderTop: "none" },
      }}
      footer={
        <Button
          block
          size="large"
          type="primary"
          onClick={() => props.onVisibleChange(false)}
        >
          返回
        </Button>
      }
    >
      <Flex vertical className="p-4" gap={16}>
        <h1 className="text-center">Cube Note</h1>
        <Flex vertical gap={16} className="flex-grow">
          <Card size="small">
            <Row justify="space-around">
              <Col>
                <Statistic
                  title="笔记数量"
                  value={settingHook.articleCount}
                  prefix={<SnippetsOutlined />}
                />
              </Col>
              <Col>
                <Statistic
                  title="总字数"
                  value={settingHook.articleLength}
                  prefix={<HighlightOutlined />}
                />
              </Col>
            </Row>
          </Card>

          <Card size="small" styles={{ body: { padding: "0px 18px" } }}>
            {settingHook.settingConfig.map(renderConfigItem)}
          </Card>

          <Card size="small" styles={{ body: { padding: "0px 18px" } }}>
            <Cell
              onClick={settingHook.onLogout}
              title={
                <div>
                  <UserOutlined /> &nbsp;登出
                </div>
              }
              extra={<LogoutOutlined />}
            />
          </Card>
        </Flex>
      </Flex>

      <AboutModal
        open={settingHook.aboutVisible}
        onClose={() => settingHook.setAboutVisible(false)}
      />
    </Drawer>
  );
};
