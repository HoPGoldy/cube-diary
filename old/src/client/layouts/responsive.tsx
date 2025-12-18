import React, { FC, useEffect, PropsWithChildren } from 'react';
import debounce from 'lodash/debounce';
import { getIsMobile, stateIsMobile } from '../store/global';
import { useAtomValue, useSetAtom } from 'jotai';

export const ResponsiveProvider: FC<PropsWithChildren> = ({ children }) => {
  const setIsMobile = useSetAtom(stateIsMobile);

  useEffect(() => {
    const listener = debounce(() => {
      setIsMobile(getIsMobile());
    }, 300);

    window.addEventListener('resize', listener, true);
    return () => {
      window.removeEventListener('resize', listener, true);
    };
  }, []);

  return <>{children}</>;
};

export const useIsMobile = () => {
  return useAtomValue(stateIsMobile);
};

export const MobileArea: FC<PropsWithChildren> = ({ children }) => {
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  return <>{children}</>;
};

export const DesktopArea: FC<PropsWithChildren> = ({ children }) => {
  const isMobile = useIsMobile();
  if (isMobile) return null;
  return <>{children}</>;
};
