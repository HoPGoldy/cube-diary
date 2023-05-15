import React, { FC, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContent, PageAction, ActionButton } from '../../layouts/PageWithAction'
import Loading from '../../layouts/Loading'
import { Col, Row, Button, Card, Tree, TreeProps, Alert, Spin, Modal } from 'antd'
import { DragOutlined, EditOutlined, SwapOutlined, DeleteOutlined } from '@ant-design/icons'
import { MobileArea } from '@/client/layouts/Responsive'
import { useAppSelector } from '@/client/store'
import { useQueryArticleTree, useUpdateArticle } from '@/client/services/article'
import { DataNode } from 'antd/es/tree'
import { ArticleTreeNode } from '@/types/article'
import { useDelete } from '../article/Delete'
import { messageSuccess, messageWarning } from '@/client/utils/message'
import { STATUS_CODE } from '@/config'
import { PageTitle } from '@/client/components/PageTitle'

const EDIT_MODE = {
    /**
     * 默认状态
     * 点击树节点将打开笔记管理弹窗
     **/
    DETAIL: 1,
    /**
     * 批量操作
     * 该状态下，将支持多选树节点，并弹出批量操作菜单
     */
    BATCH: 2,
    /**
     * 选择移动目标
     * 该状态下，将会把选中的树节点作为要移动到的目标
     */
    SELECT_MOVE_TARGET: 3,
} as const

type EditMode = typeof EDIT_MODE[keyof typeof EDIT_MODE]

/**
 * 寻找节点在树中的路径
 */
const findPath = (tree: ArticleTreeNode[], nodeId: number): number[] => {
    for (const node of tree) {
        if (node.value === nodeId) return [node.value]

        if (node.children) {
            const path = findPath(node.children, nodeId)
            if (path.length) {
                return [node.value, ...path]
            }
        }
    }

    return []
}

/**
 * 标签管理
 * 可以新增标签分组，设置标签颜色，移动标签到指定分组
 */
const ArticleManager: FC = () => {
    const navigate = useNavigate()
    const currentRootArticleId = useAppSelector(s => s.user.userInfo?.rootArticleId)
    // 获取左下角菜单树
    const { data: articleTree, isLoading: isLoadingTree } = useQueryArticleTree(currentRootArticleId)
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([])
    /** 当前页面编辑模式 */
    const [editMode, setEditMode] = useState<EditMode>(EDIT_MODE.DETAIL)
    /** 是否显示操作弹窗 */
    const [showOperation, setShowOperation] = useState(false)
    /** 当前要操作（移动）的节点详情 */
    const [currentNode, setCurrentNode] = useState<ArticleTreeNode>()
    /** 删除功能 */
    const deleteArticle = useDelete()
    /** 保存详情 */
    const { mutateAsync: updateArticle, isLoading: updatingArticle } = useUpdateArticle()

    const treeData = useMemo(() => {
        if (!articleTree?.data) return []
        return [articleTree.data]
    }, [articleTree, currentNode])

    const onCheck: TreeProps['onCheck'] = (checkedKeysValue) => {
        setCheckedKeys(checkedKeysValue as React.Key[])
    }

    /** 选中了移动目标 */
    const onMoveTargetSelected = async (target: ArticleTreeNode) => {
        if (!currentNode) {
            messageSuccess('没有选中要移动的节点')
            setEditMode(EDIT_MODE.DETAIL)
            return
        }

        // 先判断不能是自己的子节点，不然循环引用，这些文章就从树上消失了
        const path = findPath(treeData, target.value)
        if (path.includes(currentNode.value)) {
            messageWarning('不能移动到自己或者自己的子笔记上')
            return
        }

        const resp = await updateArticle({
            id: currentNode.value,
            parentArticleId: target.value,
        })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        setEditMode(EDIT_MODE.DETAIL)
        messageSuccess('移动成功')
    }

    /** 回调 - 点击树节点 */
    const onClickTreeNode: TreeProps['onClick'] = (e, node) => {
        const item = node as unknown as ArticleTreeNode
        if (editMode === EDIT_MODE.DETAIL) {
            setCurrentNode(item)
            setShowOperation(true)
        }

        if (editMode === EDIT_MODE.SELECT_MOVE_TARGET) {
            onMoveTargetSelected(item)
        }
    }

    /** 渲染顶部标题 */
    const renderTitleAlert = () => {
        if (editMode === EDIT_MODE.SELECT_MOVE_TARGET) return (
            <Alert
                message="请选择要移动到哪个笔记"
                type="info"
                className="mb-4 md:mr-4"
                showIcon
                icon={<DragOutlined />}
                action={
                    <Button size="small" type="text" onClick={() => {
                        setEditMode(EDIT_MODE.DETAIL)
                        setCurrentNode(undefined)
                    }}>
                        取消
                    </Button>
                }
            />
        )

        return null
    }

    /** 渲染操作弹窗 */
    const renderModalDetail = (item?: ArticleTreeNode) => {
        if (!item) return null

        return (
            <Row gutter={[8, 8]}>
                <Col span={8}>
                    <Button
                        block
                        onClick={() => navigate(`/article/${item?.value}`)}
                        icon={<EditOutlined />}
                    >详情</Button>
                </Col>
                <Col span={8}>
                    <Button
                        block
                        onClick={() => {
                            setEditMode(EDIT_MODE.SELECT_MOVE_TARGET)
                            setShowOperation(false)
                        }}
                        icon={<SwapOutlined />}
                    >移动</Button>
                </Col>
                <Col span={8}>
                    <Button
                        block
                        danger
                        onClick={() => deleteArticle.showDeleteDialog({ id: item.value, title: item.title })}
                        icon={<DeleteOutlined />}
                    >删除</Button>
                </Col>
            </Row>
        )
    }

    /** 渲染操作弹窗 */
    const renderOperationModal = () => {
        return (
            <Modal
                open={showOperation}
                onCancel={() => {
                    setCurrentNode(undefined)
                    setShowOperation(false)
                }}
                footer={null}
                closable={false}
                title={currentNode?.title || ''}
                width={400}
            >
                {renderModalDetail(currentNode)}
            </Modal>
        )
    }

    /** 渲染正文页面 */
    const renderContent = () => {
        if (isLoadingTree) return <Loading />

        return (<>
            <div className="md:p-2 pt-2 w-full overflow-x-auto">
                {renderTitleAlert()}
                <Tree
                    checkable={editMode === EDIT_MODE.BATCH}
                    // 只展开第一级菜单
                    defaultExpandedKeys={treeData.map(item => item.value)}
                    onCheck={onCheck}
                    onClick={onClickTreeNode}
                    showLine
                    blockNode
                    checkedKeys={checkedKeys}
                    fieldNames={{ title: 'title', key: 'value' }}
                    treeData={treeData as unknown as DataNode[]}
                />
            </div>
        </>)
    }

    return (<>
        <PageTitle title="笔记管理" />
        <PageContent>
            <div className="box-border p-2 flex flex-col flex-nowrap h-full">
                <div className="flex-grow overflow-y-auto overflow-x-hidden">
                    <MobileArea>
                        <Card size="small" className='text-center text-base font-bold mb-2'>
                            笔记管理
                        </Card>
                    </MobileArea>
                    <Spin spinning={updatingArticle}>
                        {renderContent()}
                    </Spin>
                    {deleteArticle.renderDeleteModal()}
                    {renderOperationModal()}
                </div>
            </div>
        </PageContent>
        <PageAction>
            <ActionButton onClick={() => navigate(-1)}>返回</ActionButton>
        </PageAction>
    </>)
}

export default ArticleManager