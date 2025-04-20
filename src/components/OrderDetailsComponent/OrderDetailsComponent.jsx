import React from "react";
import {
  WrapperInfo,
  WrapperContainer,
  WrapperItemOrder,
  WrapperNameProductOrder,
  WrapperCountOrder,
  WrapperStyleHeader,
  OrderStatus,
  OrderInfo,
  OrderDetails,
  ProductList,
  PriceSummary,
  PriceItem,
  PriceTotal,
  Label,
  PaymentInfo
} from "./style";
import { useNavigate } from "react-router-dom";
import { convertPrice, timeTranform } from "../../utils";
import { 
  getStatusIcon, 
  getStatusText, 
  getPaymentMethodText, 
  getPaymentStatusIcon, 
  getPaymentStatusText 
} from "../../utils/orderUtils";

const OrderDetailsComponent = ({ order }) => {
  const navigate = useNavigate();

  return (
    <WrapperContainer>
      <OrderInfo style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <WrapperInfo>
          <Label style={{ fontSize: '20px', marginBottom: '15px' }}>Thông tin đơn hàng</Label>
          <OrderStatus style={{ marginBottom: '20px' }}>
            {getStatusIcon(order?.status)}
            <span style={{ fontSize: '16px', marginLeft: '10px' }}>{getStatusText(order?.status)}</span>
          </OrderStatus>
          <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <p><strong>Mã đơn hàng:</strong> #{order?._id}</p>
            <p><strong>Thời gian đặt hàng:</strong> {timeTranform(order?.createdAt)}</p>
          </div>
        </WrapperInfo>

        <WrapperInfo>
          <Label style={{ fontSize: '20px', marginBottom: '15px' }}>Thông tin giao hàng</Label>
          <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <p><strong>Người nhận:</strong> {order?.fullName}</p>
            <p><strong>Điện thoại:</strong> {order?.phone}</p>
            <p><strong>Địa chỉ:</strong> {order?.address}</p>
          </div>
        </WrapperInfo>
      </OrderInfo>

      {order?.payment && (
        <PaymentInfo style={{ marginBottom: '30px' }}>
          <Label style={{ fontSize: '20px', marginBottom: '15px' }}>Thông tin thanh toán</Label>
          <div style={{ fontSize: '16px', lineHeight: '1.8', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            {getPaymentStatusIcon(order.payment.status)}
            <span style={{ marginLeft: '10px' }}><strong>Trạng thái thanh toán:</strong> {getPaymentStatusText(order.payment.status)}</span>
          </div>
          <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <p><strong>Phương thức thanh toán:</strong> {getPaymentMethodText(order.payment.paymentMethod)}</p>
          </div>
          <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <p><strong>Số tiền:</strong> {convertPrice(order.payment.amount)}</p>
            {order.payment.paidAt && (
              <p><strong>Thời gian thanh toán:</strong> {timeTranform(order.payment.paidAt)}</p>
            )}
            {order.payment.transactionId && (
              <p><strong>Mã giao dịch:</strong> {order.payment.transactionId}</p>
            )}
          </div>
        </PaymentInfo>
      )}

      <OrderDetails>
        <Label style={{ fontSize: '20px', marginBottom: '15px' }}>Chi tiết đơn hàng</Label>
        <ProductList>
          <WrapperStyleHeader style={{ padding: '15px', fontSize: '16px', fontWeight: '600' }}>
            <div style={{ width: "40%" }}>Sản phẩm</div>
            <div style={{ width: "20%", textAlign: "center" }}>Đơn giá</div>
            <div style={{ width: "20%", textAlign: "center" }}>Số lượng</div>
            <div style={{ width: "20%", textAlign: "right" }}>Thành tiền</div>
          </WrapperStyleHeader>
          {order?.orderItems?.map((item) => (
            <WrapperItemOrder key={item?.product}>
              <div style={{ width: "40%", display: "flex", alignItems: "center", gap: "15px" }}>
                <img
                  src={item?.images[0]}
                  style={{ 
                    width: "100px", 
                    height: "150px", 
                    objectFit: "cover",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    border: "1px solid #eee",
                    borderRadius: "4px"
                  }}
                  onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                  onClick={() => navigate(`/product-details/${item?.product}`)}
                  alt={item?.name}
                />
                <WrapperNameProductOrder
                  onClick={() => navigate(`/product-details/${item?.product}`)}
                  style={{ 
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    flex: 1
                  }}
                  onMouseOver={(e) => e.target.style.color = "#00a551"}
                  onMouseOut={(e) => e.target.style.color = "inherit"}
                >
                  {item?.name}
                </WrapperNameProductOrder>
              </div>
              <div style={{ 
                width: "20%", 
                textAlign: "center",
                fontSize: '16px',
                color: '#ff4d4f',
                fontWeight: '600'
              }}>
                {convertPrice(item?.originalPrice)}
              </div>
              <WrapperCountOrder style={{ 
                width: "20%", 
                textAlign: "center",
                fontSize: '16px',
                fontWeight: '500'
              }}>
                {item?.quantity}
              </WrapperCountOrder>
              <div style={{ 
                width: "20%", 
                textAlign: "right",
                fontSize: '16px',
                color: '#ff4d4f',
                fontWeight: '600'
              }}>
                {convertPrice(item?.originalPrice * item?.quantity)}
              </div>
            </WrapperItemOrder>
          ))}
        </ProductList>

        <PriceSummary style={{ padding: '20px' }}>
          <PriceItem style={{ fontSize: '16px', marginBottom: '10px' }}>
            <span>Tạm tính:</span>
            <span style={{ fontWeight: '600' }}>{convertPrice(order?.itemsPrice)}</span>
          </PriceItem>
          <PriceItem style={{ fontSize: '16px', marginBottom: '10px' }}>
            <span>Phí vận chuyển:</span>
            <span style={{ fontWeight: '600' }}>{convertPrice(order?.shippingPrice)}</span>
          </PriceItem>
          {order?.discountPrice > 0 && (
            <PriceItem style={{ fontSize: '16px', marginBottom: '10px', color: '#00a551' }}>
              <span>Giảm giá:</span>
              <span style={{ fontWeight: '600' }}>-{convertPrice(order?.discountPrice)}</span>
            </PriceItem>
          )}
          <PriceTotal style={{ 
            fontSize: '20px', 
            marginTop: '15px', 
            paddingTop: '15px',
            borderTop: '1px solid #eee'
          }}>
            <span>Tổng tiền:</span>
            <span style={{ 
              color: '#ff4d4f',
              fontSize: '24px',
              fontWeight: '700'
            }}>{convertPrice(order?.totalPrice)}</span>
          </PriceTotal>
        </PriceSummary>
      </OrderDetails>
    </WrapperContainer>
  );
};

export default OrderDetailsComponent; 