import { message, Button } from "antd";
import React, { useState } from "react";
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
import { convertPrice, timeTranform } from "../../utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import { getStatusIcon, getStatusText } from "../../utils/orderUtils";

const MyOrderPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [isShowModalCancel, setIsShowModalCancel] = useState(false);
  const [orderIdToCancel, setOrderIdToCancel] = useState(null);

  const queryOrder = useQuery({
    queryKey: ["orders"],
    queryFn: () => OrderService.getMyOrders(user?.access_token),
    enabled: !!user?.access_token,
  });

  const { isPending, data } = queryOrder;

  const handleDetailsOrder = (orderId) => {
    navigate(`/details-order/${orderId}`);
  };

  const mutation = useMutation({
    mutationFn: (orderId) => OrderService.cancelOrder(orderId, user?.access_token),
    onSuccess: () => {
      queryOrder.refetch();
      setIsShowModalCancel(false);
      setOrderIdToCancel(null);
      message.success("Hủy đơn hàng thành công");
    },
    onError: () => {
      message.error("Hủy đơn hàng thất bại");
    }
  });

  const handleCancelOrder = (orderId) => {
    setOrderIdToCancel(orderId);
    setIsShowModalCancel(true);
  };

  const handleConfirmCancelOrder = () => {
    if (orderIdToCancel) {
      mutation.mutate(orderIdToCancel);
    }
  };

  return (
    <Loading isLoading={isPending}>
      <WrapperContainer>
        <div style={{ width: "100%", height: "100%" }}>
          <div style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>Đơn hàng của tôi</div>
          <WrapperListOrder>
            {data?.map((order) => {
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
                      {order.status === "Pending" && (
                        <Button
                          onClick={() => handleCancelOrder(order._id)}
                          type="default"
                          danger
                        >
                          Hủy đơn hàng
                        </Button>
                      )}
                    </ActionButtons>
                  </WrapperFooterItem>
                </WrapperItemOrder>
              );
            })}
          </WrapperListOrder>
        </div>
      </WrapperContainer>
      <ModalComponent
        title="Xác nhận hủy đơn hàng"
        open={isShowModalCancel}
        onCancel={() => {
          setIsShowModalCancel(false);
          setOrderIdToCancel(null);
        }}
        onOk={handleConfirmCancelOrder}
        okText="Đồng ý"
        cancelText="Hủy"
      >
        <div>Bạn có chắc chắn muốn hủy đơn hàng này không?</div>
      </ModalComponent>
    </Loading>
  );
};

export default MyOrderPage;
