import { actionRun } from './cli/run'

actionRun({
    storage: process.cwd(),
    port: process.env.NODE_ENV === 'development' ? '3600' : '3700'
})