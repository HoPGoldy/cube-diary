import React, { FC } from 'react';
import { Viewer } from '@bytemd/react';
import { plugins } from '@/client/components/fileUploaderPlugin';
import s from './styles.module.css';

interface Props {
  value: string;
}

const Preview: FC<Props> = (props) => {
  return (
    <div className={`w-full ${s.mdArea}`}>
      <Viewer value={props.value} plugins={plugins} />
    </div>
  );
};

export default Preview;
