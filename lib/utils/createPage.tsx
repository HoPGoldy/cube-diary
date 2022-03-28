import { NextComponentType, NextPage, NextPageContext } from "next"

export const createPage = function <P, IP = {}>(Content: NextComponentType<NextPageContext, IP, P>): NextPage<P> {
    return function Page(props) {
        return (
            <Content {...props} />
        )
    }
}