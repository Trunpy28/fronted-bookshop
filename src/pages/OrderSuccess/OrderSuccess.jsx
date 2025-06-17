import React from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Loading from "../../components/LoadingComponent/Loading";
import { CheckCircleOutlined } from "@ant-design/icons";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import OrderDetailsComponent from "../../components/OrderDetailsComponent/OrderDetailsComponent";
import { SuccessIcon, ActionButtons } from "./style";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import * as OrderService from "../../services/OrderService";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, ] = useSearchParams();
  const user = useSelector((state) => state.user);
  const { state } = location;
  let order = state?.order;
  const orderId = searchParams.get("orderId");

  const { data: orderData, isFetching } = useQuery({
    queryKey: ["order-success", orderId],
    queryFn: () => OrderService.getDetailsOrder(orderId, user?.access_token),
    enabled: !!orderId && !!user?.access_token,
  });
  
  return (
    <div style={{ background: "#f5f5fa", width: "100%", padding: "30px 15vw" }}>
      <Loading isLoading={isFetching}>
        <SuccessIcon>
          <CheckCircleOutlined style={{ fontSize: "80px", color: "#52c41a" }} />
          <h2 style={{ fontSize: "28px", margin: "15px 0 10px" }}>
            Đặt hàng thành công!
          </h2>
        </SuccessIcon>

        <OrderDetailsComponent order={order ? order : orderData?.data} />

        <ActionButtons style={{ marginTop: "30px", gap: "20px" }}>
          <ButtonComponent
            onClick={() => navigate("/")}
            size={40}
            styleButton={{
              background: "#fff",
              height: "48px",
              width: "240px",
              border: "1px solid #00a551",
              borderRadius: "4px",
              transition: "all 0.3s",
            }}
            textbutton="Tiếp tục mua sắm"
            styleTextButton={{
              color: "#00a551",
              fontSize: "16px",
              fontWeight: "600",
            }}
          />
          <ButtonComponent
            onClick={() => navigate("/my-order")}
            size={40}
            styleButton={{
              background: "#00a551",
              height: "48px",
              width: "240px",
              border: "none",
              borderRadius: "4px",
              transition: "all 0.3s",
            }}
            textbutton="Xem đơn hàng của tôi"
            styleTextButton={{
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
            }}
          />
        </ActionButtons>
      </Loading>
    </div>
  );
};

export default OrderSuccess;
