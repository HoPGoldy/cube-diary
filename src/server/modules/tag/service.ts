import { TagGroupStorage, TagStorage, TagUpdateReqData } from '@/types/tag'
import { DatabaseAccessor } from '@/server/lib/sqlite'

interface Props {
    db: DatabaseAccessor
}

export const createTagService = (props: Props) => {
    const { db } = props

    const addTag = async (newTag: Omit<TagStorage, 'id'>) => {
        const existTag = await db.tag()
            .select('id')
            .where({ title: newTag.title, createUserId: newTag.createUserId })
            .first()
        if (existTag) return { code: 400, msg: '标签已存在' }

        const [id] = await db.tag().insert(newTag)
        return { code: 200, msg: '添加成功', data: id }
    }

    const removeTag = async (id: number, userId: number) => {
        await db.tag().delete().where({ id, createUserId: userId })
        // 文章表里还存着被删除的标签的 id，需要把它清掉
        await db.article().update('tagIds', '').where('tagIds', `#${id}#`)
        await db.article()
            .update('tagIds', db.knex.raw('REPLACE(tagIds, ?, "#")', [`#${id}#`]))
            .whereLike('tagIds', `%#${id}#%`)
        return { code: 200 }
    }

    const updateTag = async (detail: TagUpdateReqData) => {
        const { id, ...rest } = detail
        await db.tag().update(rest).where('id', id)
        return { code: 200 }
    }

    const getTagList = async (userId: number) => {
        const data = await db.tag()
            .select('id', 'title', 'color', 'groupId')
            .where('createUserId', userId)
        return { code: 200, data }
    }

    const getGroupList = async (userId: number) => {
        const data = await db.tagGroup()
            .select('id', 'title')
            .where('createUserId', userId)
        return { code: 200, data }
    }

    const addGroup = async (data: Omit<TagGroupStorage, 'id'>) => {
        const existGroup = await db.tagGroup()
            .select('id')
            .where({ title: data.title, createUserId: data.createUserId })
            .first()
        if (existGroup) return { code: 400, msg: '分组已存在' }

        const [id] = await db.tagGroup().insert(data)
        return { code: 200, msg: '添加成功', data: id }
    }

    /**
     * 删除分组
     * mehtod 为 force 时，删除分组下的所有标签，否则会移动到未命名分组
     */
    const removeGroup = async (id: number, method: string, userId: number) => {
        await db.tagGroup().delete().where({ id, createUserId: userId })

        // 删掉下属标签
        if (method === 'force') {
            await db.tag()
                .delete()
                .where({ groupId: id, createUserId: userId })
        }
        // 把该分组下的标签移动到默认分组
        else {
            await db.tag()
                .update('groupId', '')
                .where({ groupId: id, createUserId: userId })
        }

        return { code: 200 }
    }

    const updateGroup = async (detail: TagGroupStorage) => {
        const { id, title, createUserId } = detail
        await db.tagGroup().update('title', title).where({ id, createUserId })

        return { code: 200 }
    }

    const batchSetColor = async (ids: number[], color: string, userId: number) => {
        await db.tag()
            .update('color', color)
            .whereIn('id', ids)
            .andWhere('createUserId', userId)
        return { code: 200 }
    }

    const batchSetGroup = async (ids: number[], groupId: number, userId: number) => {
        await db.tag()
            .update('groupId', groupId)
            .whereIn('id', ids)
            .andWhere('createUserId', userId)
        return { code: 200 }
    }

    const batchRemoveTag = async (ids: number[], userId: number) => {
        await db.tag()
            .delete()
            .whereIn('id', ids)
            .andWhere('createUserId', userId)
        return { code: 200 }
    }

    return {
        addTag, updateTag, removeTag, getTagList, getGroupList, addGroup, removeGroup, updateGroup,
        batchSetColor, batchSetGroup, batchRemoveTag
    }
}

export type TagService = ReturnType<typeof createTagService>