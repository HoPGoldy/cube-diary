import { requestGet } from './base';
import { AppConfigResp } from '@/types/appConfig';
import { useQuery } from 'react-query';

export const useQueryAppConfig = () => {
  return useQuery(
    'appConfig',
    () => {
      return requestGet<AppConfigResp>('global');
    },
    {
      refetchOnWindowFocus: false,
    },
  );
};
