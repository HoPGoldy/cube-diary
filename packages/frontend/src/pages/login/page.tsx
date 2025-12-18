import { shaWithSalt } from "@/utils/crypto";
import { Button, Input, InputRef } from "antd";
import { useRef, useState } from "react";
import { useLogin } from "../../services/auth";
import { login } from "../../store/user";
import { messageError } from "@/utils/message";
import { KeyOutlined } from "@ant-design/icons";
import { useLoginSuccess } from "./use-login-success";
import { THEME_BUTTON_COLOR } from "@/config";
import { usePageTitle } from "@/store/global";

export const LoginPage = () => {
  usePageTitle("登录");
  /** 密码 */
  const [password, setPassword] = useState("");
  /** 密码输入框 */
  const passwordInputRef = useRef<InputRef>(null);
  /** 提交登录 */
  const { mutateAsync: postLogin, isPending: isLogin } = useLogin();

  const { runLoginSuccess } = useLoginSuccess();

  // 账号密码登录
  const onPasswordSubmit = async () => {
    if (!password) {
      messageError("请输入密码");
      passwordInputRef.current?.focus();
      return;
    }

    const resp = await postLogin({
      password: shaWithSalt(password, "admin"),
    });
    if (resp?.code !== 200) return;

    login(resp.data);
    runLoginSuccess();
  };

  // 处理回车键
  const onPasswordInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onPasswordSubmit();
  };

  const appTitle = "Cube Note";
  const appSubTitle = "记录你的生活";

  return (
    <div className="h-screen w-screen bg-gray-100 dark:bg-neutral-800 flex flex-col justify-center items-center dark:text-gray-100">
      <header className="w-screen text-center min-h-[236px]">
        <div className="text-5xl font-bold text-mainColor dark:text-neutral-200">
          {appTitle}
        </div>
        <div className="mt-4 text-xl text-mainColor dark:text-neutral-300">
          {appSubTitle}
        </div>
      </header>
      <div className="w-[70%] md:w-[40%] lg:w-[30%] xl:w-[20%] flex flex-col items-center">
        <Input.Password
          size="large"
          className="mb-2"
          ref={passwordInputRef}
          placeholder="请输入密码"
          prefix={<KeyOutlined />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={onPasswordInputKeyUp}
        />

        <Button
          size="large"
          block
          loading={isLogin}
          type="primary"
          style={{ background: THEME_BUTTON_COLOR }}
          onClick={onPasswordSubmit}
        >
          登 录
        </Button>
      </div>
    </div>
  );
};
