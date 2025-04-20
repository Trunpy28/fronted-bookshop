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
import { convertPrice } from "../../utils";
import * as OrderService from "../../services/OrderService";
import Loading from "../../components/LoadingComponent/Loading";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import {
  capturePayPalOrder,
  createPayPalOrder,
} from "../../services/PaypalService";
import { useMutation } from "@tanstack/react-query";
import QRCodeImage from "../../assets/images/QRCode.jpg";

const PaymentPage = () => {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const { shippingAddress, voucherCode, totalPrice } = location?.state || {};
  const [showQRModal, setShowQRModal] = useState(false);

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

  const { mutate: createOrderMutation, isPending: isLoadingCreateOrder } = useMutation({
    mutationFn: (data) => OrderService.createOrder(data),
    onSuccess: (data) => {
      message.success("Đặt hàng thành công!");
      dispatch(resetCart());
      navigate("/order-success", {
        state: {
          order: data.data
        },
      });
    },
    onError: (error) => {
      message.error("Đặt hàng thất bại: " + (error?.response?.data?.message || "Có lỗi xảy ra!"));
    }
  });

  const handleAddOrder = () => {
    if (user?.access_token && totalPrice) {
      const orderData = {
        paymentMethod: payment,
        voucherCode: voucherCode || null,
        fullName: stateUserDetails.name,
        phone: stateUserDetails.phone,
        address: stateUserDetails.address,
        token: user?.access_token
      };
      
      createOrderMutation(orderData);
    } else {
      message.error("Vui lòng đăng nhập để tiếp tục!");
    }
  };

  const showQRCodeModal = () => {
    if (payment === 'COD') {
      setShowQRModal(true);
    }
  };

  //Phần xử lý cho paypal
  const createPayPalOrderMutation = useMutation({
    mutationFn: (data) => {
      return createPayPalOrder(data);
    },
    onError: () => {
      message.error("Không thể tạo đơn hàng PayPal, vui lòng thử lại!");
    },
  });

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

  const handleCreatePayPalOrder = async () => {
    if (user?.access_token && totalPrice && user?.id) {
      const data = await createPayPalOrderMutation.mutateAsync({
        amount: totalPrice,
        currency: "USD",
        accessToken: user?.access_token,
        userId: user?.id,
      });
      
      return data.id;
    }
  };

  const handleApprovePayPalOrder = async (data) => {
    try {
      const orderData = {
        paymentMethod: 'PAYPAL',
        voucherCode: voucherCode || null,
        fullName: stateUserDetails.name,
        phone: stateUserDetails.phone,
        address: stateUserDetails.address,
        token: user?.access_token
      };
      
      const orderResult = await OrderService.createOrder(orderData);
      
      if (orderResult?.status === "OK") {
        await capturePayPalOrderMutation.mutateAsync({
          paymentId: data.orderID,
          orderId: orderResult.data._id,
          accessToken: user?.access_token,
          userId: user?.id,
        });
        
        message.success("Đặt hàng thành công!");
        dispatch(resetCart());
        navigate("/order-success", {
          state: {
            order: orderResult.data
          },
        });
      } else {
        message.error("Không thể tạo đơn hàng để thanh toán PayPal!");
      }
    } catch (error) {
      message.error("Thanh toán PayPal thất bại!");
    }
  };

  return (
    <div style={{ background: "#f5f5fa", with: "100%", padding: "30px 15vw" }}>
      <Loading isLoading={isLoadingCreateOrder || createPayPalOrderMutation.isPending || capturePayPalOrderMutation.isPending}>
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
                      disabled
                    >
                      <div className="payment-icon">
                        <img 
                          src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png" 
                          width={payment === 'VNPAY' ? 80 : 60} 
                          alt="VNPAY"
                        />
                      </div>
                      <div className="payment-info">
                        <h4>Thanh toán qua VNPAY</h4>
                        <p>Quét mã QR để thanh toán (Đang phát triển)</p>
                      </div>
                      {payment === 'VNPAY' && <CheckOutlined className="check-icon" />}
                    </PaymentOptionCard>
                    
                    <PaymentOptionCard 
                      isSelected={payment === 'PAYPAL'} 
                      onClick={() => setPayment('PAYPAL')}
                    >
                      <div className="payment-icon">
                        <img 
                          src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" 
                          width={payment === 'PAYPAL' ? 100 : 80} 
                          alt="PayPal"
                        />
                      </div>
                      <div className="payment-info">
                        <h4>Thanh toán qua PayPal</h4>
                        <p>Sử dụng thẻ tín dụng quốc tế hoặc tài khoản PayPal</p>
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
              
              {payment === 'PAYPAL' ? (
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
              ) : (
                <ButtonComponent
                  onClick={handleAddOrder}
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
