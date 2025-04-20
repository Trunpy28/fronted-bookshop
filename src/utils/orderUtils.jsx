import { CheckCircleOutlined, ClockCircleOutlined, ShoppingOutlined, CloseCircleOutlined, CheckSquareOutlined, CloseSquareOutlined } from "@ant-design/icons";
import React from "react";

export const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending':
      return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    case 'Shipping':
      return <ShoppingOutlined style={{ color: '#1890ff' }} />;
    case 'Delivered':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'Cancelled':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return <ClockCircleOutlined style={{ color: '#faad14' }} />;
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'Pending':
      return 'Đang chờ xử lý';
    case 'Shipping':
      return 'Đang giao hàng';
    case 'Delivered':
      return 'Đã giao hàng';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return 'Đang chờ xử lý';
  }
};

export const getPaymentMethodText = (method) => {
  switch (method) {
    case 'COD':
      return 'Thanh toán khi nhận hàng';
    case 'VNPAY':
      return 'Thanh toán qua VNPAY';
    case 'PAYPAL':
      return 'Thanh toán qua PayPal';
    default:
      return 'Chưa xác định';
  }
};

export const getPaymentStatusIcon = (status) => {
  switch (status) {
    case 'Completed':
      return <CheckSquareOutlined style={{ color: '#52c41a' }} />;
    case 'Failed':
      return <CloseSquareOutlined style={{ color: '#ff4d4f' }} />;
    case 'Pending':
    default:
      return <ClockCircleOutlined style={{ color: '#faad14' }} />;
  }
};

export const getPaymentStatusText = (status) => {
  switch (status) {
    case 'Completed':
      return 'Đã thanh toán';
    case 'Failed':
      return 'Thanh toán thất bại';
    case 'Pending':
    default:
      return 'Chờ thanh toán';
  }
}; 