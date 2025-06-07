import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getUserAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress 
} from "../../services/ShippingAddressService";
import { 
  Card, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  ConfigProvider, 
  Typography, 
  Divider, 
  Space, 
  Tooltip,
  Badge,
  message,
  Spin
} from "antd";
import { 
  ArrowLeftOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined,
  ExclamationCircleFilled 
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import addressVietNam from "../../constants/addressConstants";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const ShippingAddressPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Thêm địa chỉ mới");
  const [editingAddress, setEditingAddress] = useState(null);
  const [form] = Form.useForm();
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [addressType, setAddressType] = useState("home");
  
  // Lấy thông tin prev path từ location state hoặc sử dụng giá trị mặc định
  const prevPath = location.state?.prevPath;
  
  // Xử lý navigation quay lại trang trước đó
  const handleGoBack = () => {
    if (location.state?.prevPath) {
      navigate(prevPath);
    } else {
      navigate(-1); // Quay lại trang trước đó trong lịch sử nếu không có prevPath
    }
  };

  const { data: addressData, isLoading } = useQuery({
    queryKey: ["shippingAddress", user?.id],
    queryFn: () => getUserAddresses(user?.access_token),
    enabled: !!user?.access_token,
  });

  const addAddressMutation = useMutation({
    mutationFn: (data) => addAddress(data, user?.access_token),
    onSuccess: () => {
      message.success("Thêm địa chỉ thành công");
      queryClient.invalidateQueries(["shippingAddress", user?.id]);
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Thêm địa chỉ thất bại");
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: (data) => updateAddress(data.addressId, data.addressData, user?.access_token),
    onSuccess: () => {
      message.success("Cập nhật địa chỉ thành công");
      queryClient.invalidateQueries(["shippingAddress", user?.id]);
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Cập nhật địa chỉ thất bại");
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId) => deleteAddress(addressId, user?.access_token),
    onSuccess: () => {
      message.success("Xóa địa chỉ thành công");
      queryClient.invalidateQueries(["shippingAddress", user?.id]);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Xóa địa chỉ thất bại");
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: (addressId) => setDefaultAddress(addressId, user?.access_token),
    onSuccess: () => {
      message.success("Đặt địa chỉ mặc định thành công");
      queryClient.invalidateQueries(["shippingAddress", user?.id]);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Đặt địa chỉ mặc định thất bại");
    },
  });

  // Xử lý khi thay đổi tỉnh/thành phố
  const handleCityChange = (value) => {
    const selectedCity = addressVietNam.find(city => city.name === value);
    if (selectedCity) {
      setDistricts(selectedCity.districts);
      form.setFieldsValue({ district: undefined, ward: undefined });
    }
  };

  // Xử lý khi thay đổi quận/huyện
  const handleDistrictChange = (value) => {
    const cityValue = form.getFieldValue('city');
    const selectedCity = addressVietNam.find(city => city.name === cityValue);
    if (selectedCity) {
      const selectedDistrict = selectedCity.districts.find(dist => dist.name === value);
      if (selectedDistrict) {
        setWards(selectedDistrict.wards);
        form.setFieldsValue({ ward: undefined });
      }
    }
  };

  // Mở modal thêm địa chỉ mới
  const showAddModal = () => {
    setModalTitle("Thêm địa chỉ mới");
    setEditingAddress(null);
    form.resetFields();
    setAddressType("home");
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa địa chỉ
  const showEditModal = (address) => {
    setModalTitle("Cập nhật địa chỉ");
    setEditingAddress(address);
    
    // Reset các danh sách quận/huyện và phường/xã dựa trên thành phố và quận hiện tại
    const selectedCity = addressVietNam.find(city => city.name === address.city);
    if (selectedCity) {
      setDistricts(selectedCity.districts);
      const selectedDistrict = selectedCity.districts.find(dist => dist.name === address.district);
      if (selectedDistrict) {
        setWards(selectedDistrict.wards);
      }
    }
    
    // Đặt lại giá trị form
    form.setFieldsValue({
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      district: address.district,
      ward: address.ward,
      detailedAddress: address.detailedAddress,
    });
    
    setAddressType(address.addressType || "home");
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Xử lý submit form
  const handleSubmit = (values) => {
    const addressData = {
      ...values,
      addressType: addressType,
      isDefault: editingAddress ? editingAddress.isDefault : false,
    };

    if (editingAddress) {
      updateAddressMutation.mutate({
        addressId: editingAddress._id,
        addressData,
      });
    } else {
      addAddressMutation.mutate(addressData);
    }
  };

  // Hiển thị dialog xác nhận xóa địa chỉ
  const showDeleteConfirm = (address) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa địa chỉ này?',
      icon: <ExclamationCircleFilled />,
      content: 'Thao tác này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        deleteAddressMutation.mutate(address._id);
      },
    });
  };

  // Hiển thị dialog xác nhận đặt địa chỉ mặc định
  const handleSetDefault = (address) => {
    if (!address.isDefault) {
      confirm({
        title: 'Đặt làm địa chỉ mặc định?',
        icon: <ExclamationCircleFilled />,
        content: 'Địa chỉ này sẽ được sử dụng cho các đơn hàng mới của bạn.',
        okText: 'Đồng ý',
        cancelText: 'Hủy',
        onOk() {
          setDefaultAddressMutation.mutate(address._id);
        },
      });
    }
  };

  return (
    <div className="container py-8" style={{ paddingLeft: '15vw', paddingRight: '5vw' }}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#00A651",
          },
        }}
      >
        <div className="mb-6">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleGoBack}
            className="mb-4"
          >
            Quay lại
          </Button>
          <Title level={3} className="m-0">Sổ địa chỉ của tôi</Title>
        </div>

        <Divider />

        <div className="mb-6 flex justify-between items-center">
          <Text className="text-gray-500">Quản lý danh sách địa chỉ giao hàng và thanh toán</Text>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
          >
            Thêm địa chỉ mới
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : addressData?.addresses?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {addressData.addresses.map((address) => (
              <Card 
                key={address._id} 
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Text strong className="text-2xl">{address.fullName}</Text>
                      {address.isDefault && (
                        <Badge 
                          count="Mặc định" 
                          style={{ backgroundColor: '#00A651' }} 
                        />
                      )}
                      <Badge 
                        count={address.addressType === "home" ? "Nhà Riêng" : "Văn Phòng"} 
                        style={{ backgroundColor: '#1890ff' }} 
                      />
                    </div>
                    <div className="text-gray-500 mb-1">{address.phone}</div>
                    <div className="text-gray-700">
                      {address.detailedAddress}
                    </div>
                    <div className="text-gray-700">
                      {address.ward}, {address.district}, {address.city}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Tooltip title={address.isDefault ? "Đã là địa chỉ mặc định" : "Đặt làm mặc định"}>
                      <Button 
                        type={address.isDefault ? "default" : "text"}
                        icon={<CheckCircleOutlined />} 
                        onClick={() => handleSetDefault(address)}
                        disabled={address.isDefault}
                        className={address.isDefault ? "opacity-50 cursor-not-allowed" : ""}
                      />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => showEditModal(address)}
                      />
                    </Tooltip>
                    <Tooltip title={address.isDefault ? "Không thể xóa địa chỉ mặc định" : "Xóa"}>
                      <Button 
                        type="text" 
                        danger
                        icon={<DeleteOutlined />} 
                        onClick={() => showDeleteConfirm(address)}
                        disabled={address.isDefault}
                        className={address.isDefault ? "opacity-50 cursor-not-allowed" : ""}
                      />
                    </Tooltip>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <Text className="text-gray-500">Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.</Text>
          </Card>
        )}

        <Modal
          title={modalTitle}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              fullName: '',
              phone: '',
              city: '',
              district: '',
              ward: '',
              detailedAddress: '',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên' }
                ]}
              >
                <Input placeholder="Nhập họ và tên người nhận" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^\d+$/, message: 'Số điện thoại không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="city"
                label="Tỉnh/Thành phố"
                rules={[
                  { required: true, message: 'Vui lòng chọn tỉnh/thành phố' }
                ]}
              >
                <Select
                  placeholder="Chọn tỉnh/thành phố"
                  onChange={handleCityChange}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {addressVietNam.map(city => (
                    <Option key={city.code} value={city.name}>
                      {city.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="district"
                label="Quận/Huyện"
                rules={[
                  { required: true, message: 'Vui lòng chọn quận/huyện' }
                ]}
              >
                <Select
                  placeholder="Chọn quận/huyện"
                  onChange={handleDistrictChange}
                  disabled={!districts.length}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {districts.map(district => (
                    <Option key={district.code} value={district.name}>
                      {district.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="ward"
                label="Phường/Xã"
                rules={[
                  { required: true, message: 'Vui lòng chọn phường/xã' }
                ]}
              >
                <Select
                  placeholder="Chọn phường/xã"
                  disabled={!wards.length}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {wards.map(ward => (
                    <Option key={ward.code} value={ward.name}>
                      {ward.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              name="detailedAddress"
              label="Địa chỉ chi tiết"
              rules={[
                { required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }
              ]}
            >
              <Input.TextArea
                placeholder="Số nhà, tên đường..."
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>

            <Form.Item label="Loại địa chỉ">
              <Space>
                <Button
                  type={addressType === "home" ? "primary" : "default"}
                  onClick={() => setAddressType("home")}
                >
                  Nhà Riêng
                </Button>
                <Button
                  type={addressType === "office" ? "primary" : "default"}
                  onClick={() => setAddressType("office")}
                >
                  Văn Phòng
                </Button>
              </Space>
            </Form.Item>

            <Divider />

            <div className="flex justify-end gap-2">
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={addAddressMutation.isPending || updateAddressMutation.isPending}
              >
                {editingAddress ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </Form>
        </Modal>
      </ConfigProvider>
    </div>
  );
};

export default ShippingAddressPage; 