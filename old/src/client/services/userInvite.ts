import { queryClient, requestGet, requestPost } from './base';
import { useQuery, useMutation } from 'react-query';
import { BanUserReqData, UserInviteFrontendDetail } from '@/types/userInvite';

/** 新增邀请 */
export const useAddInvite = () => {
  return useMutation(
    () => {
      return requestPost<UserInviteFrontendDetail>('userInvite/addInvite');
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inviteList');
      },
    },
  );
};

/** 删除邀请 */
export const useDeleteInvite = () => {
  return useMutation(
    (id: number) => {
      return requestPost(`userInvite/delete/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inviteList');
      },
    },
  );
};

/** 查询邀请列表 */
export const useQueryInviteList = () => {
  return useQuery('inviteList', () => {
    return requestGet<UserInviteFrontendDetail[]>('userInvite/getInviteList');
  });
};

/** 封禁 / 解封用户 */
export const useBanUser = () => {
  return useMutation(
    (data: BanUserReqData) => {
      return requestPost('userInvite/banUser', data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inviteList');
      },
    },
  );
};
