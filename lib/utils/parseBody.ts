import { IncomingHttpHeaders, IncomingMessage } from "http"
import { Form } from 'multiparty'

interface File {
    /**
     * same as name - the field name for this file
     */
    fieldName: string
    /**
     * the filename that the user reports for the file
     */
    originalFilename: string
    /**
     * the HTTP headers that were sent along with this file
     */
    headers: IncomingHttpHeaders
    /**
     * the absolute path of the uploaded file on disk
     */
    path: string
    /**
     * size of the file in bytes
     */
    size: number 
}

export const parseBody = async function <T = Record<string, string[]>>(req: IncomingMessage): Promise<[T, File[]]> {
    return new Promise((resolve, reject) => {
        const form = new Form()

        form.parse(req, (err, fields, files) => {
            if (err) return reject(err)
            resolve([fields, files])
        })
    })
}