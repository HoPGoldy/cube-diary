import { TagGroupListItem, TagListItem } from '@/types/tag'
import { useEffect, useMemo, useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import groupBy from 'lodash/groupBy'
import { DEFAULT_TAG_GROUP } from '@/config'

/**
 * 获取包含 “默认分组” 选项的标签分组列表
 */
export const useAllTagGroup = (tagGroupList?: TagGroupListItem[]) => {
    // 当前显示的分组（会多一个默认分组，用来存放所有没有设置分组的标签）
    const [tagGroups, setTagGroups] = useState<TagGroupListItem[]>([])

    useEffect(() => {
        if (!tagGroupList) return
        const groups = cloneDeep(tagGroupList)
        groups.unshift({
            id: DEFAULT_TAG_GROUP,
            title: '默认分组'
        })
        setTagGroups(groups)
    }, [tagGroupList])

    return { tagGroups, setTagGroups }
}

/**
 * 获取分组后的标签列表
 */
export const useGroupedTag = (tagList?: TagListItem[]) => {
    // 分组后的标签列表
    const [groupedTagDict, setGroupedTagDict] = useState<Record<string | number, TagListItem[]>>({})

    useEffect(() => {
        if (!tagList) return
        const groupedTagList = groupBy(
            tagList,
            item => item.groupId ? item.groupId : DEFAULT_TAG_GROUP
        )
        setGroupedTagDict(groupedTagList)
    }, [tagList])

    return { groupedTagDict, setGroupedTagDict }
}

/**
 * 创建标签 id 到名称的映射，方便通过 id 获取标签信息
 */
export const useTagDict = (tagList?: TagListItem[]) => {
    return useMemo(() => {
        const data = tagList?.map((item) => [item.id, item] as [number, TagListItem]) || []
        return new Map<string | number, TagListItem>(data)
    }, [tagList])
}
