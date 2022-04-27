import type { NextApiRequest, NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { BackupDetail } from 'types/storage'
import { createBackup, getBackupInfo, hasBackupFile, rollback } from 'lib/backup'
import { getBackupCollection, saveLoki } from 'lib/loki'

/**
 * 备份返回结果
 */
export interface BackupResData {
    entries: Array<BackupDetail>
}

export default createHandler({
    GET: async (req: NextApiRequest, res: NextApiResponse<RespData<BackupResData>>, auth) => {
        const backupList = await getBackupInfo(auth.username)

        res.status(200).json({
            success: true,
            data: { entries: backupList || [] }
        })
    },
    POST: async (req: NextApiRequest, res: NextApiResponse<RespData<BackupResData>>, auth) => {
        const reqBody = JSON.parse(req.body)
        if (!('rollbackDate' in reqBody)) {
            res.status(200).json({ success: false, message: '请填写回滚目标 rollbackDate' })
            return
        }

        // 确保有对应的备份文件
        if (!await hasBackupFile(auth.username, reqBody.rollbackDate)) {
            res.status(200).json({ success: false, message: '没有找到对应的备份文件' })
            // 清除对应的记录
            const collectioon = await getBackupCollection(auth.username)
            collectioon.findAndRemove({ date: reqBody.rollbackDate })
            saveLoki('backup')
            return
        }

        await createBackup(auth.username, '回滚备份')
        const rollbackSuccess = await rollback(auth.username, reqBody.rollbackDate)

        res.status(200).json({ success: rollbackSuccess })
    },
})
