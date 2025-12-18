import { Button, Flex } from "antd";
import { FC, useEffect, useRef, useState } from "react";
import { SwitchTransition, CSSTransition } from "react-transition-group";
import { FolderOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { SplitLine } from "../cell";
import { EMPTY_CLASSNAME } from "@/layouts/sidebar/use-menu";
import { ColorDot } from "../color-picker/color-dot";
import { SchemaArticleTreeNodeType } from "@shared-types/article";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  selectedIds?: string[];
  onClickNode?: (node: SchemaArticleTreeNodeType) => void;
  treeData: SchemaArticleTreeNodeType[];
}

/**
 * 根据 value 找到对应的节点列表
 */
const findNodeList = (
  value: string[],
  treeData: SchemaArticleTreeNodeType[],
) => {
  let currentNodeList = treeData;
  for (let i = 0; i < value.length; i++) {
    const id = value[i];
    const node = currentNodeList.find((node) => node.id === id);
    currentNodeList = node?.children || [];
  }
  return currentNodeList;
};

export const TreeMenu: FC<Props> = (props) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [currentList, setCurrentList] = useState<SchemaArticleTreeNodeType[]>(
    [],
  );
  /** 动画 */
  const [animating, setAnimating] = useState("to-left");

  useEffect(() => {
    setCurrentList(findNodeList(props.value, props.treeData));
  }, [props.value]);

  const goBack = () => {
    setAnimating("to-left");
    setTimeout(() => {
      props.onChange(props.value.slice(0, -1));
    }, 0);
  };

  const goForward = (id: string) => {
    setAnimating("to-right");
    setTimeout(() => {
      props.onChange([...props.value, id]);
    }, 0);
  };

  const renderBackButton = () => {
    return (
      <>
        <Flex onClick={goBack} className="m-2">
          <ArrowLeftOutlined />
          <div className="ml-2 text-left font-bold text-lg">返回上一级</div>
        </Flex>
        <SplitLine />
      </>
    );
  };

  const renderMenuItem = (item: SchemaArticleTreeNodeType, index: number) => {
    const selected = props.selectedIds?.includes(item.id);
    return (
      <div key={item.id}>
        <div
          className={
            "py-2 px-4 flex justify-between items-center h-[32px] rounded text-base " +
            (selected ? "bg-green-500 text-white" : "")
          }
        >
          <span
            className="flex-grow truncate dark:text-neutral-200"
            onClick={() => props.onClickNode?.(item)}
          >
            {item.title}
          </span>
          <Flex gap={8} justify="flex-start" align="center">
            {item.children?.length > 0 && (
              <Button
                onClick={() => goForward(item.id)}
                className="ml-2 shrink-0"
                type="text"
                icon={
                  <FolderOutlined className={selected ? "text-white" : ""} />
                }
              />
            )}
            <ColorDot color={item.color} />
          </Flex>
        </div>
        {index < currentList.length - 1 ? <SplitLine /> : null}
      </div>
    );
  };

  return (
    <SwitchTransition>
      <CSSTransition
        key={`-${props.value.join("-")}-`}
        nodeRef={nodeRef}
        classNames={animating}
        addEndListener={(done) => {
          nodeRef.current?.addEventListener("transitionend", done, false);
        }}
      >
        <div ref={nodeRef} className="overflow-hidden">
          <div className="menu-container">
            {props.value.length ? renderBackButton() : null}
            {currentList.length <= 0 ? (
              <div className={EMPTY_CLASSNAME}>暂无子笔记</div>
            ) : (
              currentList.map(renderMenuItem)
            )}
          </div>
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
};
