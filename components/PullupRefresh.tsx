import React, { TouchEventHandler, useCallback, useMemo, useRef } from 'react';
import { PullRefreshProps, PullRefreshStatus } from 'react-vant/es/pull-refresh/PropsType';
import { preventDefault, inBrowser } from 'react-vant/es/utils';
import { Loading, hooks } from 'react-vant';

/**
 * ##### 注意，本文件来自于 react-vant 的 PullRefresh #####
 * 由于 react-vant 只提供了下拉刷新 pullRefresh，所以这里改造一下，做一个上拉刷新组件
 */

const { useTouch, useEventListener, useSetState, useUpdateEffect } = hooks

function isElement(node: Element) {
    const ELEMENT_NODE_TYPE = 1;
    return node.tagName !== 'HTML' && node.tagName !== 'BODY' && node.nodeType === ELEMENT_NODE_TYPE;
}

type ScrollElement = Element | HTMLElement | Window;
const overflowScrollReg = /scroll|auto/i;
const defaultRoot = inBrowser ? window : undefined;

export function getScrollBottom(el: ScrollElement): number {
    const top = 'scrollTop' in el ? el.scrollTop : el.pageYOffset;

    // iOS scroll bounce cause minus scrollTop
    return Math.max(top, 0);
}

const isReachBottom = function (el: Element): boolean {
    const { scrollTop, clientHeight, scrollHeight } = el

    // 最后 -10 是因为，在某些手机浏览器上滚动到底部后 scrollTop + clientHeight 实际上比 scrollHeight 要小零点几，导致无法往上拖拽出来
    return scrollTop + clientHeight >= scrollHeight - 10
}

export function getScrollParent(el: Element, root: ScrollElement | undefined = defaultRoot): ScrollElement {
    if (root === undefined) {
        root = window;
    }
    let node = el;
    while (node && node !== root && isElement(node)) {
        const { overflowY } = window.getComputedStyle(node);
        if (overflowScrollReg.test(overflowY)) {
            if (node.tagName !== 'BODY') {
                return node;
            }

            const htmlOverflowY = window.getComputedStyle(node.parentNode as Element).overflowY;
            if (overflowScrollReg.test(htmlOverflowY)) {
                return node;
            }
        }
        node = node.parentNode as Element;
    }
    return root;
}


const DEFAULT_HEAD_HEIGHT = 50;
const TEXT_STATUS = ['pulling', 'loosing', 'success'];

export const PullupRefresh: React.FC<PullRefreshProps> = (props) => {
    const { disabled, animationDuration } = props;

    const root = useRef<HTMLDivElement>(null);
    const [state, updateState] = useSetState({
        refreshing: false,
        status: 'normal' as PullRefreshStatus,
        distance: 0,
        duration: 0,
    });

    const track = useRef<HTMLDivElement>(null);
    const reachBottom = useRef<boolean>(false);

    const touch = useTouch();

    const getHeadStyle = () => {
        if (props.headHeight !== DEFAULT_HEAD_HEIGHT) {
            return {
                height: `${props.headHeight}px`,
            };
        }
        return {};
    };

    const isTouchable = useCallback(() => {
        return state.status !== 'loading' && state.status !== 'success' && !disabled;
    }, [state.status, disabled]);

    const ease = (distance: number) => {
        const pullDistance = -(props.pullDistance || props.headHeight || 0);

        if (distance <= pullDistance) {
            if (distance >= pullDistance * 2) {
                distance = pullDistance + (distance - pullDistance) / 2;
            } else {
                distance = pullDistance * 1.5 + (distance - pullDistance * 2) / 4;
            }
        }

        return Math.round(distance);
    };

    const setStatus = (distance: number, isLoading?: boolean) => {
        const pullDistance = -(props.pullDistance || props.headHeight || 0);
        const newState = { distance } as typeof state;

        if (isLoading) {
            newState.status = 'loading';
        } else if (distance === 0) {
            newState.status = 'normal';
        } else if (distance >= pullDistance) {
            newState.status = 'pulling';
        } else {
            newState.status = 'loosing';
        }
        updateState(newState);
    };

    const getStatusText = () => {
        if (state.status === 'normal') {
            return '';
        }
        return props[`${state.status}Text`];
    };

    const renderStatus = () => {
        const { status, distance } = state;

        const nodes: JSX.Element[] = [];

        if (TEXT_STATUS.includes(status)) {
            nodes.push(
                <div key="text" className="rv-pull-refresh__text">
                    {getStatusText()}
                </div>,
            );
        }
        if (status === 'loading') {
            nodes.push(
                <Loading key="loading" className="rv-pull-refresh__loading">
                    {getStatusText()}
                </Loading>,
            );
        }

        return nodes;
    };

    const showSuccessTip = () => {
        updateState({ status: 'success' });
        setTimeout(() => {
            setStatus(0);
        }, +(props.successDuration || 0));
    };

    const onRefresh = async () => {
        try {
            updateState({ refreshing: true });
            await props.onRefresh();
            updateState({ refreshing: false });
        } catch (error) {
            updateState({ refreshing: false });
        }
    };

    const checkPosition = (event: TouchEvent) => {
        const scrollTarget = getScrollParent(event.target as HTMLElement);
        reachBottom.current = isReachBottom(scrollTarget as Element);

        if (reachBottom.current) {
            updateState({ duration: 0 });
            touch.start(event);
        }
    };

    const onTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
        if (isTouchable()) {
            checkPosition(event.nativeEvent);
        }
    };

    const onTouchMove = useCallback(
        (event: TouchEvent) => {
            if (isTouchable()) {
                if (!reachBottom.current) {
                    checkPosition(event);
                }

                touch.move(event);
                if (reachBottom.current && touch.deltaY < 0 && touch.isVertical()) {
                    setStatus(ease(touch.deltaY));
                    preventDefault(event);
                } else {
                    /**
                     * IN THIS CASE:
                     * if component don't rerender after event.preventDefault
                     * ios will hold `preventDefault` behavior when touchmoving
                     * it will cause window unscrollable
                     */
                    setStatus(0);
                }
            }
        },
        [reachBottom.current, touch.deltaY, isTouchable],
    );

    const onTouchEnd = async () => {
        if (reachBottom.current && touch.deltaY && isTouchable()) {
            updateState({ duration: +(animationDuration || 0) });
            if (state.status === 'loosing') {
                setStatus(+(props.headHeight || 0), true);
                onRefresh();
            } else {
                setStatus(0);
            }
        }
    };

    useEventListener('touchmove', onTouchMove as EventListener, {
        target: track.current,
        depends: [reachBottom.current, isTouchable(), touch.deltaY],
    });

    useUpdateEffect(() => {
        updateState({ duration: +(animationDuration || 0) });
        if (state.refreshing) {
            setStatus(+(props.headHeight || 0), true);
        } else if (props.successText) {
            showSuccessTip();
        } else {
            setStatus(0, false);
        }
    }, [state.refreshing]);

    const trackStyle = useMemo(
        () => ({
            transitionDuration: `${state.duration}ms`,
            transform: state.distance ? `translate3d(0,${state.distance}px, 0)` : '',
        }),
        [state.duration, state.distance],
    );

    return (
        <div ref={root} className="rv-pull-refresh min-h-full" style={props.style}>
            <div
                ref={track}
                className="rv-pull-refresh__track"
                style={trackStyle}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
            >
                {props.children}
                <div className="rv-pull-refresh__head mt-6" style={{ ...getHeadStyle(), transform: 'none' }}>
                    {renderStatus()}
                </div>
            </div>
        </div>
    );
};

PullupRefresh.defaultProps = {
    headHeight: 50,
    animationDuration: 300,
    successDuration: 500,
};
