import { atom, useSetAtom } from "jotai";
import { useEffect } from "react";

export const getIsMobile = () => {
  const screenWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

  return screenWidth < 768;
};

/**
 * 当前是否为移动端
 * 会根据这个属性来决定是否渲染对应平台的组件
 */
export const stateIsMobile = atom<boolean>(getIsMobile());

/**
 * 应用顶部的标题栏 title
 */
export const statePageTitle = atom<string>("");

export const usePageTitle = (title: string) => {
  const setCurrentPageTitle = useSetAtom(statePageTitle);

  useEffect(() => {
    setCurrentPageTitle(title);
    document.title = title + " - Cube Note";
  }, [title]);

  useEffect(() => {
    return () => {
      setCurrentPageTitle("");
      document.title = "Cube Note";
    };
  }, []);
};
