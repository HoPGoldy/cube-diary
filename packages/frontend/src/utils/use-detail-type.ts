/** 详情弹窗类型 */
export enum DetailPageType {
  /** 查看 */
  Readonly = "readonly",
  /** 新建 */
  Add = "add",
  /** 编辑 */
  Edit = "edit",
}

/**
 * 获取详情页相关配置
 */
export const useDetailType = (detailType?: string) => {
  /** 是否为详情页 */
  const isReadonly = detailType === DetailPageType.Readonly;
  /** 是否为新建页 */
  const isAdd = detailType === DetailPageType.Add;
  /** 是否为编辑页 */
  const isEdit = detailType === DetailPageType.Edit;

  return { isReadonly, isAdd, isEdit };
};
