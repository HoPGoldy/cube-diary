import { getAppConfig } from "lib/appConfig"
import { NextApiRequest, NextApiResponse } from "next"
import { FontendConfig, RespData } from "types/global"

export default async function handler (req: NextApiRequest, res: NextApiResponse<RespData<FontendConfig>>) {
    const config = await getAppConfig()

    if (!config) {
        res.status(302).json({ success: false })
        return
    }

    const { mainButtonColors, user, ...otherConfig } = config
    const randIndex = Math.floor(Math.random() * (mainButtonColors?.length))
    const buttonColor = mainButtonColors[randIndex]

    res.status(200).json({ success: true, data: { ...otherConfig, buttonColor } })
}
