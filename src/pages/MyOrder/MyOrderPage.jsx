import { Button, Empty } from "antd";
import React from "react";
import {
  WrapperContainer,
  WrapperItemOrder,
  WrapperListOrder,
  WrapperHeaderItem,
  WrapperStatus,
  WrapperFooterItem,
  WrapperInfo,
  WrapperLabel,
  WrapperValue,
  ProductItem,
  ProductImage,
  ProductInfo,
  ProductName,
  ProductQuantity,
  ProductPrice,
  TotalPrice,
  TotalLabel,
  TotalValue,
  ActionButtons
} from "./style";
import * as OrderService from "../../services/OrderService";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/LoadingComponent/Loading";
import { convertPrice, timeTranform } from "../../utils/utils";
import { useQuery } from "@tanstack/react-query";
import { getStatusIcon, getStatusText } from "../../utils/orderUtils";
import { ShoppingOutlined } from "@ant-design/icons";

const MyOrderPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const queryOrder = useQuery({
    queryKey: ["orders"],
    queryFn: () => OrderService.getMyOrders(user?.access_token),
    enabled: !!user?.access_token,
    staleTime: 1000 * 60 * 3,
  });

  const { isPending, data } = queryOrder;

  const handleDetailsOrder = (orderId) => {
    navigate(`/details-order/${orderId}`);
  };

  const handleShopNow = () => {
    navigate('/products');
  };

  return (
    <Loading isLoading={isPending}>
      <WrapperContainer>
        <div style={{ width: "100%", height: "100%" }}>
          <div style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>Đơn hàng của tôi</div>
          <WrapperListOrder>
            {!data || data?.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span style={{ fontSize: "16px", color: "#666" }}>
                      Bạn chưa có đơn hàng nào
                    </span>
                  }
                />
                <Button 
                  type="primary" 
                  icon={<ShoppingOutlined />} 
                  style={{ marginTop: 20, backgroundColor: '#00a551', borderColor: '#00a551' }}
                  onClick={handleShopNow}
                >
                  Mua sắm ngay
                </Button>
              </div>
            ) : (
              data?.map((order) => {
                return (
                  <WrapperItemOrder key={order._id}>
                    <WrapperHeaderItem>
                      <WrapperInfo>
                        <WrapperLabel>Mã đơn hàng:</WrapperLabel>
                        <WrapperValue>#{order._id}</WrapperValue>
                      </WrapperInfo>
                      <WrapperInfo>
                        <WrapperLabel>Ngày đặt:</WrapperLabel>
                        <WrapperValue>{timeTranform(order.createdAt)}</WrapperValue>
                      </WrapperInfo>
                      <WrapperStatus>
                        {getStatusIcon(order.status)}
                        <span style={{ marginLeft: "10px" }}>{getStatusText(order.status)}</span>
                      </WrapperStatus>
                    </WrapperHeaderItem>
                    {order?.orderItems?.map((orderItem) => {
                      return (
                        <ProductItem key={orderItem.product}>
                          <ProductImage src={orderItem.images[0]} alt="" />
                          <ProductInfo>
                            <div>
                              <ProductName>{orderItem.name}</ProductName>
                              <ProductQuantity>Số lượng: {orderItem.quantity}</ProductQuantity>
                            </div>
                            <ProductPrice>
                              {convertPrice(orderItem.originalPrice * orderItem.quantity)}
                            </ProductPrice>
                          </ProductInfo>
                        </ProductItem>
                      );
                    })}
                    <WrapperFooterItem>
                      <TotalPrice>
                        <TotalLabel>Tổng tiền:</TotalLabel>
                        <TotalValue>{convertPrice(order.totalPrice)}</TotalValue>
                      </TotalPrice>
                      <ActionButtons>
                        <Button
                          onClick={() => handleDetailsOrder(order._id)}
                          type="default"
                          style={{
                            borderColor: "#00a551",
                            color: "#00a551",
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </ActionButtons>
                    </WrapperFooterItem>
                  </WrapperItemOrder>
                );
              })
            )}
          </WrapperListOrder>
        </div>
      </WrapperContainer>
    </Loading>
  );
};

export default MyOrderPage;
