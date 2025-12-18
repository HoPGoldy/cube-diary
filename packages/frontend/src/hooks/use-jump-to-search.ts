import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** 当按下 ctrl + f 时，跳转到搜索页 */
export const useJumpToSearch = () => {
  const navigate = useNavigate();

  const jumpToSearch = () => {
    navigate("/search");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        jumpToSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return { jumpToSearch };
};
