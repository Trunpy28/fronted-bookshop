import React, { useState } from "react";
import { Modal, Typography, Tag, Image, Row, Col, Rate } from "antd";
import { convertPrice } from "../../utils";
import {
  WrapperContainer,
  WrapperItemOrder,
  WrapperHeaderItem,
  ImageContainer,
  ProductInfo,
  WrapperLabel,
  WrapperValue,
  DescriptionWrapper,
} from "./style";

const { Title, Paragraph } = Typography;

const ProductDetailModal = ({ product, visible, onClose, genres }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!product) return null;

  const productGenre = genres?.data?.find(g => g._id === product.genre);

  return (
    <Modal
      title={
        <Title level={3} style={{ margin: 0, padding: "12px 0" }}>
          Chi tiết sản phẩm
        </Title>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
      style={{ top: 20 }}
    >
      <WrapperContainer>
        <WrapperItemOrder>
          <WrapperHeaderItem>
            <ImageContainer>
              <div className="w-full mb-4 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={product.images?.[selectedImage]}
                  alt={product.name}
                  preview={true}
                  style={{
                    width: "240px",
                    height: "330px",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div className="flex gap-3 overflow-x-auto w-full py-2">
                {product.images?.map((image, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer border-2 ${
                      selectedImage === index
                        ? "border-green-600"
                        : "border-gray-200"
                    } rounded-lg overflow-hidden flex-shrink-0 transition-all hover:border-green-400 flex items-center justify-center`}
                    onClick={() => setSelectedImage(index)}
                    style={{ width: "80px", height: "110px" }}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Ảnh ${index + 1}`}
                      preview={false}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ))}
              </div>
            </ImageContainer>
            
            <ProductInfo>
              <Title
                level={3}
                style={{ marginBottom: "16px", color: "#CD3238" }}
              >
                {product.name}
              </Title>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {product.rating?.avgRating ? product.rating.avgRating.toFixed(1) : "0"}
                </span>
                <Rate 
                  disabled 
                  allowHalf 
                  value={product.rating?.avgRating || 0} 
                />
                <span style={{ color: "#666" }}>
                  ({product.rating?.totalReviews || 0} đánh giá)
                </span>
              </div>

              <div>
                <WrapperLabel>Giá bìa: </WrapperLabel>
                <WrapperValue
                  style={{
                    color: "#CD3238",
                    fontSize: "22px",
                    fontWeight: "700",
                  }}
                >
                  {convertPrice(product.originalPrice)}
                </WrapperValue>
              </div>

              <Row gutter={20} style={{ marginTop: "20px" }}>
                <Col span={12}>
                  <div>
                    <WrapperLabel>Mã sản phẩm: </WrapperLabel>
                    <WrapperValue>{product.productCode}</WrapperValue>
                  </div>
                  
                  <div style={{ marginTop: "10px" }}>
                    <WrapperLabel>Tác giả: </WrapperLabel>
                    <WrapperValue>{product.author}</WrapperValue>
                  </div>
                  
                  <div style={{ marginTop: "10px" }}>
                    <WrapperLabel>Nhà xuất bản: </WrapperLabel>
                    <WrapperValue>{product.publisher}</WrapperValue>
                  </div>
                  
                  <div style={{ marginTop: "10px" }}>
                    <WrapperLabel>Thể loại: </WrapperLabel>
                    <Tag
                      color="blue"
                      style={{ fontSize: "14px", padding: "2px 8px" }}
                    >
                      {productGenre?.name || ''}
                    </Tag>
                  </div>
                  
                  <div style={{ marginTop: "10px" }}>
                    <WrapperLabel>Năm xuất bản: </WrapperLabel>
                    <WrapperValue>{product.publicationYear}</WrapperValue>
                  </div>
                </Col>
                
                <Col span={12}>
                  <div>
                    <WrapperLabel>Số trang: </WrapperLabel>
                    <WrapperValue>{product.pageCount}</WrapperValue>
                  </div>
                  
                  <div style={{ marginTop: "10px" }}>
                    <WrapperLabel>Hình thức: </WrapperLabel>
                    <WrapperValue>{product.format || "Bìa mềm"}</WrapperValue>
                  </div>
                  
                  <div style={{ marginTop: "10px" }}>
                    <WrapperLabel>Trọng lượng: </WrapperLabel>
                    <WrapperValue>{product.weight || "Chưa cập nhật"}</WrapperValue>
                  </div>
                  
                  <div style={{ marginTop: "10px" }}>
                    <WrapperLabel>Kích thước: </WrapperLabel>
                    <WrapperValue>{product.dimensions || "Chưa cập nhật"}</WrapperValue>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <WrapperLabel>Đã bán: </WrapperLabel>
                    <WrapperValue>{product.selled || 0}</WrapperValue>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <WrapperLabel>Số lượng kho: </WrapperLabel>
                    <WrapperValue>{product.countInStock}</WrapperValue>
                  </div>
                </Col>
              </Row>
            </ProductInfo>
          </WrapperHeaderItem>

          <DescriptionWrapper>
            <WrapperLabel
              style={{
                display: "block",
                marginBottom: "12px",
                fontSize: "18px",
              }}
            >
              Mô tả:{" "}
            </WrapperLabel>
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </DescriptionWrapper>
        </WrapperItemOrder>
      </WrapperContainer>
    </Modal>
  );
};

export default ProductDetailModal;
