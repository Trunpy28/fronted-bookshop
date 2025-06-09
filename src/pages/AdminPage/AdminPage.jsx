import React from "react";
import { ConfigProvider, Menu, Layout } from "antd";
import {
  AppstoreOutlined,
  UserOutlined,
  ShoppingOutlined,
  BookOutlined,
  AppstoreAddOutlined,
  ContainerOutlined,
  GiftOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Sider, Content } = Layout;

const AdminPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Xác định key từ đường dẫn hiện tại
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return '';
    
    const segments = path.split('/');
    if (segments.length > 2) {
      return segments[2]; // Lấy phần admin/:key
    }

    return '';
  };

  // Kiểm tra quyền admin
  if (!user?.id) {
    return <Navigate to="/sign-in" state={{ from: "/admin" }} />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/forbidden" />;
  }

  const items = [
    {
      key: "",
      label: "Tổng quan",
      icon: <DashboardOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "user",
      label: "Người dùng",
      icon: <UserOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "genre",
      label: "Thể loại",
      icon: <AppstoreOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "product",
      label: "Sản phẩm",
      icon: <BookOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "inventory",
      label: "Kho hàng",
      icon: <AppstoreAddOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "order",
      label: "Đơn hàng",
      icon: <ShoppingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "voucher",
      label: "Mã giảm giá",
      icon: <GiftOutlined />,
    },
    {
      type: "divider",
    },
  ];

  const handleOnClick = ({ key }) => {
    if(key === '') {
      navigate('/admin');
    } else {
      navigate(`/admin/${key}`);
    }
  };

  return (
    <div>
      <HeaderComponent isHiddenSearch isHiddenCart />
      <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Sider
          width={230}
          style={{
            background: '#fff',
            marginTop: '30px',
            marginLeft: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
            borderRadius: '10px',
            overflow: 'hidden'
          }}
        >
          <ConfigProvider
            theme={{
              token: {
                fontSize: 16,
                colorPrimary: '#1677ff',
                borderRadius: 6,
              },
              components: {
                Menu: {
                  fontSize: 16,
                  itemSelectedBg: '#e6f4ff',
                  itemSelectedColor: '#1677ff',
                  itemHoverBg: '#f5f5f5',
                  itemHoverColor: '#1677ff',
                  fontWeightStrong: 600,
                  itemHeight: 50,
                  itemMarginInline: 10,
                }
              }
            }}
          >
            <div style={{ 
              padding: '16px 16px', 
              fontWeight: 'bold', 
              fontSize: '18px', 
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              color: '#1677ff'
            }}>
              <ContainerOutlined style={{ marginRight: '10px' }} /> Quản trị BKshop
            </div>
            <Menu
              onClick={handleOnClick}
              style={{
                height: 'calc(100vh - 130px)',
                border: 'none',
                padding: '10px'
              }}
              selectedKeys={[getSelectedKey()]}
              mode="inline"
              items={items}
            />
          </ConfigProvider>
        </Sider>

        <Content style={{ padding: '20px 30px', marginTop: '30px' }}>
          <div style={{ 
            background: '#fff', 
            padding: '24px', 
            minHeight: 'calc(100vh - 64px - 50px)',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default AdminPage;
