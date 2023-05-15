import { ArticleTreeNode } from '@/types/article'
import React, { FC, useState, useMemo, useRef, PropsWithChildren, createRef } from 'react'
import debounce from 'lodash/debounce'
import { RightOutlined } from '@ant-design/icons'
import { nanoid } from 'nanoid'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import s from './styles.module.css'

interface Props {
    treeData: ArticleTreeNode[]
    onClickNode?: (node: ArticleTreeNode) => void
    onClickRoot?: () => void
    value?: number[]
    onChange?: (value: number[]) => void
}

interface MenuList {
    key: number
    /** div 的样式 */
    styles?: React.CSSProperties
    /** div 里显示的选项列表 */
    subMenus?: ArticleTreeNode[]
    /** 用于处理 findDOMNode is deprecated in StrictMode 问题 */
    nodeRef: React.RefObject<HTMLDivElement>
}

const MENU_WIDTH = 230
const MENU_HEIGHT = 35

/**
 * 计算下一个菜单的位置
 *
 * @param prevRect 上一个元素的位置
 * @param menuItemNumber 下一个菜单项的数量
 * @param offset 距离上一个列表距离多远，为零就贴在一起了
 */
const getNewMenuPos = (prevRect: DOMRect, menuItemNumber: number, offset = 10) => {
    const screenHeight = window.innerHeight
    const screenWidth = window.innerWidth

    const menuTotalHeight = menuItemNumber * MENU_HEIGHT
    /**
     * 如果以前的元素所处的高度到页面底部，不足以容纳下一个表单项的话
     * 就会往上提高 top，但是最高不能为负，否则就超出屏幕上边缘了
     */
    const top = screenHeight > (prevRect.top + menuTotalHeight) ? prevRect.top : Math.max(screenHeight - menuTotalHeight - 10, 0)
    /**
     * 看看屏幕右边还够不够容纳一个菜单的宽度了
     * 如果够就往右展开，否则就往左展开
     */
    const left = screenWidth > (prevRect.right + MENU_WIDTH) ? prevRect.right + offset : (prevRect.left - MENU_WIDTH - offset)

    return {
        left,
        top,
    }
}

/**
 * 桌面端左下方的快捷访问嵌套菜单
 */
export const TreeMenu: FC<PropsWithChildren<Props>> = (props) => {
    /** 唯一的 dom id，用于支持多个 TreeMenu 组件 */
    const entryId = useRef(nanoid())
    /** 弹出的菜单项，一个数组，元素是弹出的菜单项 */
    const [menuLists, setMenuLists] = useState<MenuList[]>([])
    /** 关闭全部菜单的防抖 */
    const closeAllThrottle = useMemo(() => debounce(() => setMenuLists([]), 200), [])

    /**
     * 打开新的菜单
     *
     * @param elementId 上一个悬停的元素 id，新的列表会基于这个位置打开
     * @param menuData 要打开的列表内容
     * @param level 打开的层级，如果不设置，会追加到最后
     * @param offset 距离上一个列表距离多远，为零就贴在一起了
     */
    const openMenu = (elementId: string, menuData: ArticleTreeNode[], level?: number, offset?: number) => {
        const el = document.getElementById(elementId)
        if (!el) {
            console.error('找不到侧边栏元素', elementId)
            return
        }
        const prevRect = el.getBoundingClientRect()

        const newMenu: MenuList = {
            key: Date.now(),
            subMenus: menuData,
            nodeRef: createRef(),
            styles: {
                ...getNewMenuPos(prevRect, menuData.length, offset),
            }
        }

        // 没有设置层级，直接追加
        if (level === undefined) {
            setMenuLists([...menuLists, newMenu])
            return
        }

        // 设置了层级，插入到指定层级
        const prevMenus = menuLists.slice(0, level + 1)
        setMenuLists([...prevMenus, newMenu])
    }

    /** 打开第一个菜单时调用 */
    const onOpenFirstMenu = () => {
        closeAllThrottle.cancel()
        openMenu(entryId.current, props.treeData, 0, 20)
    }

    /** 打开后续菜单时调用 */
    const onOpenInnerMenu = (id: string, level: number, nextMenuList?: ArticleTreeNode[]) => {
        closeAllThrottle.cancel()
        if (!nextMenuList) {
            setMenuLists(menuLists.slice(0, level + 1))
            return
        }
        openMenu(id, nextMenuList, level)
    }

    /**
     * 离开列表的回调
     * 会触发节流防止立马关闭
     */
    const mouseLeave = () => {
        closeAllThrottle()
    }

    const onClickNode = (node: ArticleTreeNode) => {
        props.onClickNode?.(node)

        if (props.value?.includes(node.value)) {
            props.onChange?.(props.value?.filter(v => v !== node.value))
        }
        else props.onChange?.([...(props?.value || []), node.value])
    }

    /**
     * 渲染列表项
     *
     * @param item 要渲染的列表项
     * @param level 当前列表所在的层级（第几个打开的列表）
     */
    const renderMenuItem = (item: ArticleTreeNode, level: number) => {
        return (
            <div
                key={item.value}
                style={{ height: MENU_HEIGHT, width: MENU_WIDTH }}
                className="overflow-hidden"
            >
                <div
                    /** 展开和收起菜单时会靠这个 id 查找对应的 div */
                    id={item.value.toString()}
                    className={
                        s.menuItem + ' ' +
                        (props.value?.includes(item.value) ? s.itemSelected : s.itemUnselected)
                    }
                    onClick={() => onClickNode(item)}
                    onMouseEnter={() => onOpenInnerMenu(item.value.toString(), level, item.children)}
                    
                >
                    <div className='truncate'>{item.title}</div>
                    <div className="flex flex-nowrap flex-row items-center">
                        {item.color && (
                            <div
                                className="flex-shrink-0 w-3 h-3 bg-gray-300 rounded mr-2"
                                style={{ backgroundColor: item.color }}
                            />
                        )}
                        {item.children && <RightOutlined />}
                    </div>
                </div>
            </div>
        )
    }

    /**
     * 渲染列表
     */
    const renderMenuLists = (item: MenuList, index: number) => {
        return (
            <CSSTransition
                timeout={100}
                classNames="my-transition"
                key={item.key}
                nodeRef={item.nodeRef}
            >
                <div
                    className='bg-gray-200 dark:bg-neutral-800 absolute z-10 max-h-screen overflow-y-auto rounded'
                    style={item.styles}
                    onMouseLeave={mouseLeave}
                    ref={item.nodeRef}
                >
                    {item.subMenus?.map(item => renderMenuItem(item, index))}
                </div>
            </CSSTransition>
        )
    }

    return (<>
        <div
            id={entryId.current}
            onClick={props.onClickRoot}
            onMouseEnter={onOpenFirstMenu}
            onMouseLeave={mouseLeave}
        >
            {props.children}
        </div>
        <TransitionGroup>
            {menuLists.map(renderMenuLists)}
        </TransitionGroup>
    </>)
}
