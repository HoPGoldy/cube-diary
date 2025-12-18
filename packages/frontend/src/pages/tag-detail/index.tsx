import { useDetailType } from "@/utils/use-detail-type";
import { FC, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Form, Input, Modal } from "antd";
import { DETAIL_ID_KEY, DETAIL_TYPE_KEY } from "./use-detail-action";
import { useAddTag, useDeleteTag, useUpdateTag } from "@/services/tag";
import { useTagDict } from "../tag-manager/use-tag-dict";
import { ColorList } from "@/components/color-picker";

export const TagDetailModal: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const detailType = searchParams.get(DETAIL_TYPE_KEY);
  const detailId = searchParams.get(DETAIL_ID_KEY);

  const isOpen = !!detailType;
  const { isAdd, isEdit, isReadonly } = useDetailType(detailType);

  const { mutateAsync: addTag, isPending: adding } = useAddTag();
  const { mutateAsync: updateTag, isPending: updating } = useUpdateTag();
  const { mutateAsync: deleteTag, isPending: deleting } = useDeleteTag();

  const tags = useTagDict();
  const tagDetail = detailId ? tags.get(detailId) : null;

  useEffect(() => {
    const convert = async () => {
      if (!tagDetail) return;

      const formValues = {
        ...tagDetail,
      };

      form.setFieldsValue(formValues);
    };

    convert();
  }, [tagDetail]);

  const [form] = Form.useForm();

  const onCancel = () => {
    searchParams.delete(DETAIL_TYPE_KEY);
    searchParams.delete(DETAIL_ID_KEY);
    setSearchParams(searchParams, { replace: true });
  };

  const onSave = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();

    if (isAdd) {
      const resp = await addTag(values);
      if (resp?.code !== 200) return false;
    } else if (isEdit) {
      const resp = await updateTag({ id: detailId, ...values });
      if (resp?.code !== 200) return false;
    }

    onCancel();
    return true;
  };

  const onDelete = async () => {
    await deleteTag(detailId);
    onCancel();
  };

  return (
    <>
      <Modal
        title={isAdd ? "新增标签" : "编辑标签"}
        open={isOpen}
        onOk={onSave}
        width={600}
        loading={adding || updating}
        onCancel={onCancel}
        destroyOnClose
        footer={(node) => {
          return (
            <>
              {isEdit && (
                <Button danger loading={deleting} onClick={onDelete}>
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
          disabled={isReadonly}
          initialValues={{ color: "" }}
          style={{
            marginTop: 16,
          }}
        >
          <Form.Item
            label="标签名称"
            name="title"
            rules={[{ required: true, message: "请输入标签名称" }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>

          <Form.Item label="颜色" name="color">
            <ColorList />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
