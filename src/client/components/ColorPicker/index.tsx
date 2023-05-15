import { List, Modal } from 'antd'
import React, { FC } from 'react'
import s from './styles.module.css'

interface Props {
  value?: string
  onChange?: (value: string) => void
  visible: boolean
  onClose: () => void
}

const MARK_COLORS: string[] = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
]

export const ColorPicker: FC<Props> = (props) => {
    const { value, onChange, visible, onClose } = props

    const renderMarkColor = (color: string) => {
        const classes = [s.colorBtn, 'm-auto']
        if (value === color) classes.push(s.selectedColor)
        if (color === '') classes.push(s.removeBtn)

        return (
            <List.Item key={color}>
                <div
                    className={classes.join(' ')}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                        onChange?.(color || '#000')
                        onClose()
                    }}
                />
            </List.Item>
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
                dataSource={[...MARK_COLORS, '']}
                renderItem={renderMarkColor}
            />
        </Modal>
    )
}