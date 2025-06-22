import React from "react";
import { Card, Button, ConfigProvider, theme } from "antd";
import { StarFilled, ShoppingOutlined } from "@ant-design/icons";
import {
  StyledNameProduct,
  WrapperPriceText,
  WrapperReportText,
  StyledCard
} from "./style";
import { useNavigate } from "react-router-dom";
import { convertPrice } from "../../utils/utils";

const CardComponent = (props) => {
  const { images, name, originalPrice, rating, selled, _id } = props;
  const navigate = useNavigate();
  const handleDetailsProduct = (id) => {
    navigate(`/product-details/${id}`);
  };

  return (
    <StyledCard
      hoverable
      style={{
        width: "100%",
        maxWidth: "200px",
        cursor: "default",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
      cover={
        <div
          style={{
            height: "230px",
            width: "200px",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            paddingTop: "20px",
            position: "relative",
            overflow: "hidden",
          }}
          onClick={() => handleDetailsProduct(_id)}
        >
          <img
            alt="Ảnh sản phẩm"
            src={images && images.length > 0 ? images[0] : ''}
            style={{
              height: "210px",
              width: "160px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.5s ease",
            }}
            onMouseOver={(e) => {e.currentTarget.style.transform = "scale(1.05)"}}
            onMouseOut={(e) => {e.currentTarget.style.transform = "scale(1)"}}
          />
        </div>
      }
    >
      <StyledNameProduct onClick={() => handleDetailsProduct(_id)}>
        {name}
      </StyledNameProduct>
      <WrapperReportText>
        <span>
          <span style={{fontWeight: "bold"}}>
            {rating && rating.avgRating ? rating.avgRating.toFixed(1) : "0.0"}{" "}
            <StarFilled style={{ fontSize: "14px", color: "#FFC70D" }} />{" "}
          </span>
        </span>
        <span>| Đã bán {selled || 0}</span>
      </WrapperReportText>
      <WrapperPriceText>
        {convertPrice(originalPrice)}
      </WrapperPriceText>
    </StyledCard>
  );
};

export default CardComponent;
