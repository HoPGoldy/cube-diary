import React, { useState, useRef, useMemo } from 'react';
import { ArrowDownOutlined } from '@ant-design/icons';
import s from './styles.module.css';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const ease = (distance: number) => Math.round(distance / 3);

interface UseDragPointProps {
  month?: string;
  triggerOffset?: number;
}

/**
 * 在列表页，滚动到顶和到底时会出现切换到其他月份的提示
 */
export const useDragPoint = (props?: UseDragPointProps) => {
  const { triggerOffset = 100, month } = props || {};
  const navigate = useNavigate();
  const topDomRef = useRef<HTMLDivElement>(null);
  const bottomDomRef = useRef<HTMLDivElement>(null);
  /** 是否可以触发刷新 */
  const [canTrigger, setCanTrigger] = useState(false);
  /** 触摸起始点 y 坐标 */
  const startY = useRef(0);
  /** 是否显示顶部提示 */
  const [showTopPoint, setShowTopPoint] = useState(false);
  /** 是否显示底部提示 */
  const [showBottomPoint, setShowBottomPoint] = useState(false);

  /** 是否显示下个月 */
  const showNext = useMemo(() => {
    if (!month) return false;
    return dayjs(month).add(1, 'month').isBefore(dayjs());
  }, [month]);

  const renderTopPoint = () => {
    return (
      <div
        className={s.topPoint}
        ref={topDomRef}
        style={{ display: showTopPoint ? 'block' : 'none ', left: 'calc(50vw - 85px)' }}>
        <Button
          type={canTrigger ? 'primary' : 'default'}
          shape='round'
          icon={
            <ArrowDownOutlined style={{ transform: canTrigger ? 'rotate(180deg)' : undefined }} />
          }>
          {canTrigger ? '松手查看上月日记' : '下拉查看上月日记'}
        </Button>
      </div>
    );
  };

  const renderBottomPoint = () => {
    const getBtn = () => {
      if (!showNext) {
        return (
          <Button style={{ left: 'calc(50vw - 176px)' }} shape='round'>
            已经到底了
          </Button>
        );
      }

      return (
        <Button
          type={canTrigger ? 'primary' : 'default'}
          shape='round'
          icon={
            <ArrowDownOutlined style={{ transform: canTrigger ? undefined : 'rotate(180deg)' }} />
          }>
          {canTrigger ? '松手查看下月日记' : '上划查看下月日记'}
        </Button>
      );
    };

    return (
      <div
        className={s.bottomPoint}
        ref={bottomDomRef}
        style={{ display: showBottomPoint ? 'block' : 'none ', left: 'calc(50vw - 85px)' }}>
        {getBtn()}
      </div>
    );
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    startY.current = e.touches[0].clientY;
    if (topDomRef.current) {
      topDomRef.current.style.transition = 'none';
    }
    if (bottomDomRef.current) {
      bottomDomRef.current.style.transition = 'none';
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const listDom = document.querySelector('.cube-diary-page-content');
    if (!listDom) return;
    const isBottom = Math.abs(listDom.scrollHeight - listDom.clientHeight - listDom.scrollTop) < 1;
    setShowBottomPoint(isBottom);
    const isTop = listDom.scrollTop === 0;
    setShowTopPoint(isTop);

    const offset = ease(e.touches[0].clientY - startY.current);
    if (topDomRef.current) {
      topDomRef.current.style.transform = `translateY(${offset}px)`;
    }
    if (bottomDomRef.current) {
      bottomDomRef.current.style.transform = `translateY(${offset}px)`;
    }
    setCanTrigger(Math.abs(offset) > triggerOffset);
  };

  const onPrev = () => {
    if (!month) return;
    const prevMonth = dayjs(month).subtract(1, 'month').format('YYYYMM');
    navigate(`/month/${prevMonth}`);
  };

  const onNext = () => {
    if (!month) return;
    const nextMonth = dayjs(month).add(1, 'month').format('YYYYMM');
    navigate(`/month/${nextMonth}`);
  };

  const onTouchEnd = () => {
    if (canTrigger) {
      if (showTopPoint) {
        onPrev();
      } else if (showBottomPoint && showNext) {
        onNext();
      }
    }

    setCanTrigger(false);

    if (topDomRef.current) {
      topDomRef.current.style.transform = 'translateY(0px)';
      topDomRef.current.style.transition = 'all .3s ease';
    }
    if (bottomDomRef.current) {
      bottomDomRef.current.style.transform = 'translateY(0px)';
      bottomDomRef.current.style.transition = 'all .3s ease';
    }

    setTimeout(() => {
      setShowBottomPoint(false);
      setShowTopPoint(false);
    }, 300);
  };

  const listListener = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };

  return {
    renderTopPoint,
    renderBottomPoint,
    listListener,
  };
};
