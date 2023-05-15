import { DEFAULT_CONFIG_PATH } from '@/server/constants'
import { runApp } from '@/server/app'
import { copyFileSync, ensureDirSync } from 'fs-extra'
import { existsSync } from 'fs'
import path from 'path'

interface RunOptions {
    storage: string
    port: string
}

export const actionRun = (opts: RunOptions) => {
    ensureDirSync(opts.storage)
    const configPath = path.join(opts.storage, 'config.json')

    // 如果存储文件夹下没有 config.json 文件，则复制默认配置文件
    if (existsSync(configPath) === false) {
        console.log(`创建配置文件至: ${configPath}`)
        copyFileSync(DEFAULT_CONFIG_PATH, configPath)
    }

    runApp({
        storagePath: opts.storage,
        configPath,
        servePort: +opts.port,
        fontentPath: path.join(__dirname, '../client'),
    })
}