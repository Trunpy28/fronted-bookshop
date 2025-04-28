import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as OrderService from "../../services/OrderService";
import { WrapperContainer, ErrorContainer } from "./style";
import OrderDetailsComponent from "../../components/OrderDetailsComponent/OrderDetailsComponent";
import Loading from "../../components/LoadingComponent/Loading";
import { CloseCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { Button, message, Modal, Image, Space, Form, Input } from "antd";
import { convertPrice } from "../../utils";
import QRCodeImage from "../../assets/images/QRCode.jpg";
import { QRCodeWrapper, PaymentInstructions } from "../PaymentPage/style";

const { TextArea } = Input;

const DetailOrderPage = () => {
	const user = useSelector((state) => state.user);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [form] = Form.useForm();

  const { data: orderData, isPending, error, refetch } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => OrderService.getDetailsOrder(orderId, user?.access_token),
    enabled: !!orderId && !!user?.access_token
  });
  
  const cancelOrderMutation = useMutation({
    mutationFn: (data) => OrderService.cancelOrder(data.orderId, data.token, data.reason),
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      form.resetFields();
      message.success("Hủy đơn hàng thành công");
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Hủy đơn hàng thất bại");
    }
  });

  const handleConfirmCancel = () => {
    form.validateFields()
      .then(values => {
        cancelOrderMutation.mutate({
          orderId,
          token: user?.access_token,
          reason: values.cancelReason
        });
      })
      .catch(info => {
        message.error("Lý do hủy đơn hàng không được để trống");
      });
  };

  const handleShowPaymentQR = () => {
    setShowQRModal(true);
  };
  
  if (isPending) {
    return <Loading />;
  }
	
  if (error || !orderData?.data) {
    return (
      <WrapperContainer>
        <ErrorContainer>
          <CloseCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />
          <h2>Đơn hàng không tồn tại</h2>
          <p>Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button onClick={() => navigate("/my-order")}>Quay lại danh sách đơn hàng</button>
        </ErrorContainer>
      </WrapperContainer>
    );
  }

  const showCancelButton = orderData?.data?.status === 'Pending';
  const showPaymentButton = orderData?.data?.payment?.status !== 'Completed' &&
                            orderData?.data?.status !== 'Cancelled';

  return (
    <WrapperContainer>
      <OrderDetailsComponent order={orderData.data} />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px',
        marginTop: '20px' 
      }}>
        {showPaymentButton && (
          <Button 
            type="primary" 
            size="large"
            onClick={handleShowPaymentQR}
            style={{ background: '#00a551' }}
          >
            Thanh toán đơn hàng
          </Button>
        )}
        
        {showCancelButton && (
          <Button 
            type="primary" 
            danger
            size="large"
            onClick={() => setIsModalOpen(true)}
          >
            Hủy đơn hàng
          </Button>
        )}
      </div>

      <Modal
        title="Xác nhận hủy đơn hàng"
        open={isModalOpen}
        onOk={handleConfirmCancel}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="Đồng ý"
        cancelText="Hủy"
        confirmLoading={cancelOrderMutation.isPending}
      >
        <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
        <p>Lưu ý: Đơn hàng đã hủy không thể khôi phục.</p>
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="cancelReason"
            label="Lý do hủy đơn hàng:"
            rules={[
              { required: true, message: 'Vui lòng nhập lý do hủy đơn hàng!' },
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này"
            />
          </Form.Item>
        </Form>
      </Modal>

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
            <p><strong>Số tiền:</strong> {convertPrice(orderData?.data?.totalPrice)}</p>
            <p><strong>Người nhận:</strong> Phạm Tuấn Trung</p>
            <p><strong>Số điện thoại:</strong> 0975853235</p>
            <p><strong>Nội dung chuyển khoản:</strong> {`${orderData?.data?.fullName}-${orderData?.data?.phone} Thanh toan don hang ${orderData?.data?._id.slice(-8)}`}</p>
            <div className="payment-note">
              <InfoCircleOutlined /> <strong>Lưu ý:</strong> Sau khi chuyển khoản, vui lòng gửi ảnh chụp màn hình xác nhận qua Zalo: <strong>0975853235</strong> (Phạm Tuấn Trung)
            </div>
          </PaymentInstructions>
        </QRCodeWrapper>
      </Modal>
    </WrapperContainer>
  );
};

export default DetailOrderPage; 