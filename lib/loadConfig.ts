import { readFile } from 'fs/promises'

export const getDiaryConfig = async function () {
    try {
        const result = await readFile('./config.json')
        console.log('result', result)
        return result
    }
    catch (e) {
        console.error('e', e)
        return undefined
    }
}