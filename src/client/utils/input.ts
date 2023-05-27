import { KeyboardEvent } from 'react'

export const blurOnEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    (e.target as HTMLInputElement).blur()
}