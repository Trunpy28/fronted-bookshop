import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import { routes } from "./routes";
import DefaultComponent from "./components/DefaultComponent/DefaultComponent";
import { isJsonString } from "./utils/utils";
import { jwtDecode } from "jwt-decode";
import * as UserService from "./services/UserService";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "./redux/slices/userSlice";
import Loading from "./components/LoadingComponent/Loading";
import * as CartService from "./services/CartService";
import { setCart } from "./redux/slices/cartSlice";

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const user = useSelector((state) => state.user);

  // Xử lý access token nằm trong localStorage
  const handleDecoded = () => {
    let storageData = localStorage.getItem("access_token");
    let decoded;
    if (storageData && isJsonString(storageData)) {
      storageData = JSON.parse(storageData);
      decoded = jwtDecode(storageData);
    }
    return { decoded, storageData };
  };

  // Lấy thông tin user
  const handleGetDetailsUser = async (id, accessToken) => {
    try {
      const res = await UserService.getDetailsUser(id, accessToken);
      dispatch(updateUser({ ...res?.data, access_token: accessToken }));
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const handleGetMyCart = async (accessToken) => {
    try {
      const res = await CartService.getCartByUser(accessToken);
      dispatch(setCart(res?.data));
    }
    catch (e) {
      console.log(e);
    }
  }

  // Chạy 1 lần để lấy thông tin user và giỏ hàng
  useEffect(() => {
    const initializeApp = async () => {
      const { storageData: accessToken, decoded } = handleDecoded();
      if (decoded?.id) {
        const success = await handleGetDetailsUser(decoded.id, accessToken);
        if (success) {
          handleGetMyCart(accessToken);
        }
      }
      setIsInitialized(true);
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  // Kiểm tra access_token hết hạn trước khi thực thi request, đặt access token mới vào config
  UserService.axiosJWT.interceptors.request.use(
    async (config) => {
      const currentTime = new Date();
      const { decoded } = handleDecoded();

      if (decoded?.exp < currentTime.getTime() / 1000) {
        const data = await UserService.refreshToken();
        const newToken = data?.accessToken;
        localStorage.setItem('access_token', JSON.stringify(newToken));
        config.headers["Authorization"] = `Bearer ${newToken}`;
        
        await handleGetDetailsUser(decoded.id, newToken);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  if (isLoading || !isInitialized) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loading isLoading={true} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>    
        {routes.map((route) => {
          const Page = route.page;
          const Layout = route.isShowHeader ? DefaultComponent : Fragment;

          // Kiểm tra route private
          if (route.isPrivate && !user?.id) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Navigate to="/sign-in" state={{ from: route.path }} />}
              />
            );
          }

          // Xử lý route có children (route con)
          if (route.children) {
            return (
              <Route 
                key={route.path} 
                path={route.path} 
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              >
                {route.children.map((child) => {
                  const ChildPage = child.page;
                  return (
                    <Route
                      key={`${route.path}/${child.path}`}
                      path={child.path}
                      element={<ChildPage />}
                    />
                  );
                })}
              </Route>
            );
          }

          // Route thông thường
          return (
            <Route
              key={route.path}
              path={route.path}
              element={<Layout><Page /></Layout>}
            />
          );
        })}
      </Routes>
    </Router>
  );
}

export default App;
