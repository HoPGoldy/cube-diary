import knex from 'knex'
import { UserStorage } from '@/types/user'
import { TABLE_NAME } from '@/config'
import { FileStorage } from '@/types/file'
import { UserInviteStorage } from '@/types/userInvite'
import { DiaryStorage } from '@/types/diary'

interface Props {
    dbPath: string
}

export const createDb = (props: Props) => {
    const sqliteDb = knex({
        client: 'sqlite3',
        connection: { filename: props.dbPath },
        useNullAsDefault: true
    })

    // 用户表
    sqliteDb.schema.hasTable(TABLE_NAME.USER).then(exists => {
        if (exists) return
        return sqliteDb.schema.createTable(TABLE_NAME.USER, t => {
            t.increments('id').primary()
            t.string('username').notNullable()
            t.string('passwordHash').notNullable()
            t.string('passwordSalt').notNullable()
            t.timestamp('initTime').notNullable()
            t.string('theme').notNullable()
            t.boolean('isAdmin').notNullable()
            t.boolean('isBanned')
        })
    })

    // 日记表
    sqliteDb.schema.hasTable(TABLE_NAME.DIARY).then(exists => {
        if (exists) return
        return sqliteDb.schema.createTable(TABLE_NAME.DIARY, t => {
            t.increments('id').primary()
            t.timestamp('date').notNullable()
            t.text('content').notNullable()
            t.integer('createUserId').notNullable()
            t.string('color')
        })
    })

    // 附件表
    sqliteDb.schema.hasTable(TABLE_NAME.FILE).then(exists => {
        if (exists) return
        return sqliteDb.schema.createTable(TABLE_NAME.FILE, t => {
            t.increments('id').primary()
            t.string('md5').notNullable()
            t.text('filename').notNullable()
            t.string('type').notNullable()
            t.integer('size').notNullable()
            t.integer('createUserId')
            t.timestamp('createTime').notNullable()
        })
    })

    // 用户邀请表
    sqliteDb.schema.hasTable(TABLE_NAME.USER_INVITE).then(exists => {
        if (exists) return
        return sqliteDb.schema.createTable(TABLE_NAME.USER_INVITE, t => {
            t.increments('id').primary()
            t.string('inviteCode').notNullable()
            t.string('username')
            t.timestamp('createTime').notNullable()
            t.timestamp('useTime')
        })
    })

    return {
        knex: sqliteDb,
        user: () => sqliteDb<UserStorage>(TABLE_NAME.USER),
        diary: () => sqliteDb<DiaryStorage>(TABLE_NAME.DIARY),
        file: () => sqliteDb<FileStorage>(TABLE_NAME.FILE),
        userInvite: () => sqliteDb<UserInviteStorage>(TABLE_NAME.USER_INVITE),
    }
}

export type DatabaseAccessor = ReturnType<typeof createDb>