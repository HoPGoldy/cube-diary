import React from 'react'
import { createRoot } from 'react-dom/client'
import { store } from './store'
import { Provider } from 'react-redux'
import { routes } from './Route'
import { QueryClientProvider } from 'react-query'
import { queryClient } from './services/base'
// import { ReactQueryDevtools } from 'react-query/devtools'
import { App as AntdApp } from 'antd'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/foundation.css'
import { useInitMessage } from './utils/message'
import { AntdConfigProvider } from './components/AntdConfigProvider'
import { ResponsiveProvider } from './layouts/Responsive'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rootContainer = document.getElementById('root')!

const App = () => {
    useInitMessage()
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={routes} />
            {/* <ReactQueryDevtools initialIsOpen={false} position="bottom-right" /> */}
        </QueryClientProvider>
    )
}

/**
 * React.StrictMode会导致 SortableJS 在移动端无法正常放下元素（可以拖动，不能放下）
 * 所以这里并没有使用 StrictMode
 * @see https://github.com/SortableJS/react-sortablejs/issues/241
 */
createRoot(rootContainer).render(
    <Provider store={store}>
        <ResponsiveProvider>
            <AntdConfigProvider>
                <AntdApp className='h-full'>
                    <App />
                </AntdApp>
            </AntdConfigProvider>
        </ResponsiveProvider>
    </Provider>
)
