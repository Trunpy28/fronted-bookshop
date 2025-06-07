import {
  Col,
  Image,
  Row,
  Rate,
  InputNumber,
  Button,
  ConfigProvider,
  message,
  Form,
  Input,
  Popconfirm,
  theme,
} from "antd";
import {
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import * as ProductService from "../../services/ProductService";
import * as ReviewService from "../../services/ReviewService";
import * as CartService from "../../services/CartService";
import { useQuery, useMutation } from "@tanstack/react-query";
import Loading from "../LoadingComponent/Loading";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setCart } from "../../redux/slices/cartSlice";
import { convertPrice } from "../../utils/utils";
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';
import CardComponent from "../CardComponent/CardComponent";

const { TextArea } = Input;

// Cấu hình theme toàn cục
const globalTheme = {
  token: {
    colorPrimary: '#00A651',
  },
};

const ProductDetailsComponent = ({ productId }) => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [userReview, setUserReview] = useState(null);

  // Fetch product details
  const { isPending, data: productDetails, refetch: refetchProductDetails } = useQuery({
    queryKey: ["products-details", productId],
    queryFn: () => ProductService.getDetailsProduct(productId),
    enabled: !!productId,
  });

  // Fetch reviews
  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => ReviewService.getReviewsByProductId(productId),
    enabled: !!productId,
  });

  // Fetch similar products
  const { data: similarProducts, isLoading: isLoadingSimilar } = useQuery({
    queryKey: ["similar-products", productId],
    queryFn: () => ProductService.getSimilarProducts(productId, 20),
    enabled: !!productId,
  });

  useEffect(() => {
    if (reviewsData?.data) {
      const userRev = reviewsData.find(r => r.user._id === user?.id);
      setUserReview(userRev);
    }
  }, [reviewsData, user]);

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: (data) => ReviewService.createReview(productId,data, user?.access_token),
    onSuccess: () => {
      message.success("Đánh giá thành công!");
      form.resetFields();
      refetchReviews();
      refetchProductDetails();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Đánh giá thất bại!");
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => ReviewService.deleteReview(reviewId, user?.access_token),
    onSuccess: () => {
      message.success("Xóa đánh giá thành công!");
      refetchReviews();
      refetchProductDetails();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Xóa đánh giá thất bại!");
    },
  });

  const handleAddReview = async (values) => {
    if (!user?.id && !user?.access_token) {
      navigate("/sign-in", { state: location?.pathname });
      return;
    }
    addReviewMutation.mutate({
      productId: productId,
      ...values
    });
  };

  const handleDeleteReview = (reviewId) => {
    deleteReviewMutation.mutate(reviewId);
  };

  const onIncreaseQuantity = () => {
    if (quantity < productDetails?.data?.countInStock) setQuantity(quantity + 1);
  };

  const onDecreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const addToCartMutation = useMutation({
    mutationFn: () => CartService.addToCart(productDetails?.data?._id, quantity, user?.access_token),
    onSuccess: (data) => {   
      message.success("Thêm vào giỏ hàng thành công!");
      dispatch(setCart({ cartItems: data.data.cartItems }));
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Thêm vào giỏ hàng thất bại!");
    },
  });

  const handleAddToCart = () => {
    if (!user?.id) {
      navigate("/sign-in", { state: location?.pathname });
    } else {
      addToCartMutation.mutate();
    }
  };

  return (
    <ConfigProvider theme={globalTheme}>
      <Loading isLoading={isPending}>
        <div className="bg-white p-16 text-base">
          <Row gutter={[48, 32]}>
            <Col span={8}>
              <div>
                <div className="flex flex-col items-center">
                  <div className="w-full aspect-[3/4] mb-4 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                    <Image
                      src={productDetails?.data?.images[selectedImage]}
                      alt={productDetails?.data?.name}
                      className="max-w-full max-h-full object-contain"
                      preview={true}
                    />
                  </div>
                  <div className="flex gap-3 overflow-x-auto w-full py-2">
                    {productDetails?.data?.images.map((image, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer border-2 ${
                          selectedImage === index ? 'border-green-600' : 'border-gray-200'
                        } rounded-lg overflow-hidden w-20 h-28 flex-shrink-0 transition-all hover:border-green-400 flex items-center justify-center`}
                        onClick={() => setSelectedImage(index)}
                        style={{ width: "80px", height: "110px" }}
                      >
                        <Image
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="max-w-full max-h-full object-contain"
                          preview={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Col>

            <Col span={16}>
              <div>
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                  {productDetails?.data?.name}
                </h1>
                
                <div className="flex items-center gap-4 mt-6">
                  <span className="text-4xl font-semibold">{productDetails?.data?.rating?.avgRating.toFixed(1)}</span>
                  <Rate 
                    disabled 
                    allowHalf 
                    value={productDetails?.data?.rating?.avgRating} 
                    className="text-3xl"
                  />
                  <span className="text-gray-500 ml-2 text-2xl">
                    ({productDetails?.data?.rating?.totalReviews} đánh giá) | Đã bán {productDetails?.data?.selled || 0}
                  </span>
                </div>

                <div className="mt-8">
                  <div className="grid grid-cols-2 gap-8 text-2xl">
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <span className="text-gray-500">Mã sản phẩm:</span>
                        <span className="font-medium">{productDetails?.data?.productCode}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-500">Thể loại:</span>
                        <span className="font-medium">{productDetails?.data?.genre.name}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-500">Tác giả:</span>
                        <span className="font-medium">{productDetails?.data?.author}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-500">Nhà xuất bản:</span>
                        <span>{productDetails?.data?.publisher}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-500">Năm xuất bản:</span>
                        <span>{productDetails?.data?.publicationYear}</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <span className="text-gray-500">Kích thước:</span>
                        <span>{productDetails?.data?.dimensions}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-500">Trọng lượng:</span>
                        <span>{productDetails?.data?.weight}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-500">Hình thức:</span>
                        <span>{productDetails?.data?.format}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-500">Số trang:</span>
                        <span>{productDetails?.data?.pageCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 p-8 bg-gray-50 rounded-xl">
                  <div className="flex items-baseline gap-6">
                    <span className="text-green-600 text-5xl font-bold">
                      {convertPrice(productDetails?.data?.originalPrice)}
                    </span>
                  </div>

                  <div className="mt-8 flex items-center gap-6">
                    <span className="text-gray-600 text-2xl">Tình trạng:</span>
                    {productDetails?.data?.countInStock > 0 ? (
                      <span className="text-green-600 font-medium text-2xl">Còn hàng ({productDetails?.data?.countInStock})</span>
                    ) : (
                      <span className="text-red-600 font-medium text-2xl">Hết hàng</span>
                    )}
                  </div>

                  <div className="mt-8 flex items-center gap-8">
                    <span className="text-gray-600 text-2xl">Số lượng:</span>
                    <div className="flex items-center">
                      <Button
                        icon={<MinusOutlined className="text-2xl" />}
                        onClick={onDecreaseQuantity}
                        disabled={quantity < 2}
                        size="large"
                        className="flex items-center justify-center h-14 w-14"
                      />
                      <InputNumber
                        min={1}
                        max={productDetails?.data?.countInStock}
                        value={quantity}
                        controls={false}
                        onChange={(value) => setQuantity(value)}
                        className="w-[120px] mx-3 text-2xl"
                        size="large"
                      />
                      <Button
                        icon={<PlusOutlined className="text-2xl" />}
                        onClick={onIncreaseQuantity}
                        disabled={quantity >= productDetails?.data?.countInStock}
                        size="large"
                        className="flex items-center justify-center h-14 w-14"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined className="text-3xl" />}
                  onClick={handleAddToCart}
                  disabled={productDetails?.data?.countInStock <= 0}
                  className="mt-8 h-20 text-2xl w-full flex items-center justify-center gap-4 font-medium"
                >
                  Thêm vào giỏ hàng
                </Button>
              </div>
            </Col>
          </Row>

          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">Thông tin sản phẩm</h2>
            <div 
              className="bg-gray-50 p-8 rounded-xl mt-8 text-2xl leading-relaxed"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(productDetails?.data?.description) }}
            />
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">Đánh giá sản phẩm</h2>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              {!user?.id && !user?.access_token ? (
                <div className="text-center">
                  <p className="text-2xl text-gray-600 mb-4">Chỉ có thành viên mới có thể viết nhận xét.</p>
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      type="primary" 
                      size="large" 
                      className="text-2xl px-8"
                      onClick={() => navigate("/sign-in", { state: location?.pathname })}
                    >
                      Đăng nhập
                    </Button>
                    <span className="text-2xl text-gray-500">hoặc</span>
                    <Button 
                      size="large" 
                      className="text-2xl px-8"
                      onClick={() => navigate("/sign-up", { state: location?.pathname })}
                    >
                      Đăng ký
                    </Button>
                  </div>
                </div>
              ) : !userReview && (
                <div className="mb-8">
                  <Form
                    form={form}
                    onFinish={handleAddReview}
                    layout="vertical"
                    size="large"
                  >
                    <Form.Item
                      name="rating"
                      rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
                    >
                      <Rate className="text-3xl" />
                    </Form.Item>
                    <Form.Item
                      name="comment"
                      rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá!' }]}
                    >
                      <TextArea 
                        rows={4} 
                        placeholder="Nhập đánh giá của bạn..."
                        className="text-2xl"
                      />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={addReviewMutation.isPending} size="large" className="text-2xl">
                      Gửi đánh giá
                    </Button>
                  </Form>
                </div>
              )}

              <div className="space-y-6">
                {reviewsData?.length > 0 ? (
                  reviewsData.map((review) => (
                    <div key={review._id} className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-2xl">{review.user.name}</div>
                          <Rate disabled value={review.rating} className="text-2xl" />
                          <div className="text-gray-500 mt-2 text-xl">
                            {dayjs(review.createdAt).format('DD/MM/YYYY HH:mm')}
                          </div>
                        </div>
                        {user?.id === review.user._id && (
                          <Popconfirm
                            title="Xóa đánh giá"
                            description="Bạn có chắc chắn muốn xóa đánh giá này?"
                            onConfirm={() => handleDeleteReview(review._id)}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <Button 
                              type="text" 
                              icon={<DeleteOutlined className="text-2xl" />} 
                              danger
                              size="large"
                            />
                          </Popconfirm>
                        )}
                      </div>
                      <div className="mt-4 text-2xl">{review.comment}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 text-2xl">
                    Chưa có đánh giá nào cho sản phẩm này
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Phần sản phẩm tương tự */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-3xl font-bold mb-6">Sản phẩm tương tự</h2>
            <Loading isLoading={isLoadingSimilar}>
              {similarProducts?.products?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {similarProducts.products.map((product) => (
                    <CardComponent
                      key={product.id}
                      images={product.images || []}
                      name={product.name}
                      originalPrice={product.price}
                      rating={product.rating ? {avgRating: product.rating} : undefined}
                      selled={product.selled}
                      _id={product.id}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Không tìm thấy sản phẩm tương tự</p>
              )}
            </Loading>
          </div>
        </div>
      </Loading>
    </ConfigProvider>
  );
};

export default ProductDetailsComponent;
