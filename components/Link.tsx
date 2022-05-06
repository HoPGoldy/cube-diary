import { FC } from 'react'
import Link, { LinkProps } from 'next/link'

/**
 * 自定义 link 组件
 * 由于 react vant 直接嵌在 next link 里会报 forward ref error，所以有了本组件
 */
const MyLink: FC<LinkProps> = (props) => {
    const { children, ...linkArgs } = props
    return (
        <Link {...linkArgs} passHref>
            <div>
                {children}
            </div>
        </Link>
    )
}

export default MyLink