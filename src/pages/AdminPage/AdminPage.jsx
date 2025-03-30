import React, { useState } from "react";
import { ConfigProvider, Menu } from "antd";
import {
  AppstoreOutlined,
  UserOutlined,
  ShoppingOutlined,
  BookOutlined,
  AppstoreAddOutlined,
  ContainerOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import HeaderComponent from "../../components/HeaderComponent/HeaderComponent";
import AdminUser from "../../components/AdminUser/AdminUser";
import AdminProduct from "../../components/AdminProduct/AdminProduct";
import AdminOrder from "../../components/AdminOrder/AdminOrder";
import AdminGenre from "../../components/AdminGenre/AdminGenre";
import AdminInventory from "../../components/AdminInventory/AdminInventory";
import AdminBatch from "../../components/AdminBatch/AdminBatch";
import AdminVoucher from "../../components/AdminVoucher/AdminVoucher";
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminPage = () => {
  const user = useSelector((state) => state.user);

  // Kiểm tra quyền admin
  if (!user?.id) {
    return <Navigate to="/sign-in" state={{ from: "/admin" }} />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/forbidden" />;
  }

  const [keySelected, setKeySelected] = useState("user");

  const renderPage = (key) => {
    switch (key) {
      case 'user':
        return <AdminUser />;
      case 'product':
        return <AdminProduct />;
      case 'order':
        return <AdminOrder />;
      case 'genre':
        return <AdminGenre />;
      case 'inventory':
        return <AdminInventory />;
      case 'batch':
        return <AdminBatch />;
      case 'voucher':
        return <AdminVoucher />;
      default:
        return <div></div>;
    }
  };

  const items = [
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
      key: "batch",
      label: "Lô hàng",
      icon: <ContainerOutlined />,
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
    setKeySelected(key);
  };

  return (
    <div>
      <HeaderComponent isHiddenSearch isHiddenCart />
      <div style={{ display: "flex", marginTop: '30px' }}>
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                /* here is your component tokens */
              },
            },
            token: {
              /* here is your global tokens */
              fontSize: 18,
            },
          }}
        >
          <Menu
            onClick={handleOnClick}
            style={{
              width: 256,
              boxShadow: '1px 1px 2px #ccc',
              height: '150vh'
            }}
            defaultSelectedKeys={["user"]}
            mode="inline"
            items={items}
          />
        </ConfigProvider>

        <div style={{padding: '20px', flex: '1'}}>
          {renderPage(keySelected)}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
