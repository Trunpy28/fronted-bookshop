import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as OrderService from "../../services/OrderService";
import { WrapperContainer, ErrorContainer } from "./style";
import OrderDetailsComponent from "../../components/OrderDetailsComponent/OrderDetailsComponent";
import Loading from "../../components/LoadingComponent/Loading";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { Button, message, Modal } from "antd";

const DetailOrderPage = () => {
	const user = useSelector((state) => state.user);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: orderData, isPending, error, refetch } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => OrderService.getDetailsOrder(orderId, user?.access_token),
    enabled: !!orderId && !!user?.access_token
  });
  
  const cancelOrderMutation = useMutation({
    mutationFn: () => OrderService.cancelOrder(orderId, user?.access_token),
    onSuccess: () => {
      message.success("Hủy đơn hàng thành công");
      setIsModalOpen(false);
      refetch();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Hủy đơn hàng thất bại");
      setIsModalOpen(false);
    }
  });

  const handleCancelOrder = () => {
    setIsModalOpen(true);
  };

  const handleConfirmCancel = () => {
    cancelOrderMutation.mutate();
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

  return (
    <WrapperContainer>
      <OrderDetailsComponent order={orderData.data} />
      
      {showCancelButton && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '20px' 
        }}>
          <Button 
            type="primary" 
            danger
            size="large"
            onClick={handleCancelOrder}
          >
            Hủy đơn hàng
          </Button>
        </div>
      )}

      <Modal
        title="Xác nhận hủy đơn hàng"
        open={isModalOpen}
        onOk={handleConfirmCancel}
        onCancel={() => setIsModalOpen(false)}
        okText="Đồng ý"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
        <p>Lưu ý: Đơn hàng đã hủy không thể khôi phục.</p>
      </Modal>
    </WrapperContainer>
  );
};

export default DetailOrderPage; 