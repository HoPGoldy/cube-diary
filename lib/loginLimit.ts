import dayjs from "dayjs"
import { LoginLimit } from "types/user"
import { getAppConfig } from "./appConfig"
import { getLoki } from "./loki"

/**
 * 获取每日登录上线记录
 */
const getLoginLimitCollection = async function () {
    const loki = await getLoki('system')
    let collection = loki.getCollection<LoginLimit>('loginLimit')
    if (collection) return collection

    collection = loki.addCollection<LoginLimit>('loginLimit', {
        unique: ['date'],
        ttl: 60 * 60 * 24 * 1000,
        // 一个星期擦除一次
        ttlInterval: 60 * 60 * 24 * 7 * 1000
    })
    return collection
}

/**
 * 请求一次登录
 * 每天重置一次
 * 
 * 如果返回 false 代表已经到达每日最大登录次数
 */
export const requireLogin = async function (): Promise<boolean> {
    const { loginPreDay = 0 } = await getAppConfig() || {}
    const date = dayjs().startOf('day').valueOf()

    const collection = await getLoginLimitCollection()
    const todayLoginInfo = collection.findOne({ date })
    
    if (!todayLoginInfo) {
        collection.insert({ date, count: 1 })
        return true
    }

    todayLoginInfo.count += 1
    collection.update(todayLoginInfo)
    return todayLoginInfo.count <= loginPreDay
}