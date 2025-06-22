import { Form, message, Image, Modal } from "antd";
import React, { useState } from "react";
import {
  Label,
  WrapperInfo,
  WrapperLeft,
  WrapperRight,
  WrapperTotal,
  PaymentMethodWrapper,
  PaymentOptionCard,
  QRCodeWrapper,
  PaymentInstructions
} from "./style";
import { CheckOutlined, InfoCircleOutlined } from "@ant-design/icons";

import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import { useDispatch, useSelector } from "react-redux";
import { resetCart } from "../../redux/slices/cartSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { convertPrice } from "../../utils/utils";
import * as OrderService from "../../services/OrderService";
import Loading from "../../components/LoadingComponent/Loading";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import {
  createPayPalPayment,
  capturePayPalOrder,
} from "../../services/PaypalService";
import { createVNPayPayment } from "../../services/VNPayService";
import { useMutation } from "@tanstack/react-query";
import QRCodeImage from "../../assets/images/QRCode.jpg";
import VNPAYImage from "../../assets/images/Icon-VNPAY.webp";
import PayPalImage from "../../assets/images/Icon-Paypal.webp";

const PaymentPage = () => {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const { shippingAddress, voucherCode, totalPrice } = location?.state || {};
  const [showQRModal, setShowQRModal] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);

  const [stateUserDetails] = useState({
    name: shippingAddress?.name || user?.name,
    phone: shippingAddress?.phone || user?.phone,
    address: shippingAddress?.address ? 
      `${shippingAddress.address.detailedAddress}, ${shippingAddress.address.ward}, ${shippingAddress.address.district}, ${shippingAddress.address.city}` 
      : user?.address,
  });

  const [payment, setPayment] = useState("COD");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const createOrderMutation = useMutation({
    mutationFn: (data) => OrderService.createOrder(data),
    onSuccess: (data) => {
      message.success("Đặt hàng thành công!");
      dispatch(resetCart());
    },
    onError: (error) => {
      message.error("Đặt hàng thất bại: " + (error?.response?.data?.message || "Có lỗi xảy ra!"));
    }
  });

  const handleAddOrder = async() => {
    if (user?.access_token && totalPrice) {
      const orderData = {
        paymentMethod: payment,
        voucherCode: voucherCode || null,
        fullName: stateUserDetails.name,
        phone: stateUserDetails.phone,
        address: stateUserDetails.address,
        token: user?.access_token
      };
      
      return await createOrderMutation.mutateAsync(orderData);
    } else {
      message.error("Vui lòng đăng nhập để tiếp tục!");
    }
  };

  const showQRCodeModal = () => {
    if (payment === 'COD') {
      setShowQRModal(true);
    }
  };

  //Phần xử lý cho tạo thanh toán paypal trên hệ thống Paypal
  const createPayPalPaymentMutation = useMutation({
    mutationFn: (data) => {
      return createPayPalPayment(data);
    },
    onError: () => {
      message.error("Không thể tạo đơn hàng PayPal, vui lòng thử lại!");
    },
  });

  //Phần xử lý cho xác nhận thanh toán paypal
  const capturePayPalOrderMutation = useMutation({
    mutationFn: (data) => {
      return capturePayPalOrder(data);
    },
    onSuccess: () => {
      message.success("Thanh toán PayPal thành công!");
    },
    onError: () => {
      message.error("Không thể xác nhận thanh toán PayPal!");
    },
  });

  //Phần xử lý cho tạo thanh toán VNPay
  const createVNPayPaymentMutation = useMutation({
    mutationFn: (data) => {
      const { orderId } = data;  
      return createVNPayPayment(user?.access_token, orderId);
    },
    onSuccess: (data) => {
      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        message.error("Không thể tạo thanh toán VNPay!");
      }
    },
    onError: (error) => {
      message.error("Không thể tạo thanh toán VNPay: " + (error?.response?.data?.message || "Có lỗi xảy ra!"));
    },
  });

  //Tạo thanh toán trên hệ thống Paypal
  const handleCreatePayPalOrder = async () => {
    if (user?.access_token) {
      //Tạo đơn hàng trước tiên
      const orderResult = await handleAddOrder();

      if (orderResult?.status === "OK" && orderResult?.order?._id) {
        setNewOrderId(orderResult?.order?._id);

        //MutateAsync để lấy được data trả về
        const data = await createPayPalPaymentMutation.mutateAsync({
          orderId: orderResult?.order?._id,
          accessToken: user?.access_token,
        });

        //Trả về id của thanh toán trên hệ thống Paypal
        return data.id;
      }
    }
  };

  //Xử lý cho tạo đơn hàng và xác nhận thanh toán paypal
  const handleApprovePayPalOrder = async (data) => {
    try {
      const response = await capturePayPalOrderMutation.mutateAsync({
        paymentId: data?.orderID,
        orderId: newOrderId,
        accessToken: user?.access_token,
        userId: orderResult?.order?.user,
      });
        
      navigate("/order-success", {
        state: {
          order: response.order
        },
      });
    } catch (error) {
      message.error("Thanh toán PayPal thất bại!");
    }
  };

  // Xử lý thanh toán VNPay
  const handleVNPayPayment = async () => {
    if (!user?.access_token) {
      message.error("Vui lòng đăng nhập để tiếp tục!");
      return;
    }

    if (!totalPrice) {
      message.error("Không tìm thấy thông tin giá!");
      return;
    }

    try {
      // Tạo đơn hàng trước    
      const orderResult = await handleAddOrder();
      
      if (orderResult?.status === "OK" && orderResult?.order?._id) {
        dispatch(resetCart());
        message.success("Tạo đơn hàng thành công!");
        createVNPayPaymentMutation.mutate({orderId: orderResult?.order?._id});
      } else {
        message.error("Không thể tạo đơn hàng để thanh toán VNPay!");
      }
    } catch (error) {
      message.error("Thanh toán VNPay thất bại!");
    }
  };

  return (
    <div style={{ background: "#f5f5fa", with: "100%", padding: "30px 15vw" }}>
      <Loading isLoading={createOrderMutation.isPending || createPayPalPaymentMutation.isPending || capturePayPalOrderMutation.isPending || createVNPayPaymentMutation.isPending}>
        <div>
          <h3
            style={{
              fontWeight: "bold",
              fontSize: "28px",
              marginBottom: "20px",
              color: "#00a551"
            }}
          >
            Thanh toán
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "30px" }}>
            <WrapperLeft>
              <WrapperInfo>
                <div>
                  <Label>Chọn phương thức thanh toán</Label>
                  <PaymentMethodWrapper>
                    <PaymentOptionCard 
                      isSelected={payment === 'COD'} 
                      onClick={() => setPayment('COD')}
                    >
                      <div className="payment-icon">
                        <Image 
                          src={QRCodeImage} 
                          width={payment === 'COD' ? 80 : 60} 
                          preview={false}
                          onClick={payment === 'COD' ? showQRCodeModal : undefined}
                          style={payment === 'COD' ? { cursor: 'pointer' } : {}}
                        />
                      </div>
                      <div className="payment-info">
                        <h4>Thanh toán khi nhận hàng (COD)</h4>
                        <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                        {payment === 'COD' && (
                          <p className="tap-qr">
                            <InfoCircleOutlined /> Nhấp vào mã QR để xem chi tiết
                          </p>
                        )}
                      </div>
                      {payment === 'COD' && <CheckOutlined className="check-icon" />}
                    </PaymentOptionCard>
                    
                    <PaymentOptionCard 
                      isSelected={payment === 'VNPAY'} 
                      onClick={() => setPayment('VNPAY')}
                    >
                      <div className="payment-icon">
                        <img 
                          src={VNPAYImage} 
                          width={payment === 'VNPAY' ? 80 : 60} 
                          alt="VNPAY"
                        />
                      </div>
                      <div className="payment-info">
                        <h4>Thanh toán qua VNPAY</h4>
                        <p>Thanh toán trực tuyến qua cổng thanh toán VNPAY</p>
                      </div>
                      {payment === 'VNPAY' && <CheckOutlined className="check-icon" />}
                    </PaymentOptionCard>
                    
                    <PaymentOptionCard 
                      isSelected={payment === 'PAYPAL'} 
                      onClick={() => setPayment('PAYPAL')}
                    >
                      <div className="payment-icon">
                        <img 
                          src={PayPalImage} 
                          width={payment === 'PAYPAL' ? 100 : 80} 
                          alt="PayPal"
                        />
                      </div>
                      <div className="payment-info">
                        <h4>Thanh toán qua PayPal</h4>
                        <p>Thanh toán trực tuyến qua PayPal</p>
                      </div>
                      {payment === 'PAYPAL' && <CheckOutlined className="check-icon" />}
                    </PaymentOptionCard>
                  </PaymentMethodWrapper>
                </div>
              </WrapperInfo>
            </WrapperLeft>
            <WrapperRight>
              <div style={{ width: "100%" }}>
                <WrapperInfo>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ color: "#333333", fontWeight: "bold", minWidth: "100px", fontSize: "16px" }}>
                      Địa chỉ:
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "16px", fontWeight: "bold" }}>{stateUserDetails?.name}</div> 
                      <div style={{ fontSize: "16px" }}>{stateUserDetails?.phone}</div>
                      <div style={{ color: "#666", lineHeight: "1.5", fontSize: "15px" }}>
                        {stateUserDetails?.address}
                      </div>
                    </div>
                  </div>
                </WrapperInfo>
                
                {voucherCode && (
                  <WrapperInfo>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#333333", fontSize: "16px" }}>Mã voucher đã áp dụng:</span>
                      <span style={{ fontWeight: "bold", color: "#00a551", fontSize: "16px" }}>{voucherCode}</span>
                    </div>
                  </WrapperInfo>
                )}
                
                <WrapperTotal>
                  <span style={{ fontSize: "18px" }}>Tổng tiền</span>
                  <span>
                    <span
                      style={{
                        color: "rgb(254, 56, 52)",
                        fontSize: "28px",
                        fontWeight: "bold",
                        display: "block",
                        textAlign: "right"
                      }}
                    >
                      {convertPrice(totalPrice)}
                    </span>
                  </span>
                </WrapperTotal>
              </div>
              
              {payment === 'COD' && (
                <ButtonComponent
                  onClick={ async () => {
                    const data = await handleAddOrder();
                    navigate("/order-success", {
                      state: {
                        order: data.order
                      },
                    });
                  }}
                  size={40}
                  styleButton={{
                    background: "#00a551",
                    height: "54px",
                    width: "100%",
                    border: "none",
                    borderRadius: "4px",
                    marginTop: "20px"
                  }}
                  textbutton="Đặt hàng"
                  styleTextButton={{
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: "700",
                  }}
                ></ButtonComponent>
              )}

              {payment === 'VNPAY' && (
                <ButtonComponent
                  onClick={handleVNPayPayment}
                  size={40}
                  styleButton={{
                    background: "#0066b3",
                    height: "54px",
                    width: "100%",
                    border: "none",
                    borderRadius: "4px",
                    marginTop: "20px"
                  }}
                  textbutton="Thanh toán qua VNPAY"
                  styleTextButton={{
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: "700",
                  }}
                ></ButtonComponent>
              )}

              {payment === 'PAYPAL' && (
                <div style={{ width: "100%", marginTop: "20px" }}>
                  <PayPalScriptProvider
                    options={{
                      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                      components: "buttons",
                      currency: "USD",
                    }}
                  >
                    <PayPalButtons
                      createOrder={handleCreatePayPalOrder}
                      onApprove={handleApprovePayPalOrder}
                      style={{ layout: "horizontal" }}
                    />
                  </PayPalScriptProvider>
                </div>
              )}
            </WrapperRight>
          </div>
        </div>
      </Loading>

      <Modal
        title={<div style={{ fontSize: "20px", fontWeight: "bold", color: "#00a551" }}>Chi tiết thanh toán</div>}
        open={showQRModal}
        onCancel={() => setShowQRModal(false)}
        footer={null}
        width={600}
      >
        <QRCodeWrapper>
          <Image src={QRCodeImage} width={250} preview={false} />
          <PaymentInstructions>
            <h3>Hướng dẫn thanh toán:</h3>
            <p><strong>Số tiền:</strong> {convertPrice(totalPrice)}</p>
            <p><strong>Người nhận:</strong> Phạm Tuấn Trung</p>
            <p><strong>Số điện thoại:</strong> 0975853235</p>
            <p><strong>Nội dung chuyển khoản:</strong> {stateUserDetails.name + "-" + stateUserDetails.phone + " Thanh toan don hang"}</p>
            <div className="payment-note">
              <InfoCircleOutlined /> <strong>Lưu ý:</strong> Sau khi chuyển khoản, vui lòng gửi ảnh chụp màn hình xác nhận qua Zalo: <strong>0975853235</strong> (Phạm Tuấn Trung)
            </div>
          </PaymentInstructions>
        </QRCodeWrapper>
      </Modal>
    </div>
  );
};

export default PaymentPage;
