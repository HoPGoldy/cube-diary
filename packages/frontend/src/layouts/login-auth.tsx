import { FC, PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { stateUserJwtData } from "../store/user";
import { useAtomValue } from "jotai";

export const LoginAuth: FC<PropsWithChildren> = ({ children }) => {
  const userInfo = useAtomValue(stateUserJwtData);

  if (!userInfo) {
    return <Navigate to={`/login`} replace />;
  }

  return <>{children}</>;
};
