import React, { useEffect, useLayoutEffect, useState } from "react";
import { Badge, Col, Popover } from "antd";
import {
  WrapperHeader,
  WrapperHeaderButton,
  WrapperPopupContent,
} from "./style";
import logo from "../../assets/images/bookshop_logo.jpg";
import { Input, ConfigProvider } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  InfoCircleOutlined,
  UserAddOutlined,
  SettingOutlined,
  SearchOutlined,
  ContainerOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as UserService from "../../services/UserService";
import { resetUser } from "../../redux/slices/userSlice";
import Loading from "../LoadingComponent/Loading";
import { resetCart } from "../../redux/slices/cartSlice";
const { Search } = Input;

const HeaderComponent = ({ isHiddenSearch = false, isHiddenCart = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [search, setSearch] = useState("");

  const handleNavigateLogin = () => {
    navigate("/sign-in");
  };

  const handleLogout = async () => {
    setLoading(true);
    await UserService.logoutUser();
    localStorage.removeItem("access_token");
    dispatch(resetUser());
    dispatch(resetCart());
    setLoading(false);
    navigate("/");
  };

  useEffect(() => {
    setLoading(true);
    setUserName(user.name || user.email);
    setUserAvatar(user.avatar);
    setLoading(false);
  }, [user?.name, user.email, user?.avatar]);
  
  // Kiểm tra nếu đang ở trang products và lấy tham số tìm kiếm từ URL
  useEffect(() => {
    if (location.pathname === '/products') {
      const searchQuery = searchParams.get('q') || '';
      setSearch(searchQuery);
    }
  }, [location.pathname, searchParams]);

  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <WrapperPopupContent
        onClick={() => {
          navigate("/profile-user");
        }}
      >
        <InfoCircleOutlined /> Thông tin tài khoản
      </WrapperPopupContent>
      {user?.isAdmin && (
        <WrapperPopupContent
          onClick={() => {
            navigate("/admin");
          }}
        >
          <SettingOutlined /> Quản lý hệ thống
        </WrapperPopupContent>
      )}
      <WrapperPopupContent
        onClick={() => {
          navigate("/my-order", {
            state: {
              id: user?.id,
              token: user?.access_token,
            },
          });
        }}
      >
        <ContainerOutlined /> Đơn hàng của tôi
      </WrapperPopupContent>
      <WrapperPopupContent onClick={handleLogout}>
        <LogoutOutlined /> Đăng xuất
      </WrapperPopupContent>
    </div>
  );

  const contentNotSignIn = (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <WrapperPopupContent onClick={handleNavigateLogin}>
        <LogoutOutlined /> Đăng nhập
      </WrapperPopupContent>
      <WrapperPopupContent
        onClick={() => {
          navigate("/sign-up");
        }}
      >
        <UserAddOutlined /> Đăng ký
      </WrapperPopupContent>
    </div>
  );

  const onSearch = (value, event) => {
    if (!value) {
      // Nếu tìm kiếm rỗng và đang ở trang products, xóa tham số q
      if (location.pathname === '/products') {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('q');
        setSearchParams(newSearchParams);
      }
      return;
    }
    
    // Chuyển hướng đến trang products với tham số q
    navigate(`/products?q=${encodeURIComponent(value)}`);
  };
  
  // Xử lý khi người dùng thay đổi giá trị ô tìm kiếm
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
  };

  useLayoutEffect(() => {
    // Reset giá trị tìm kiếm khi rời khỏi trang products
    if (location.pathname !== '/products') {
      setSearch('');
    }
  }, [location.pathname]);

  return (
    <div>
      <WrapperHeader>
        <Col span={5}>
          <img
            src={logo}
            alt=""
            style={{
              width: "5vw",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          />
        </Col>
        <Col span={12}>
          {!isHiddenSearch && (
            <ConfigProvider
              theme={{
                token: {
                  // Seed Token
                  colorPrimary: "#00b96b",
                },
              }}
            >
              <Search
                placeholder="Tìm kiếm theo từ khóa trong tên sách..."
                enterButton={
                  <div style={{ fontSize: "16px" }}>
                    <SearchOutlined /> Tìm kiếm
                  </div>
                }
                size="large"
                onSearch={onSearch}
                value={search}
                onChange={handleSearchChange}
              />
            </ConfigProvider>
          )}
        </Col>
        <Col
          span={6}
          style={{ display: "flex", justifyContent: "end", gap: "30px" }}
        >
          {!isHiddenCart && (
            <WrapperHeaderButton
              onClick={() => {
                navigate("/cart");
              }}
            >
              <Badge count={cart?.cartItems?.length} size="medium">
                <ShoppingCartOutlined
                  style={{
                    fontSize: "36px",
                  }}
                />
              </Badge>
              <div
                style={{
                  fontSize: "16px",
                  cursor: "pointer",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: "center",
                }}
              >
                Giỏ hàng
              </div>
            </WrapperHeaderButton>
          )}
          <Loading isLoading={loading}>
            {(user?.access_token && user?.id) ? (
              <Popover placement="bottomRight" content={content}>
                <WrapperHeaderButton>
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt=""
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <UserOutlined
                      style={{
                        fontSize: "36px",
                      }}
                    />
                  )}

                  <div
                    style={{
                      fontSize: "16px",
                      cursor: "pointer",
                      maxWidth: "150px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      textOverflow: "ellipsis",
                      textAlign: "center",
                    }}
                  >
                    {userName?.length ? userName : user?.email}
                  </div>
                </WrapperHeaderButton>
              </Popover>
            ) : (
              <Popover placement="bottomRight" content={contentNotSignIn}>
                <WrapperHeaderButton onClick={handleNavigateLogin}>
                  <UserOutlined
                    style={{
                      fontSize: "36px",
                    }}
                  />

                  <div
                    style={{
                      fontSize: "16px",
                      cursor: "pointer",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textAlign: "center",
                      maxWidth: "100%",
                    }}
                  >
                    Tài khoản
                  </div>
                </WrapperHeaderButton>
              </Popover>
            )}
          </Loading>
        </Col>
      </WrapperHeader>
    </div>
  );
};

export default HeaderComponent;
