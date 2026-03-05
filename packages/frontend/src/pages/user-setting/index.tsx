import { FC, Fragment } from "react";
import { Button, Card, Col, Drawer, Flex, Modal, Row, Statistic } from "antd";
import {
  CloseCircleOutlined,
  HighlightOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import { UserOutlined, RightOutlined, LogoutOutlined } from "@ant-design/icons";
import { Cell, SplitLine } from "@/components/cell";
import { SettingLinkItem, useSettingMenu } from "./use-setting-menu";
import { AboutModal } from "../about";
import { DiaryImport, DiaryExport } from "../diary";
import { AccessTokenModal } from "../access-token";
import { McpSettingsModal } from "../mcp-settings";

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
              title="日记数量"
              value={settingHook.diaryCount}
              prefix={<SnippetsOutlined />}
            />
          </Col>
          <Col>
            <Statistic
              title="总字数"
              value={settingHook.diaryLength}
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

      <Modal
        open={settingHook.importVisible}
        onCancel={() => settingHook.setImportVisible(false)}
        footer={null}
        title="日记导入"
        width="80%"
        destroyOnClose
      >
        <DiaryImport onClose={() => settingHook.setImportVisible(false)} />
      </Modal>

      <Modal
        open={settingHook.exportVisible}
        onCancel={() => settingHook.setExportVisible(false)}
        footer={null}
        title="日记导出"
        width="80%"
        destroyOnClose
      >
        <DiaryExport onClose={() => settingHook.setExportVisible(false)} />
      </Modal>

      <AccessTokenModal
        open={settingHook.accessTokenVisible}
        onClose={() => settingHook.setAccessTokenVisible(false)}
      />

      <McpSettingsModal
        open={settingHook.mcpSettingsVisible}
        onClose={() => settingHook.setMcpSettingsVisible(false)}
        onOpenTokenManager={() => {
          settingHook.setMcpSettingsVisible(false);
          settingHook.setAccessTokenVisible(true);
        }}
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
                  title="日记数量"
                  value={settingHook.diaryCount}
                  prefix={<SnippetsOutlined />}
                />
              </Col>
              <Col>
                <Statistic
                  title="总字数"
                  value={settingHook.diaryLength}
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

      <Drawer
        open={settingHook.importVisible}
        onClose={() => settingHook.setImportVisible(false)}
        width="100%"
        placement="left"
        title="日记导入"
        destroyOnClose
      >
        <DiaryImport onClose={() => settingHook.setImportVisible(false)} />
      </Drawer>

      <Drawer
        open={settingHook.exportVisible}
        onClose={() => settingHook.setExportVisible(false)}
        width="100%"
        placement="left"
        title="日记导出"
        destroyOnClose
      >
        <DiaryExport onClose={() => settingHook.setExportVisible(false)} />
      </Drawer>

      <AccessTokenModal
        open={settingHook.accessTokenVisible}
        onClose={() => settingHook.setAccessTokenVisible(false)}
      />

      <McpSettingsModal
        open={settingHook.mcpSettingsVisible}
        onClose={() => settingHook.setMcpSettingsVisible(false)}
        onOpenTokenManager={() => {
          settingHook.setMcpSettingsVisible(false);
          settingHook.setAccessTokenVisible(true);
        }}
      />
    </Drawer>
  );
};
