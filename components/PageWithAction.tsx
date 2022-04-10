import Link from 'components/Link'
import { FC, MouseEventHandler } from 'react'
import { ActionBar, ActionBarButtonProps, Button, ButtonProps, Card, ConfigProvider } from 'react-vant'

interface Props {
    label: string | number
    value: string | number
}

export const PageContent: FC = (props) => {
    return (
        <div className="w-full overflow-y-scroll" style={{ height: 'calc(100vh - 72px)'}}>
            {props.children}
        </div>
    )
}

export const PageAction: FC = (props) => {
    return (
        <div className="p-2 flex flex-row" style={{ height: '72px'}}>
            {props.children}
        </div>
    )
}

interface ActionIconProps {
    href?: string
    onClick?: () => unknown
}

export const ActionIcon: FC<ActionIconProps> = (props) => {
    const el = (
        <Card className="m-2 p-2 flex items-center" round onClick={props.onClick}>
            {props.children}
        </Card>
    )

    if (!props.href) return el

    return (
        <Link href={props.href}>{el}</Link>
    )
}

type ActionButtonProps = { color?: string, onClick?: MouseEventHandler<HTMLDivElement> }

export const ActionButton: FC<ActionButtonProps> = (props) => {
    const styles = { background: props.color || 'f000' }

    return (
        <div
            className="m-2 p-2 flex items-center justify-center grow rounded-lg text-white"
            style={styles}
            onClick={props.onClick}
        >
            {props.children}
        </div>
    )
}