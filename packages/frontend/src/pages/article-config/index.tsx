import { FC, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Flex, Form, Input, Modal, Radio, TreeSelect } from "antd";
import { DETAIL_ID_KEY } from "./use-detail-action";
import { ColorList } from "@/components/color-picker";
import {
  useDeleteArticle,
  useQueryArticleContent,
  useQueryArticleTree,
  useUpdateArticle,
} from "@/services/article";
import { useGetAppConfig } from "@/services/app-config";
import dayjs from "dayjs";
import { ColorDot } from "@/components/color-picker/color-dot";
import { SchemaArticleTreeNodeType } from "@shared-types/article";

/**
 * 寻找节点在树中的路径
 */
const findPath = (
  tree: SchemaArticleTreeNodeType[],
  nodeId: string,
): string[] => {
  for (const node of tree) {
    if (node.id === nodeId) return [node.id];

    if (node.children) {
      const path = findPath(node.children, nodeId);
      if (path.length) {
        return [node.id, ...path];
      }
    }
  }

  return [];
};

export const ArticleConfigModal: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { appConfig } = useGetAppConfig();
  const detailId = searchParams.get(DETAIL_ID_KEY);
  const [modal, contextHolder] = Modal.useModal();

  const isOpen = !!detailId;

  const { articleDetail, isLoading: articleLoading } =
    useQueryArticleContent(detailId);

  const isRootArticle =
    appConfig.ROOT_ARTICLE_ID && appConfig.ROOT_ARTICLE_ID === detailId;

  const { articleTree } = useQueryArticleTree(appConfig.ROOT_ARTICLE_ID);

  // 遍历每个节点，设置 disabled 属性，禁止选择自己和自己的子节点作为父节点
  const fullArticleTreeData = useMemo(() => {
    const setDisabled = (nodes: any[]): any[] => {
      return nodes.map((node) => {
        const isDisabled =
          node.id === detailId ||
          (node?.parentPath || "").split("#").includes(detailId);

        return {
          ...node,
          disabled: isDisabled,
          children: node.children ? setDisabled(node.children) : [],
        };
      });
    };

    if (!articleTree || articleTree.length === 0) return [];
    return setDisabled(articleTree);
  }, [articleTree, detailId]);

  const { mutateAsync: updateArticle, isPending: updatingArticle } =
    useUpdateArticle();

  const { mutateAsync: deleteArticle, isPending: deletingArticle } =
    useDeleteArticle();

  useEffect(() => {
    const convert = async () => {
      if (!articleDetail) return;

      const formValues = {
        ...articleDetail,
        parentId: articleDetail.parentPath
          ? articleDetail.parentPath.split("#").filter(Boolean).pop()
          : undefined,
      };

      form.setFieldsValue(formValues);
    };

    convert();
  }, [articleDetail]);

  const [form] = Form.useForm();

  const onCancel = () => {
    searchParams.delete(DETAIL_ID_KEY);
    setSearchParams(searchParams, { replace: true });
  };

  const onSave = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();

    const newPathArr = findPath(fullArticleTreeData, values.parentId);
    const newPath = newPathArr.length > 0 ? newPathArr.join("#") + "#" : "";

    const postData = {
      ...values,
      parentPath: newPath,
    };

    delete postData.parentId;

    const resp = await updateArticle({ id: detailId, ...postData });
    if (resp?.code !== 200) return false;

    onCancel();
    return true;
  };

  const onDeleteConfirm = async () => {
    modal.confirm({
      title: "确认删除该文章？",
      content: "删除后，笔记和其下属子笔记将无法恢复，请谨慎操作！",
      okText: "确认删除",
      okButtonProps: { danger: true, loading: deletingArticle },
      cancelText: "取消",
      onOk: onDelete,
    });
  };

  const onDelete = async () => {
    await deleteArticle({ id: detailId, force: true });
    const currentParentId = articleDetail?.parentPath
      ? articleDetail.parentPath.split("#").filter(Boolean).pop()
      : null;

    if (currentParentId) {
      navigate(`/article/${currentParentId}`);
    }
    onCancel();
  };

  return (
    <>
      <Modal
        title="文章配置"
        open={isOpen}
        onOk={onSave}
        width={600}
        loading={updatingArticle || articleLoading}
        onCancel={onCancel}
        destroyOnClose
        footer={(node) => {
          return (
            <>
              {isRootArticle ? null : (
                <Button danger onClick={onDeleteConfirm}>
                  删除
                </Button>
              )}
              {node}
            </>
          );
        }}
        afterClose={() => {
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ color: "" }}
          style={{
            marginTop: 16,
          }}
        >
          <Form.Item
            label="文章名称"
            name="title"
            rules={[{ required: true, message: "请输入文章名称" }]}
          >
            <Input placeholder="请输入文章名称" />
          </Form.Item>

          {isRootArticle ? null : (
            <Form.Item
              label="父级文章"
              name="parentId"
              tooltip="移动到指定位置。不能选择自己或自己的子文章"
            >
              <TreeSelect
                treeData={fullArticleTreeData}
                placeholder="请选择父级文章"
                fieldNames={{
                  label: "title",
                  value: "id",
                  children: "children",
                }}
                treeTitleRender={(nodeData) => {
                  return (
                    <Flex gap={8} align="center">
                      <div>{nodeData.title}</div>
                      <ColorDot color={nodeData.color} />
                    </Flex>
                  );
                }}
                allowClear
                treeLine
                treeDefaultExpandAll
              />
            </Form.Item>
          )}

          <Form.Item label="是否收藏" name="favorite">
            <Radio.Group
              options={[
                { label: "否", value: false },
                { label: "是", value: true },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="列出子笔记"
            name="listSubarticle"
            tooltip="开启后，将会在正文内容下方以列表形式展示子笔记，目录页、索引页建议开启"
          >
            <Radio.Group
              options={[
                { label: "否", value: false },
                { label: "是", value: true },
              ]}
            />
          </Form.Item>

          <Form.Item label="颜色" name="color">
            <ColorList />
          </Form.Item>
        </Form>
        <Flex vertical gap={8}>
          <Flex>
            <span className="text-gray-400 block mr-2">创建时间</span>
            <span>
              {dayjs(articleDetail?.createdAt).format("YYYY:MM:DD HH:mm:ss")}
            </span>
          </Flex>
          <Flex>
            <span className="text-gray-400 block mr-2">更新时间</span>
            <span>
              {dayjs(articleDetail?.updatedAt).format("YYYY:MM:DD HH:mm:ss")}
            </span>
          </Flex>
        </Flex>
      </Modal>

      {contextHolder}
    </>
  );
};
