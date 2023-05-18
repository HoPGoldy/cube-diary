import { List, Modal } from 'antd'
import React, { FC } from 'react'
import s from './styles.module.css'

/** 颜色枚举对应的具体颜色 */
export const MARK_COLORS_MAP: Record<string, string> = {
    'c1': '#ef4444',
    'c2': '#f97316',
    'c3': '#f59e0b',
    'c4': '#eab308',
    'c5': '#84cc16',
    'c6': '#22c55e',
    'c7': '#10b981',
    'c8': '#14b8a6',
    'c9': '#06b6d4',
    'c10': '#0ea5e9',
    'c11': '#3b82f6',
    'c12': '#6366f1',
    'c13': '#8b5cf6',
    'c14': '#a855f7',
    'c15': '#d946ef',
    'c16': '#ec4899'
}

const MARK_COLORS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13', 'c14', 'c15', 'c16']

const MARK_COLORS_WITH_EMPTY = [...MARK_COLORS, '']

interface ColorItemProps {
    colorCode: string
    selected: boolean
    onClick: (colorCode: string) => void
}

const ColorItem: FC<ColorItemProps> = (props) => {
    const { colorCode, selected, onClick } = props

    const classes = [s.colorBtn, 'm-auto']
    if (selected) classes.push(s.selectedColor)
    if (colorCode === '') classes.push(s.removeBtn)

    return (
        <List.Item key={colorCode}>
            <div
                className={classes.join(' ')}
                style={{ backgroundColor: MARK_COLORS_MAP[colorCode] }}
                onClick={() => onClick(colorCode)}
            />
        </List.Item>
    ) 
}

interface Props {
    value?: string
    onChange?: (value: string) => void
    visible: boolean
    onClose: () => void
}

export const ColorPicker: FC<Props> = (props) => {
    const { value, onChange, visible, onClose } = props

    const renderMarkColor = (colorCode: string) => {
        return (
            <ColorItem
                colorCode={colorCode}
                selected={value === colorCode}
                onClick={() => {
                    onChange?.(colorCode || '')
                    onClose()
                }}
            />
        )
    }

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            closable={false}
        >
            <List
                className='mt-6'
                grid={{
                    gutter: 16,
                    column: 6
                }}
                dataSource={MARK_COLORS_WITH_EMPTY}
                renderItem={renderMarkColor}
            />
        </Modal>
    )
}

interface ColorMutiplePickerProps {
    value?: string[]
    onChange?: (value: string[]) => void
}

export const ColorMutiplePicker: FC<ColorMutiplePickerProps> = (props) => {
    const { value = [], onChange } = props

    const onClickItem = (colorCode: string) => {
        if (value.includes(colorCode)) {
            onChange?.(value.filter((item) => item !== colorCode))
        } else {
            onChange?.([...value, colorCode])
        }
    }

    const renderMarkColor = (colorCode: string) => {
        return (
            <ColorItem
                colorCode={colorCode}
                selected={value.includes(colorCode)}
                onClick={onClickItem}
            />
        )
    }

    return (
        <List
            className='mt-6 md:mt-2'
            grid={{
                gutter: 16,
                xs: 6,
                sm: 6,
                md: 8,
                lg: 16,
                xl: 16,
                xxl: 16
            }}
            dataSource={MARK_COLORS}
            renderItem={renderMarkColor}
        />
    )
}