import { useNavigate, useSearchParams } from "react-router-dom";

export const useLoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const runLoginSuccess = () => {
    let nextUrl = searchParams.get("redirect");
    if (nextUrl) {
      nextUrl = decodeURIComponent(nextUrl);
    }

    navigate(nextUrl ? nextUrl : "/", { replace: true });
  };

  return {
    runLoginSuccess,
  };
};
