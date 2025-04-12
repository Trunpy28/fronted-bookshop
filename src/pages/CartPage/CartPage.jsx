import { Button, ConfigProvider, Input, InputNumber, message, Radio } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import {
  WrapperCountCart,
  WrapperItemCart,
  WrapperLeft,
  WrapperListCart,
  WrapperNameProductCart,
  WrapperRight,
  WrapperStyleHeader,
  WrapperStyleHeaderDelivery,
  WrapperTotal,
  CustomerInfoSection,
} from "./style";
import { DeleteOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { convertPrice } from "../../utils";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import StepComponent from "../../components/StepConponent/StepComponent";
import * as CartService from "../../services/CartService";
import * as ShippingAddressService from "../../services/ShippingAddressService";
import * as VoucherService from "../../services/VoucherService";
import Loading from "../../components/LoadingComponent/Loading";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setCart } from "../../redux/slices/cartSlice";

// Theme chung cho toàn trang
const theme = {
  token: {
    colorPrimary: "#00a551",
    colorPrimaryHover: "#008f45",
    colorPrimaryActive: "#007a3d",
    controlItemBgActive: "#e6f7ee",
    controlItemBgActiveHover: "#d0f0e2"
  },
  components: {
    InputNumber: {
      handleWidth: 30,
      handleBg: "#e6f7ee",
      activeBorderColor: "#00a551",
      hoverBorderColor: "#33b776",
      addonBg: "#e6f7ee"
    },
    Button: {
      defaultBg: "#e6f7ee",
      defaultColor: "#00a551",
      defaultBorderColor: "#99dab9",
      primaryColor: "#fff",
      primaryHoverBg: "#008f45",
      primaryActiveBg: "#007a3d"
    }
  }
};

const CartPage = () => {
  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.user);
  
  const [isAddressListModalOpen, setIsAddressListModalOpen] = useState(false);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucherCode, setAppliedVoucherCode] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const queryClient = useQueryClient();

  const { 
    data: addressData, 
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses
  } = useQuery({
    queryKey: ["shippingAddress", user?.id],
    queryFn: () => ShippingAddressService.getUserAddresses(user?.access_token),
    enabled: !!user?.access_token,
  });

  const { 
    mutate: updateCartMutate, 
    isPending: isPendingUpdate 
  } = useMutation({
    mutationFn: (data) => CartService.updateCartItem(data.productId, data.quantity, user?.access_token),
    onSuccess: (data) => {
      dispatch(setCart(data?.data));
      message.success(data.message);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  });

  const { 
    mutate: removeCartMutate, 
    isPending: isPendingRemove 
  } = useMutation({
    mutationFn: (productId) => CartService.removeFromCart(productId, user?.access_token),
    onSuccess: (data) => {
      dispatch(setCart(data?.data));
      message.success(data.message);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  });

  const priceMemo = useMemo(() => {
    const result = cart?.cartItems?.reduce((total, current) => {
      return total + current?.product?.originalPrice * current?.quantity;
    }, 0);
    return result || 0;
  }, [cart]);

  const { 
    data: voucherData, 
    isLoading: isLoadingVoucher,
    isFetching: isFetchingVoucher,
    refetch: refetchVoucher
  } = useQuery({
    queryKey: ["voucher", appliedVoucherCode],
    queryFn: () => {
      if (!appliedVoucherCode) return null;
      return VoucherService.getVoucherByCode(appliedVoucherCode);
    },
    enabled: !!appliedVoucherCode && !!user?.access_token,
  });

  const discountPrice = useMemo(() => {
    if (!voucherData?.data || priceMemo === undefined || priceMemo === null) return 0;
    
    const voucher = voucherData.data;
    
    // Kiểm tra điều kiện tối thiểu
    if (priceMemo < voucher.minOrderValue) return 0;
    
    // Tính toán giảm giá
    let discount = 0;
    if (voucher.discountType === 'percentage') {
      discount = Math.floor((priceMemo * voucher.discountValue) / 100);
    } else {
      discount = voucher.discountValue;
    }
    
    // Giảm giá không vượt quá giá trị đơn hàng
    return Math.min(discount, priceMemo);
  }, [voucherData, priceMemo]);

  const deliveryPriceMemo = useMemo(() => {
    if (priceMemo > 0 && priceMemo < 200000) {
      return 25000;
    } else if (priceMemo >= 200000 && priceMemo < 500000) {
      return 10000;
    } else if (priceMemo >= 500000) {
      return 0;
    } else {
      return 0;
    }
  }, [priceMemo]);

  const finalPriceMemo = useMemo(() => {
    return Number(priceMemo) - Number(discountPrice) + Number(deliveryPriceMemo);
  }, [priceMemo, discountPrice, deliveryPriceMemo]);

  // Khởi tạo thông tin từ địa chỉ default
  useEffect(() => {
    if (addressData?.addresses?.length > 0) {
      const defaultAddress = addressData.addresses.find(addr => addr.isDefault);
      
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        setName(defaultAddress.fullName);
        setPhone(defaultAddress.phone);
        setCity(defaultAddress.city);
        setDistrict(defaultAddress.district);
        setWard(defaultAddress.ward);
        setDetailedAddress(defaultAddress.detailedAddress);
      }
    }
  }, [addressData]);

  const handleSelectAddress = () => {
    setIsAddressListModalOpen(true);
  };
  
  const handleAddNewAddress = () => {
    navigate("/user/account/address", { state: { prevPath: location.pathname } });
  };
  
  const handleAddressSelection = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handleConfirmAddress = () => {
    const selectedAddress = addressData.addresses.find(addr => addr._id === selectedAddressId);
    
    if (selectedAddress) {
      setName(selectedAddress.fullName);
      setPhone(selectedAddress.phone);
      setCity(selectedAddress.city);
      setDistrict(selectedAddress.district);
      setWard(selectedAddress.ward);
      setDetailedAddress(selectedAddress.detailedAddress);
    }
    
    setIsAddressListModalOpen(false);
  };

  const handleCancelAddress = () => {
    setIsAddressListModalOpen(false);
  };

  const fullAddress = useMemo(() => {
    const parts = [];
    if (detailedAddress) parts.push(detailedAddress);
    if (ward) parts.push(ward);
    if (district) parts.push(district);
    if (city) parts.push(city);
    return parts.join(', ');
  }, [city, district, ward, detailedAddress]);

  const isFormValid = useMemo(() => {
    return name && phone && city && district && ward && detailedAddress;
  }, [name, phone, city, district, ward, detailedAddress]);

  const handleApplyVoucher = () => {
    if (!voucherCode) {
      message.warning("Vui lòng nhập mã giảm giá");
      return;
    }
    
    setAppliedVoucherCode(voucherCode);
    refetchVoucher().then(result => {
      if (result.data) {
        message.success("Áp dụng mã giảm giá thành công");
      }
    }).catch(error => {
      setAppliedVoucherCode("");
      message.error(error?.response?.data?.message || "Mã giảm giá không hợp lệ");
    });
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucherCode("");
    setVoucherCode("");
    queryClient.removeQueries({ queryKey: ["voucher", appliedVoucherCode] });
    message.success("Đã hủy mã giảm giá");
  };

  const handleCheckout = () => {
    if (!cart?.cartItems?.length) {
      message.warning("Giỏ hàng trống!");
      return;
    }
    
    if (!isFormValid) {
      message.warning("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }
    
    const shippingAddress = {
      name,
      phone,
      address: {
        city,
        district,
        ward,
        detailedAddress
      }
    };
    
    navigate("/payment", { 
      state: { 
        shippingAddress,
        voucherCode: appliedVoucherCode || ""
      } 
    });
  };

  const itemsDelivery = [
    {
      title: "25K",
      description: "Dưới 200.000 VND",
    },
    {
      title: "10K",
      description: "Từ 200.000 VND đến dưới 500.000 VND",
    },
    {
      title: "Free ship",
      description: "Trên 500.000 VND",
    },
  ];

  // Check nếu đang trong trạng thái loading
  const isLoading = isPendingUpdate || isPendingRemove || isLoadingAddresses || isLoadingVoucher || isFetchingVoucher;

  return (
    <ConfigProvider theme={theme}>
      <Loading isLoading={isLoading}>
        <div style={{ background: "#f5f5fa", width: "100%", padding: "30px 15vw", position: "relative", minHeight: "80vh" }}>
          <div>
            <h2 style={{ fontWeight: "bold", fontSize: "24px", marginBottom: "20px", color: "#00a551" }}>
              Giỏ hàng
            </h2>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <WrapperLeft>
                <WrapperStyleHeaderDelivery>
                  <StepComponent
                    items={itemsDelivery}
                    current={
                      deliveryPriceMemo === 25000
                        ? 0
                        : deliveryPriceMemo === 10000
                        ? 1
                        : cart?.cartItems?.length === 0
                        ? -1
                        : 2
                    }
                  />
                </WrapperStyleHeaderDelivery>
                <WrapperStyleHeader>
                  <div style={{ width: "45%", fontSize: "18px", fontWeight: "700" }}>
                    Sản phẩm
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "55%",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ width: "25%", textAlign: "left", fontSize: "18px", fontWeight: "700" }}>
                      Đơn giá
                    </div>
                    <div style={{ width: "30%", textAlign: "center", fontSize: "18px", fontWeight: "700" }}>
                      Số lượng
                    </div>
                    <div style={{ width: "30%", textAlign: "left", fontSize: "18px", fontWeight: "700" }}>
                      Thành tiền
                    </div>
                    <div style={{ width: "10%", textAlign: "center", fontSize: "18px", fontWeight: "700" }}>
                      Xóa
                    </div>
                  </div>
                </WrapperStyleHeader>
                <WrapperListCart>
                  {cart?.cartItems?.length > 0 ? (
                    cart.cartItems.map((item) => (
                      <WrapperItemCart key={item?.product?._id}>
                        <div style={{ 
                          width: "45%", 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "12px" 
                        }}>
                          <img
                            src={item?.product?.images[0]}
                            alt={item?.product?.name}
                            style={{ 
                              width: "80px", 
                              height: "112px", 
                              objectFit: "cover", 
                              border: "1px solid #e0e0e0", 
                              borderRadius: "4px",
                              cursor: "pointer",
                              transition: "transform 0.2s"
                            }}
                            onClick={() => navigate(`/product-details/${item?.product?._id}`)}
                            onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                            onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                          />
                          <WrapperNameProductCart 
                            onClick={() => navigate(`/product-details/${item?.product?._id}`)}
                            style={{ 
                              cursor: "pointer",
                              transition: "color 0.2s"
                            }}
                            onMouseOver={(e) => e.target.style.color = "#00a551"}
                            onMouseOut={(e) => e.target.style.color = ""}
                          >
                            {item?.product?.name}
                          </WrapperNameProductCart>
                        </div>
                        <div style={{ 
                          width: "55%", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between" 
                        }}>
                          <div style={{ 
                            width: "25%", 
                            textAlign: "left", 
                            fontWeight: "700", 
                            color: "#ff0000",
                            fontSize: "18px" 
                          }}>
                            {convertPrice(item?.product?.originalPrice)}
                          </div>
                          <WrapperCountCart>
                            <InputNumber
                              min={1}
                              max={item?.product?.countInStock}
                              value={item?.quantity}
                              onChange={(value) => {
                                if (value && value > 0) {
                                  updateCartMutate({ productId: item?.product?._id, quantity: value });
                                }
                              }}
                              style={{ width: "90px", height: "36px", fontSize: "16px" }}
                              controls
                            />
                          </WrapperCountCart>
                          <div style={{ 
                            width: "30%", 
                            textAlign: "left", 
                            fontWeight: "700", 
                            color: "#ff0000",
                            fontSize: "18px" 
                          }}>
                            {convertPrice(item?.product?.originalPrice * item?.quantity)}
                          </div>
                          <div style={{ 
                            width: "10%", 
                            textAlign: "center",
                            display: "flex",
                            justifyContent: "center"
                          }}>
                            <DeleteOutlined
                              style={{ 
                                color: "#ff0000", 
                                cursor: "pointer", 
                                fontSize: "20px"
                              }}
                              onClick={() => removeCartMutate(item?.product?._id)}
                            />
                          </div>
                        </div>
                      </WrapperItemCart>
                    ))
                  ) : (
                    <div style={{
                      padding: "20px",
                      textAlign: "center",
                      fontSize: "16px",
                      color: "#777777",
                      backgroundColor: "#ffffff"
                    }}>
                      Giỏ hàng trống
                    </div>
                  )}
                </WrapperListCart>
              </WrapperLeft>
              <WrapperRight>
                <div style={{ width: "100%" }}>
                  <CustomerInfoSection>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      marginBottom: "15px"
                    }}>
                      <h3 style={{ 
                        color: "#00a551", 
                        fontSize: "18px", 
                        fontWeight: "600", 
                        margin: "0" 
                      }}>Thông tin nhận hàng</h3>
                      <div>
                        <Button 
                          type="link" 
                          icon={<EnvironmentOutlined />} 
                          onClick={handleSelectAddress}
                          style={{ 
                            padding: "0", 
                            height: "auto", 
                            color: "#00a551"
                          }}
                        >
                          Chọn địa chỉ
                        </Button>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: "5px" }}>
                      <div style={{ marginBottom: "8px", fontSize: "14px", lineHeight: "1.4" }}>
                        <strong style={{ display: "inline-block", minWidth: "120px", textAlign: "left" }}>Họ tên:</strong> 
                        <span>{name || "Chưa có thông tin"}</span>
                      </div>
                      <div style={{ marginBottom: "8px", fontSize: "14px", lineHeight: "1.4" }}>
                        <strong style={{ display: "inline-block", minWidth: "120px", textAlign: "left" }}>Số điện thoại:</strong> 
                        <span>{phone || "Chưa có thông tin"}</span>
                      </div>
                      <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                        <strong style={{ display: "inline-block", minWidth: "120px", textAlign: "left", verticalAlign: "top" }}>Địa chỉ:</strong> 
                        <span style={{ display: "inline-block", width: "calc(100% - 125px)" }}>{fullAddress || "Chưa có địa chỉ"}</span>
                      </div>
                    </div>
                  </CustomerInfoSection>

                  {/* Voucher section */}
                  <div style={{ 
                    marginBottom: "20px", 
                    padding: "15px", 
                    backgroundColor: "#fff", 
                    borderRadius: "8px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "10px", 
                      marginBottom: "5px" 
                    }}>
                      <Input
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="Nhập mã giảm giá"
                        style={{ 
                          flex: 1,
                          borderColor: "#e0e0e0"
                        }}
                        disabled={!!appliedVoucherCode}
                      />
                      {!appliedVoucherCode ? (
                        <Button
                          type="primary"
                          onClick={handleApplyVoucher}
                          loading={isLoadingVoucher || isFetchingVoucher}
                          style={{ 
                            backgroundColor: "#00a551",
                            height: "36px",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}
                        >
                          Áp dụng
                        </Button>
                      ) : (
                        <Button
                          danger
                          onClick={handleRemoveVoucher}
                          style={{ 
                            height: "36px",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}
                        >
                          Hủy
                        </Button>
                      )}
                    </div>
                    {appliedVoucherCode && discountPrice > 0 && (
                      <div style={{ 
                        marginTop: "8px", 
                        fontSize: "13px", 
                        color: "#00a551"
                      }}>
                        Áp dụng mã "{appliedVoucherCode}" thành công!
                      </div>
                    )}
                    {appliedVoucherCode && discountPrice === 0 && (
                      <div style={{ 
                        marginTop: "8px", 
                        fontSize: "13px", 
                        color: "#ff4d4f"
                      }}>
                        Đơn hàng không đủ điều kiện áp dụng mã này.
                      </div>
                    )}
                  </div>

                  <WrapperTotal>
                    <span style={{ fontSize: "16px" }}>Tạm tính</span>
                    <span style={{ fontSize: "16px", fontWeight: "700" }}>{convertPrice(priceMemo)}</span>
                  </WrapperTotal>
                  {discountPrice > 0 && (
                    <WrapperTotal>
                      <span style={{ fontSize: "16px", color: "#00a551" }}>Giảm giá</span>
                      <span style={{ fontSize: "16px", fontWeight: "700", color: "#00a551" }}>
                        -{convertPrice(discountPrice)}
                      </span>
                    </WrapperTotal>
                  )}
                  <WrapperTotal>
                    <span style={{ fontSize: "16px" }}>Phí vận chuyển</span>
                    <span style={{ fontSize: "16px", fontWeight: "700" }}>{convertPrice(deliveryPriceMemo)}</span>
                  </WrapperTotal>
                  <WrapperTotal>
                    <span style={{ fontSize: "18px", fontWeight: "600" }}>Tổng tiền</span>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#ff0000" }}>
                      {convertPrice(finalPriceMemo)}
                    </span>
                  </WrapperTotal>
                  <Button
                    type="primary"
                    size="large"
                    block
                    style={{
                      height: "48px",
                      marginTop: "20px",
                      marginBottom: "20px",
                      fontSize: "16px",
                      fontWeight: "700",
                      backgroundColor: "#00a551",
                      border: "none"
                    }}
                    onClick={handleCheckout}
                    disabled={!cart?.cartItems?.length}
                  >
                    Đặt hàng
                  </Button>
                </div>
              </WrapperRight>
            </div>
          </div>
          <ModalComponent
            title="Chọn địa chỉ giao hàng"
            open={isAddressListModalOpen}
            onCancel={handleCancelAddress}
            onOk={handleConfirmAddress}
            textButtonOk="Xác nhận"
            textButtonCancel="Hủy"
            width={700}
          >
            <Radio.Group 
              onChange={(e) => handleAddressSelection(e.target.value)} 
              value={selectedAddressId}
              style={{ width: '100%' }}
            >
              {addressData?.addresses?.length > 0 ? (
                addressData.addresses.map((address) => (
                  <Radio
                    key={address._id}
                    value={address._id}
                    style={{
                      display: 'block',
                      marginBottom: '10px',
                      padding: '10px',
                      border: '1px solid #e8e8e8',
                      borderRadius: '8px',
                      width: '100%'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {address.fullName} 
                        {address.isDefault && (
                          <span style={{ 
                            marginLeft: '10px', 
                            fontSize: '12px', 
                            backgroundColor: '#00a551', 
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            Mặc định
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#666' }}>{address.phone}</div>
                      <div>
                        {address.detailedAddress}, {address.ward}, {address.district}, {address.city}
                      </div>
                    </div>
                  </Radio>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ fontSize: '16px', color: '#777777' }}>Bạn chưa có địa chỉ nào.</p>
                </div>
              )}
            </Radio.Group>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <Button
                type="primary"
                onClick={() => {
                  setIsAddressListModalOpen(false);
                  handleAddNewAddress();
                }}
              >
                Thêm địa chỉ mới
              </Button>
            </div>
          </ModalComponent>
        </div>
      </Loading>
    </ConfigProvider>
  );
};

export default CartPage; 