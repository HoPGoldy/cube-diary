import { FC } from 'react'
import Link, { LinkProps } from 'next/link'

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