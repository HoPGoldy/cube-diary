import lokijs from 'lokijs'
import { ensureDir } from 'fs-extra'

let lokiInstance: lokijs

export const getLoki = async function (): Promise<lokijs> {
    if (lokiInstance) return lokiInstance

    await ensureDir('./.storage')

    return new Promise(resolve => {
        lokiInstance = new lokijs('./.storage/db.json', {
            autoload: true,
            autoloadCallback: () => resolve(lokiInstance)
        })
    })
}

export const getUserCollection = async function (username: string) {
    const loki = await getLoki()
    let collection = loki.getCollection(username)
    if (collection) return collection

    collection = loki.addCollection(username, { unique: ['date'] })
    return collection
}

export const getConfigCollection = async function () {
    const loki = await getLoki()
    let collection = loki.getCollection('config')
    if (collection) return collection

    collection = loki.addCollection('config', { unique: ['username'] })
    return collection
}