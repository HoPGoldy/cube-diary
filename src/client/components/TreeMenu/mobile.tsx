import { ArticleTreeNode } from '@/types/article'
import { Button } from 'antd'
import React, { FC, useEffect, useRef, useState } from 'react'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import { LeftOutlined, FolderOutlined } from '@ant-design/icons'
import { SplitLine } from '../Cell'
import { EMPTY_CLASSNAME } from '@/client/layouts/Sidebar/useMenu'

interface Props {
    value: number[]
    onChange: (value: number[]) => void
    selectedIds?: number[]
    onClickNode?: (node: ArticleTreeNode) => void
    treeData: ArticleTreeNode[]
}

/**
 * 根据 value 找到对应的节点列表
 */
const findNodeList = (value: number[], treeData: ArticleTreeNode[]) => {
    let currentNodeList = treeData
    for (let i = 0; i < value.length; i++) {
        const id = value[i]
        const node = currentNodeList.find(node => node.value === id)
        currentNodeList = node?.children || []
    }
    return currentNodeList
}

export const TreeMenu: FC<Props> = (props) => {
    const nodeRef = useRef<HTMLDivElement>(null)
    const [currentList, setCurrentList] = useState<ArticleTreeNode[]>([])
    /** 动画 */
    const [animating, setAnimating] = useState('to-left')

    useEffect(() => {
        setCurrentList(findNodeList(props.value, props.treeData))
    }, [props.value])

    const goBack = () => {
        setAnimating('to-left')
        setTimeout(() => {
            props.onChange(props.value.slice(0, -1))
        }, 0)
    }

    const goForward = (id: number) => {
        setAnimating('to-right')
        setTimeout(() => {
            props.onChange([...props.value, id])
        }, 0)
    }

    const renderBackButton = () => {
        return (
            <div onClick={goBack} className='mb-2 text-left font-bold text-lg dark:text-neutral-200'>
                <LeftOutlined /> 返回
            </div>
        )
    }

    const renderMenuItem = (item: ArticleTreeNode, index: number) => {
        const selected = props.selectedIds?.includes(item.value)
        return (<div key={item.value}>
            <div
                className={
                    'mb-2 px-2 flex justify-between items-center h-[32px] rounded text-base ' +
                    (selected ? 'bg-green-500 text-white' : '')
                }
            >
                <span
                    className="flex-shrink-0 w-2 h-[60%] bg-gray-300 dark:bg-neutral-700 mr-2 rounded"
                    style={{ backgroundColor: item.color }}
                />
                <span
                    className="flex-grow truncate dark:text-neutral-200"
                    onClick={() => props.onClickNode?.(item)}
                >
                    {item.title}
                </span>
                {item.children?.length && (
                    <Button
                        onClick={() => goForward(item.value)}
                        className="ml-2 shrink-0"
                        type='text'
                        icon={<FolderOutlined className={selected ? 'text-white' : ''} />}
                    />
                )}
            </div>
            {index < currentList.length - 1 ? <SplitLine /> : null}
        </div>)
    }

    return (
        <SwitchTransition>
            <CSSTransition
                key={`-${props.value.join('-')}-`}
                nodeRef={nodeRef}
                classNames={animating}
                addEndListener={(done) => {
                    nodeRef.current?.addEventListener('transitionend', done, false)
                }}
            >
                <div ref={nodeRef} className="overflow-hidden">
                    <div className='menu-container'>
                        {props.value.length ? renderBackButton() : null}
                        {currentList.length <= 0
                            ? (
                                <div className={EMPTY_CLASSNAME}>暂无子笔记</div>
                            )
                            : currentList.map(renderMenuItem)
                        }
                    </div>
                </div>
            </CSSTransition>
        </SwitchTransition>
    )
}