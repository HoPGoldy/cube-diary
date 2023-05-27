import React, { ReactElement, useEffect, useRef } from 'react'
import Sortable from 'sortablejs'
import cloneDeep from 'lodash/cloneDeep'
import isNil from 'lodash/isNil'

interface DraggableProps<T> {
    value: T[]
    onChange: (value: T[]) => void
    renderItem: (item: T, index: number) => ReactElement | null
    extra?: ReactElement
    className?: string
}

export const Draggable: <T>(props: DraggableProps<T>) => ReactElement = (props) => {
    const { value, onChange, className, renderItem, extra } = props
    const sortableDomRef = useRef<HTMLDivElement | null>(null)
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange
    const valueRef = useRef(value)
    valueRef.current = value

    useEffect(() => {
        if (!sortableDomRef.current) return

        Sortable.create(sortableDomRef.current, {
            animation: 150,
            // filter: '.ignore-elements',
            onEnd: e => {
                const { oldIndex, newIndex } = e
                if (isNil(oldIndex) && isNil(newIndex)) {
                    console.error('拖动失败，新旧索引为空', e)
                    return
                }
                if (oldIndex === newIndex) return

                const newValue = cloneDeep(valueRef.current)
                const [removed] = newValue.splice(oldIndex || 0, 1)
                newValue.splice(newIndex || 0, 0, removed)

                onChangeRef.current(newValue)
            },
        })
    }, [])

    return (
        <div ref={sortableDomRef} className={className}>
            {value.map(renderItem)}
            {extra}
        </div>
    )
}