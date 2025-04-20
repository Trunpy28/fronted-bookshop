import React, { useEffect, useMemo, useState } from "react";
import { WrapperHeader } from "./style";
import {
  Button,
  Form,
  Input,
  Select,
  Space,
  Col,
  Row,
  Statistic,
  Card,
  Pagination,
  Tag,
  Modal,
  Tooltip,
  Radio
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined
} from "@ant-design/icons";
import TableComponent from "../TableComponent/TableComponent";
import { convertPrice, timeTranform } from "../../utils";
import * as OrderService from "../../services/OrderService";
import { useMutation } from "@tanstack/react-query";
import Loading from "../LoadingComponent/Loading";
import * as message from "../Message/Message";
import { useQuery } from "@tanstack/react-query";
import DrawerComponent from "../DrawerComponent/DrawerComponent";
import { useSelector } from "react-redux";
import ModalComponent from "../ModalComponent/ModalComponent";
import { orderConstant } from "../../constant";
import OrderDetailsComponent from "../OrderDetailsComponent/OrderDetailsComponent";

const AdminOrder = () => {
  const [rowSelected, setRowSelected] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [isModalUpdateStatus, setIsModalUpdateStatus] = useState(false);
  const [selectedStatusType, setSelectedStatusType] = useState('order');
  const [selectedStatus, setSelectedStatus] = useState('');
  const user = useSelector((state) => state?.user);
  
  // State cho phân trang và lọc
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  
  // State lưu các bộ lọc
  const [filters, setFilters] = useState({
    orderId: '',
    fullName: '',
    phone: '',
    status: [],
    paymentMethod: [],
    paymentStatus: [],
  });

  const [stateOrderDetails, setStateOrderDetails] = useState({
    fullName: "",
    address: "",
    phone: "",
    shippingPrice: "",
    totalPrice: "",
    paymentMethod: "",
    status: "",
    payment: {
      status: ""
    },
    createdAt: "",
  });

  const [formDetails] = Form.useForm();
  const [searchForm] = Form.useForm();

  // Modal lọc đơn hàng
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Xem chi tiết đơn hàng trong modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const mutationUpdateStatus = useMutation({
    mutationFn: (data) => {
      const { orderId, orderStatus, paymentStatus } = data;
      return OrderService.updateOrderStatus(orderId, user?.access_token, {
        orderStatus,
        paymentStatus
      });
    },
    onSuccess: () => {
      queryOrder.refetch();
      setIsModalUpdateStatus(false);
      setSelectedStatus('');
    }
  });

  const mutationDeleted = useMutation({
    mutationFn: async (data) => {
      const { id, token } = data;
      const res = await OrderService.deleteOrder(id, token);
      return res;
    },
    onSuccess: () => {
      queryOrder.refetch();
      setIsModalOpenDelete(false);
    }
  });

  const fetchGetDetailsOrder = async (rowSelected) => {
    const res = await OrderService.getDetailsOrder(
      rowSelected,
      user?.access_token
    );

    if (res?.data) {
      setStateOrderDetails({
        fullName: res?.data?.fullName,
        address: res?.data?.address,
        phone: res?.data?.phone,
        orderItems: res?.data?.orderItems,
        shippingPrice: convertPrice(res?.data?.shippingPrice),
        totalPrice: res?.data?.totalPrice,
        paymentMethod: res?.data?.payment?.paymentMethod || 'COD',
        status: res?.data?.status || 'Pending',
        payment: {
          status: res?.data?.payment?.status || 'Pending'
        },
        createdAt: timeTranform(res?.data?.createdAt),
      });
    }
  };

  useEffect(() => {
    formDetails.setFieldsValue({
      ...stateOrderDetails,
      paymentStatus: stateOrderDetails?.payment?.status
    });
  }, [formDetails, stateOrderDetails]);

  useEffect(() => {
    if (rowSelected && isOpenDrawer) {
      fetchGetDetailsOrder(rowSelected);
    }
  }, [isOpenDrawer]);

  const handleDetailsOrder = () => {
    setIsOpenDrawer(true);
  };

  const queryOrder = useQuery({
    queryKey: ["orders", pagination.page, pagination.pageSize, filters],    //Khi có sự thay đổi của pagination.page, pagination.pageSize, filters thì sẽ gọi lại queryFn
    queryFn: () => {
      const options = {
        page: pagination.page,
        limit: pagination.pageSize,
        ...filters,
      };
      
      return OrderService.getPaginatedOrders(user?.access_token, options);
    },
    keepPreviousData: true
  });
  
  const { isLoading: isLoadingOrders, data: orders } = queryOrder;

  // Handler cho thay đổi trang
  const handlePageChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      page,
      pageSize,
    });
  };

  // Handler cho việc áp dụng bộ lọc
  const handleApplyFilters = (values) => {
    setFilters(values);
    setPagination({
      ...pagination,
      page: 1,
    });
    setIsFilterModalVisible(false);
  };

  // Handler reset bộ lọc
  const handleResetFilters = () => {
    searchForm.setFieldsValue({
      orderId: '',
      fullName: '',
      phone: '',
      status: [],
      paymentMethod: [],
      paymentStatus: [],
    });
  };

  // Khi mở modal, set giá trị form từ filters hiện tại
  useEffect(() => {
    if (isFilterModalVisible) {
      searchForm.setFieldsValue(filters);
    }
  }, [isFilterModalVisible]);

  const handleViewDetails = async (orderId) => {
    if (!orderId) return;
    
    setSelectedOrder(null);
    setIsModalVisible(true);
    setIsLoadingDetails(true);
    try {
      const response = await OrderService.getDetailsOrder(orderId, user?.access_token);
      setSelectedOrder(response.data);
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleUpdateStatus = () => {
    if (!selectedStatus) {
      message.error('Vui lòng chọn trạng thái');
      return;
    }

    const updateData = {
      orderId: rowSelected,
      orderStatus: selectedStatusType === 'order' ? selectedStatus : undefined,
      paymentStatus: selectedStatusType === 'payment' ? selectedStatus : undefined
    };

    mutationUpdateStatus.mutate(updateData);
  };

  const handleDeleteOrder = () => {
    mutationDeleted.mutate(
      { id: rowSelected, token: user?.access_token },
      {
        onSettled: () => {
          queryOrder.refetch();
        },
      }
    );
  };

  const renderAction = () => {
    return (
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <Tooltip title="Xem chi tiết">
          <EyeOutlined
            style={{ color: "#1890ff", fontSize: "20px", cursor: "pointer" }}
            onClick={() => handleViewDetails(rowSelected)}
          />
        </Tooltip>
        <Tooltip title="Cập nhật trạng thái">
          <EditOutlined
            style={{ color: "orange", fontSize: "20px", cursor: "pointer" }}
            onClick={() => setIsModalUpdateStatus(true)}
          />
        </Tooltip>
        <Tooltip title="Xóa">
          <DeleteOutlined
            style={{ color: "red", fontSize: "20px", cursor: "pointer" }}
            onClick={() => setIsModalOpenDelete(true)}
          />
        </Tooltip>
      </div>
    );
  };

  // Chuyển đổi trạng thái đơn hàng thành Tag có màu sắc
  const renderOrderStatus = (status) => {
    let color = 'blue';
    
    switch(status) {
      case 'Delivered':
        color = 'green';
        break;
      case 'Shipping':
        color = 'blue';
        break;
      case 'Cancelled':
        color = 'red';
        break;
      case 'Pending':
        color = 'orange';
        break;
      default:
        color = 'default';
    }
    
    return <Tag color={color}>{orderConstant.orderStatus[status] || status}</Tag>;
  };

  // Chuyển đổi trạng thái thanh toán thành Tag có màu sắc
  const renderPaymentStatus = (status) => {
    let color = 'default';
    
    switch(status) {
      case 'Completed':
        color = 'green';
        break;
      case 'Pending':
        color = 'orange';
        break;
      case 'Failed':
        color = 'red';
        break;
      default:
        color = 'default';
    }
    
    return <Tag color={color}>{orderConstant.paymentStatus[status] || status}</Tag>;
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderCode",
      align: "center",
      width: 100,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "fullName",
      align: "center",
      width: 180,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      align: "center",
      width: 120,
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      render: (status) => renderOrderStatus(status),
      align: "center",
      width: 120,
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      render: (status) => renderPaymentStatus(status),
      align: "center",
      width: 120,
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      render: (method) => orderConstant.payment[method] || method,
      align: "center",
      width: 150,
    },
    {
      title: "Tổng tiền (VNĐ)",
      dataIndex: "totalPrice",
      render: (text) => (
        <span style={{ color: "#CD3238", fontWeight: "bold" }}>{convertPrice(text)}</span>
      ),
      align: "center",
      width: 150,
    },
    {
      title: "Thời gian đặt hàng",
      dataIndex: "createdAt",
      align: "center",
      width: 120,
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      render: renderAction,
      align: "center",
      width: 120,
    },
  ];

  const dataTable =
    orders?.data?.length &&
    orders?.data?.map((order) => {
      return {
        ...order,
        key: order._id,
        orderCode: order?._id,
        paymentStatus: order?.payment?.status || 'Pending',
        paymentMethod: order?.payment?.paymentMethod || 'COD',
        totalPrice: order?.totalPrice,
        createdAt: timeTranform(order?.createdAt),
      };
    });

  // Cập nhật tổng số bản ghi từ response
  useEffect(() => {
    if (orders?.pagination) {
      setPagination({
        ...pagination,
        total: orders.pagination.total || 0,
      });
    }
  }, [orders]);

  return (
    <div>
      <WrapperHeader>Quản lý đơn hàng</WrapperHeader>

      {/* Nút lọc và bảng dữ liệu */}
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <Button 
          type="primary" 
          icon={<SearchOutlined />}
          onClick={() => setIsFilterModalVisible(true)}
          style={{ marginBottom: 20 }}
        >
          Lọc đơn hàng
        </Button>

        <TableComponent
          columns={columns}
          data={dataTable}
          isLoading={isLoadingOrders}
          pagination={false}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setRowSelected(record._id);
              },
            };
          }}
        />

        {/* Phân trang */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <Pagination
            current={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={['10', '20', '50', '100']}
            showTotal={(total) => `Tổng ${total} bản ghi`}
          />
        </div>
      </div>

      {/* Modal lọc đơn hàng */}
      <Modal
        title="Lọc đơn hàng"
        open={isFilterModalVisible}
        onCancel={() => setIsFilterModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={searchForm}
          layout="vertical"
          onFinish={handleApplyFilters}
          initialValues={filters}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="orderId" label="Mã đơn hàng">
                <Input placeholder="Nhập mã đơn hàng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fullName" label="Tên khách hàng">
                <Input placeholder="Nhập tên khách hàng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="Trạng thái đơn hàng">
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Chọn trạng thái"
                  options={[
                    { value: 'Pending', label: 'Chờ xác nhận' },
                    { value: 'Shipping', label: 'Đang giao hàng' },
                    { value: 'Delivered', label: 'Đã giao hàng' },
                    { value: 'Cancelled', label: 'Đã hủy' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="paymentMethod" label="Phương thức thanh toán">
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Chọn phương thức thanh toán"
                  options={[
                    { value: 'COD', label: 'Thanh toán khi nhận hàng' },
                    { value: 'PAYPAL', label: 'PayPal' },
                    { value: 'VNPAY', label: 'VNPay' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="paymentStatus" label="Trạng thái thanh toán">
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Chọn trạng thái thanh toán"
                  options={[
                    { value: 'Pending', label: 'Chờ thanh toán' },
                    { value: 'Completed', label: 'Đã thanh toán' },
                    { value: 'Failed', label: 'Thanh toán thất bại' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button 
                onClick={handleResetFilters}
                style={{ marginRight: 8 }}
              >
                Đặt lại
              </Button>
              <Button type="primary" htmlType="submit">
                Áp dụng
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập nhật trạng thái"
        open={isModalUpdateStatus}
        onCancel={() => {
          setIsModalUpdateStatus(false);
          setSelectedStatus('');
        }}
        onOk={handleUpdateStatus}
        confirmLoading={mutationUpdateStatus.isPending}
      >
        <Form layout="vertical">
          <Form.Item label="Loại trạng thái">
            <Radio.Group 
              value={selectedStatusType} 
              onChange={(e) => {
                setSelectedStatusType(e.target.value);
                setSelectedStatus('');
              }}
            >
              <Radio value="order">Trạng thái đơn hàng</Radio>
              <Radio value="payment">Trạng thái thanh toán</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Trạng thái">
            {selectedStatusType === 'order' ? (
              <Select
                value={selectedStatus}
                onChange={(value) => {
                  setSelectedStatus(value);
                }}
                placeholder="Chọn trạng thái đơn hàng"
                options={[
                  { value: 'Pending', label: 'Chờ xác nhận' },
                  { value: 'Shipping', label: 'Đang giao hàng' },
                  { value: 'Delivered', label: 'Đã giao hàng' },
                  { value: 'Cancelled', label: 'Đã hủy' },
                ]}
              />
            ) : (
              <Select
                value={selectedStatus}
                onChange={(value) => {
                  setSelectedStatus(value);
                }}
                placeholder="Chọn trạng thái thanh toán"
                options={[
                  { value: 'Pending', label: 'Chờ thanh toán' },
                  { value: 'Completed', label: 'Đã thanh toán' },
                  { value: 'Failed', label: 'Thanh toán thất bại' },
                ]}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết đơn hàng */}
      <Modal
        title="Chi tiết đơn hàng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={null}
      >
        <Loading isLoading={isLoadingDetails}>
          {selectedOrder && <OrderDetailsComponent order={selectedOrder} />}
        </Loading>
      </Modal>

      {/* Modal xóa đơn hàng */}
      <ModalComponent
        title="Xóa đơn hàng"
        open={isModalOpenDelete}
        onOk={handleDeleteOrder}
        onCancel={() => setIsModalOpenDelete(false)}
        cancelText="Hủy bỏ"
      >
        <Loading isLoading={mutationDeleted.isPending}>
          <p>Bạn có chắc muốn xóa đơn hàng này?</p>
        </Loading>
      </ModalComponent>
    </div>
  );
};

export default AdminOrder;
