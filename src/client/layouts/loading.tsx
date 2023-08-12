import React, { FC, useState, useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';

interface Props {
  tip?: string;
  delay?: number;
  className?: string;
}

const Loading: FC<Props> = ({ tip = '内容加载中...', delay = 500, className }) => {
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTip(true), delay);
    return () => clearTimeout(timer);
  }, []);

  return showTip ? (
    <div
      className={'w-full flex justify-center items-center dark:text-gray-400 mt-24 ' + className}>
      <LoadingOutlined /> <div className='ml-2'>{tip}</div>
    </div>
  ) : null;
};

export default Loading;
