#!/usr/bin/env node
import { Command } from 'commander'
import { actionRun } from './run'
import { getPackageVersion } from '@/server/utils'

const program = new Command()
program.version(getPackageVersion())

program
    .command('run')
    .description('启动服务')
    .option('-s, --storage <storagePath>', '数据保存目录', process.cwd())
    .option('-p, --port <servePort>', '服务启动端口', process.env.NODE_ENV === 'development' ? '3600' : '3700')
    .action(actionRun)

program.parse(process.argv)