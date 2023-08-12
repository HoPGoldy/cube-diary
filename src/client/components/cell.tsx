import { Col, Row } from 'antd';
import React, { FC } from 'react';

export interface CellProps {
  title: string | React.ReactNode;
  extra?: string | React.ReactNode;
  onClick?: () => void;
}

export const Cell: FC<CellProps> = (props) => {
  return (
    <Row
      justify='space-between'
      className='text-black dark:text-neutral-200'
      onClick={props.onClick}>
      <Col className='text-base'>{props.title}</Col>
      <Col className='text-base'>{props.extra}</Col>
    </Row>
  );
};

export const SplitLine: FC = () => {
  return (
    <div
      className='my-2 w-full bg-gray-200 dark:bg-neutral-500'
      style={{ height: 5, transform: 'scale(1, 0.2)' }}></div>
  );
};
