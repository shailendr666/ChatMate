import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUser, clearUser } from "../store/Slices/AuthSlice";

type ProtectedProps = {
  Component: React.ComponentType;
};

export const Protected: React.FC<ProtectedProps> = ({ Component }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    
    if (isAuthenticated) return;

    apiClient
      .get("/auth/me")
      .then((res) => {
        dispatch(setUser(res.data.user));
      })
      .catch(() => {
        dispatch(clearUser());
        navigate("/login", { replace: true });
      });
  }, [isAuthenticated, dispatch, navigate]);

  if (isLoading && !isAuthenticated) return null;

  return <Component />;
};
