import React, { useEffect, useState } from "react";
import { WrapperHeader } from "./style";
import { Button, Form, Input, Select, Tooltip, Tag, Avatar, Divider, Modal, Space, Row, Col } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, PhoneOutlined, CrownOutlined, SearchOutlined } from "@ant-design/icons";
import TableComponent from "../TableComponent/TableComponent";
import InputComponent from "../InputComponent/InputComponent";
import { WrapperUploadFile } from "../../pages/ProfilePage/style";
import { getBase64 } from "../../utils/utils";
import * as UserService from "../../services/UserService";
import Loading from "../LoadingComponent/Loading";
import * as message from "../../components/Message/Message";
import { useQuery, useMutation } from "@tanstack/react-query";
import DrawerComponent from "../DrawerComponent/DrawerComponent";
import { useSelector } from "react-redux";
import ModalComponent from "../ModalComponent/ModalComponent";

const AdminUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowSelected, setRowSelected] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const user = useSelector((state) => state?.user);

  // State cho phân trang và lọc
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  // State lưu các bộ lọc
  const [filters, setFilters] = useState({ name: '', email: '', phone: '', role: undefined });
  
  // Modal lọc người dùng
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [searchForm] = Form.useForm();

  // Chỉ chứa các thông tin cơ bản khi tạo user mới, không bao gồm địa chỉ
  const [stateUser, setStateUser] = useState({ name: "", email: "", password: "", confirmPassword: "", isAdmin: false, phone: "", avatar: "" });

  // Vẫn giữ nguyên thông tin địa chỉ để hiển thị chi tiết
  const [stateUserDetails, setStateUserDetails] = useState({ name: "", email: "", isAdmin: false, phone: "", address: "", avatar: "", id: "" });

  const [form] = Form.useForm();
  const [formDetails] = Form.useForm();

  // Sử dụng useMutation trực tiếp
  const { mutate: mutationCreateUser, isPending } = useMutation({
    mutationFn: (data) => {
      const {
        name,
        email,
        password,
        confirmPassword,
        isAdmin,
        phone,
        avatar,
      } = data;
      
      return UserService.signUpUser({
        name,
        email,
        password,
        confirmPassword,
        isAdmin,
        phone,
        avatar,
      });
    },
    onSuccess: (data) => {
      if (data?.status === "OK") {
        message.success("Thêm tài khoản thành công");
        setIsModalOpen(false);
        form.resetFields();
        queryUser.refetch();
      } else {
        message.error("Thêm tài khoản thất bại. " + data?.message);
      }
    },
    onError: (error) => {
      message.error("Thêm tài khoản thất bại. " + error?.message);
    }
  });

  const { 
    mutate: mutationUpdateUser, 
    isPending: isLoadingUpdated 
  } = useMutation({
    mutationFn: (data) => {
      const { id, token, ...rests } = data;
      return UserService.updateUser(id, token, { ...rests });
    },
    onSuccess: (data) => {
      if (data?.status === "OK") {
        message.success("Cập nhật tài khoản thành công");
        setIsOpenDrawer(false);
        formDetails.resetFields();
        queryUser.refetch();
      } else {
        message.error("Cập nhật tài khoản thất bại. " + data?.message);
      }
    },
    onError: (error) => {
      message.error("Cập nhật tài khoản thất bại. " + error?.message);
    }
  });

  const { 
    mutate: mutationDeleteUser, 
    isPending: isLoadingDeleted 
  } = useMutation({
    mutationFn: (data) => {
      const { id, token } = data;
      return UserService.deleteUser(id, token);
    },
    onSuccess: (data) => {
      if (data?.status === "OK") {
        message.success("Xóa tài khoản thành công");
        setIsModalOpenDelete(false);
        queryUser.refetch();
      } else {
        message.error("Xóa tài khoản thất bại. " + data?.message);
      }
    },
    onError: (error) => {
      message.error("Xóa tài khoản thất bại. " + error?.message);
    }
  });

  const queryUser = useQuery({
    queryKey: ["users", pagination.current, pagination.pageSize, filters],
    queryFn: () => {
      const params = { page: pagination.current, limit: pagination.pageSize, ...filters };
      return UserService.getUsersPaginated(params, user?.access_token);
    },
    keepPreviousData: true,
  });
  
  const { isPending: isLoadingUsers, data: users } = queryUser;

  const fetchGetDetailsUser = async (rowSelected) => {
    const res = await UserService.getDetailsUser(
      rowSelected,
      user?.access_token
    );
    
    if (res?.data) {
      setStateUserDetails({
        name: res?.data?.name,
        email: res?.data?.email,
        isAdmin: res?.data?.isAdmin,
        phone: res?.data?.phone,
        address: res?.data?.address,
        avatar: res?.data?.avatar,
        id: res?.data?._id,
      });
    }
    setIsLoadingUpdate(false);
  };

  useEffect(() => {
    formDetails.setFieldsValue({
      ...stateUserDetails,
      isAdmin: stateUserDetails.isAdmin
    });
  }, [formDetails, stateUserDetails]);

  useEffect(() => {
    if (rowSelected && isOpenDrawer) {
      setIsLoadingUpdate(true);
      fetchGetDetailsUser(rowSelected);
    }
  }, [isOpenDrawer]);
  
  // Handler cho thay đổi trang
  const handlePaginationChange = (pagination) => {
    setPagination({ ...pagination, current: pagination.current, pageSize: pagination.pageSize });
  };
  
  // Handler cho việc áp dụng bộ lọc
  const handleApplyFilters = (values) => {
    const cleanedFilters = {};
    
    // Chỉ thêm các trường không rỗng vào filters
    if (values.name && values.name.trim() !== '') 
      cleanedFilters.name = values.name.trim();
    
    if (values.email && values.email.trim() !== '') 
      cleanedFilters.email = values.email.trim();
    
    if (values.phone && values.phone.trim() !== '') 
      cleanedFilters.phone = values.phone.trim();
    
    if (values.role !== undefined) 
      cleanedFilters.role = values.role;
    
    setFilters(cleanedFilters);
    setPagination({ ...pagination, current: 1 });
    setIsFilterModalVisible(false);
  };
  
  // Handler reset bộ lọc
  const handleResetFilters = () => {
    searchForm.setFieldsValue({ name: '', email: '', phone: '', role: undefined });
  };
  
  // Khi mở modal, set giá trị form từ filters hiện tại
  useEffect(() => {
    if (isFilterModalVisible) {
      searchForm.setFieldsValue(filters);
    }
  }, [isFilterModalVisible]);

  // Cập nhật tổng số bản ghi từ response
  useEffect(() => {
    if (users?.data?.pagination) {
      setPagination({ ...pagination, total: users.data.pagination.total || 0 });
    }
  }, [users]);

  const handleDetailsUser = () => {
    setIsOpenDrawer(true);
  };

  const renderAction = () => {
    return (
      <div style={{ display: "flex", gap: "20px" }}>
        <Tooltip title="Chỉnh sửa thông tin">
          <EditOutlined
          style={{ color: "orange", fontSize: "30px", cursor: "pointer" }}
            onClick={handleDetailsUser}
          />
        </Tooltip>
        <Tooltip title="Xóa">
          <DeleteOutlined
            style={{ color: "red", fontSize: "30px", cursor: "pointer" }}
            onClick={() => setIsModalOpenDelete(true)}
          />
        </Tooltip>
      </div>
    );
  };

  const columns = [
    {
      title: "Người dùng",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{text}</div>
            <div style={{ color: '#666' }}>
              <MailOutlined style={{ marginRight: '5px' }} />
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 180,
      render: (phone) => (
        <div>
          <PhoneOutlined style={{ marginRight: '8px', color: '#1677ff' }} />
          {phone || <span style={{ color: '#999', fontStyle: 'italic' }}>Chưa cập nhật</span>}
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "isAdmin",
      key: "isAdmin",
      width: 150,
      render: (isAdmin) => (
        <Tag 
          icon={isAdmin === "Quản trị viên" ? <CrownOutlined /> : <UserOutlined />}
          color={isAdmin === "Quản trị viên" ? "gold" : "green"}
          style={{ padding: '4px 8px', fontSize: '14px' }}
        >
          {isAdmin}
        </Tag>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (address) => (
        <div style={{ maxWidth: '300px' }}>
          <Tooltip title={getFullAddress(address)}>
            <span style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {getFullAddress(address)}
            </span>
          </Tooltip>
        </div>
      ),
      width: 300,
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      render: renderAction,
      width: 120,
      fixed: 'right'
    },
  ];

  const dataTable =
    users?.data?.data?.length &&
    users?.data?.data?.map((user) => {
      return {
        ...user,
        key: user._id,
        isAdmin: user.isAdmin ? "Quản trị viên" : "Khách hàng",
      };
    });

  useEffect(() => {
    if (isModalOpen) {
      setStateUser({ name: "", email: "", password: "", confirmPassword: "", isAdmin: false, phone: "", avatar: "" });
      form.resetFields();
    }
  }, [isModalOpen]);

  const handleCloseDrawer = () => {
    setIsOpenDrawer(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleCancelDelete = () => {
    setIsModalOpenDelete(false);
  };

  const handleDeleteUser = () => {
    mutationDeleteUser({ id: rowSelected, token: user?.access_token });
  };

  const onFinish = () => {
    mutationCreateUser(stateUser);
  };

  const handleOnChange = (e) => {
    setStateUser({ ...stateUser, [e.target.name]: e.target.value });
  };

  const handleOnChangeRole = (value) => {
    setStateUser({ ...stateUser, isAdmin: value });
  };

  const handleOnChangeDetailsRole = (value) => {
    setStateUserDetails({ ...stateUserDetails, isAdmin: value });
  };

  const handleOnChangeAvatar = async ({ file }) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateUser({ ...stateUser, avatar: file.preview });
  };

  const onUpdateUser = () => {
    mutationUpdateUser({ id: rowSelected, token: user?.access_token, isAdmin: stateUserDetails.isAdmin });
  };

  // Tạo chuỗi địa chỉ đầy đủ
  const getFullAddress = (address) => {
    if (!address) return "Chưa có địa chỉ";
    
    const parts = [];
    if (address.detailedAddress) parts.push(address.detailedAddress);
    if (address.ward) parts.push(address.ward);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    
    return parts.length ? parts.join(', ') : "Chưa có địa chỉ";
  };

  return (
    <div>
      <WrapperHeader>Quản lý tài khoản</WrapperHeader>

      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          style={{
            height: '150px',
            width: '150px',
            borderRadius: '6px',
            borderStyle: 'dashed',
          }}
          onClick={showModal}
        >
          <PlusOutlined style={{ fontSize: '40px' }} />
        </Button>

        <Button 
          type="primary" 
          icon={<SearchOutlined />}
          onClick={() => setIsFilterModalVisible(true)}
          style={{ height: "50px", fontSize: "16px", padding: "0 25px" }}
          size="large"
        >
          Lọc tài khoản
        </Button>
      </div>

      {/* Bảng dữ liệu */}
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <TableComponent
          columns={columns}
          data={dataTable}
          isLoading={isLoadingUsers}
          pagination={{
            ...pagination,
            pageSizeOptions: [2, 10, 20, 50, 100],
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`
          }}
          onChange={handlePaginationChange}
          onRow={(record) => ({ onClick: () => setRowSelected(record._id) })}
          scroll={{ x: 1000 }}
          bordered
        />
      </div>

      {/* Modal lọc người dùng */}
      <Modal
        title="Lọc tài khoản"
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
            <Col span={12}>
              <Form.Item name="name" label="Tên người dùng">
                <Input placeholder="Nhập tên người dùng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="role" label="Vai trò">
                <Select
                  allowClear
                  placeholder="Chọn vai trò"
                  options={[
                    {
                      value: 'admin',
                      label: 'Quản trị viên',
                    },
                    {
                      value: 'customer',
                      label: 'Khách hàng',
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button 
                  onClick={handleResetFilters}
                >
                  Đặt lại
                </Button>
                <Button type="primary" htmlType="submit">
                  Áp dụng
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Modal>

      <ModalComponent
        forceRender
        title="Tạo tài khoản"
        open={isModalOpen}
        onOk={handleCancel}
        onCancel={handleCancel}
        cancelText="Hủy bỏ"
        width={700}
        footer={null}
      >
        <Loading isLoading={isPending}>
          <Form
            name="Add user form"
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
            style={{
              maxWidth: 600,
            }}
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            autoComplete="off"
            form={form}
          >
            <Form.Item
              label="Tên người dùng"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Hãy nhập tên người dùng!",
                },
              ]}
            >
              <InputComponent
                values={stateUser.name}
                onChange={handleOnChange}
                name="name"
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Hãy nhập email người dùng!",
                },
              ]}
            >
              <InputComponent
                values={stateUser.email}
                onChange={handleOnChange}
                name="email"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Hãy nhập mật khẩu!",
                },
              ]}
            >
              <Input.Password
                values={stateUser.password}
                onChange={handleOnChange}
                name="password"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu xác nhận"
              name="confirmPassword"
              rules={[
                {
                  required: true,
                  message: "Hãy nhập mật khẩu xác nhận!",
                },
              ]}
            >
              <Input.Password
                values={stateUser.confirmPassword}
                onChange={handleOnChange}
                name="confirmPassword"
              />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                {
                  required: false,
                  message: "Hãy nhập số điện thoại!",
                },
              ]}
            >
              <InputComponent
                values={stateUser.phone}
                onChange={handleOnChange}
                name="phone"
              />
            </Form.Item>

            <Form.Item
              label="Vai trò"
              name="isAdmin"
              rules={[
                {
                  required: true,
                  message: "Hãy chọn vai trò của tài khoản!",
                },
              ]}
            >
              <Select
                placeholder="Chọn vai trò"
                style={{
                  width: 150,
                }}
                onChange={handleOnChangeRole}
                options={[
                  {
                    value: true,
                    label: "Quản trị viên",
                  },
                  {
                    value: false,
                    label: "Khách hàng",
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Ảnh đại diện"
              name="avatar"
              rules={[
                {
                  required: false,
                  message: "Hãy chọn ảnh đại diện!",
                },
              ]}
            >
              <WrapperUploadFile
                onChange={handleOnChangeAvatar}
                showUploadList={true}
                maxCount={1}
              >
                <Button>Chọn ảnh</Button>
                {stateUser.avatar && (
                  <img
                    src={stateUser.avatar}
                    style={{
                      height: "100px",
                      width: "100px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                    alt="Ảnh đại diện"
                  />
                )}
              </WrapperUploadFile>
            </Form.Item>

            <Form.Item
              wrapperCol={{
                offset: 19,
                span: 16,
              }}
            >
              <Button type="primary" htmlType="submit">
                Thêm tài khoản
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </ModalComponent>
      <DrawerComponent
        title="Chi tiết tài khoản"
        isOpen={isOpenDrawer}
        onClose={handleCloseDrawer}
        width="65%"
        forceRender
      >
        <Loading isLoading={isLoadingUpdate || isLoadingUpdated}>
          <div style={{ padding: '0 20px' }}>
            {stateUserDetails?.avatar ? (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Avatar size={100} src={stateUserDetails?.avatar} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
              </div>
            )}
            
            <Divider orientation="left">Thông tin cá nhân</Divider>
            
            <Row gutter={16} style={{ marginBottom: '15px' }}>
              <Col span={8} style={{ fontWeight: 'bold', color: '#666' }}>Tên người dùng:</Col>
              <Col span={16}>{stateUserDetails?.name}</Col>
            </Row>
            
            <Row gutter={16} style={{ marginBottom: '15px' }}>
              <Col span={8} style={{ fontWeight: 'bold', color: '#666' }}>Email:</Col>
              <Col span={16}>{stateUserDetails?.email}</Col>
            </Row>
            
            <Row gutter={16} style={{ marginBottom: '15px' }}>
              <Col span={8} style={{ fontWeight: 'bold', color: '#666' }}>Số điện thoại:</Col>
              <Col span={16}>{stateUserDetails?.phone || "Chưa có thông tin"}</Col>
            </Row>
            
            <Row gutter={16} style={{ marginBottom: '15px' }}>
              <Col span={8} style={{ fontWeight: 'bold', color: '#666' }}>Địa chỉ:</Col>
              <Col span={16}>{getFullAddress(stateUserDetails?.address)}</Col>
            </Row>
            
            <Divider orientation="left">Cài đặt quyền</Divider>
            
            <Form
              name="Edit user form"
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 16,
              }}
              style={{
                maxWidth: 600,
              }}
              initialValues={{
                remember: true,
              }}
              onFinish={onUpdateUser}
              autoComplete="off"
              form={formDetails}
            >
              <Form.Item
                label="Vai trò"
                name="isAdmin"
                rules={[
                  {
                    required: true,
                    message: "Hãy chọn vai trò của tài khoản!",
                  },
                ]}
              >
                <Select
                  defaultValue={stateUserDetails?.isAdmin}
                  style={{
                    width: 150,
                  }}
                  onChange={handleOnChangeDetailsRole}
                  options={[
                    {
                      value: true,
                      label: "Quản trị viên",
                    },
                    {
                      value: false,
                      label: "Khách hàng",
                    },
                  ]}
                  disabled={stateUserDetails?.id === user?.id}
                />
              </Form.Item>

              <Form.Item
                wrapperCol={{
                  offset: 19,
                  span: 16,
                }}
              >
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Loading>
      </DrawerComponent>

      <ModalComponent
        title="Xóa tài khoản"
        open={isModalOpenDelete}
        onOk={handleDeleteUser}
        onCancel={handleCancelDelete}
        cancelText="Hủy bỏ"
      >
        <Loading isLoading={isLoadingDeleted}>
          <p>Bạn có chắc muốn xóa tài khoản này?</p>
        </Loading>
      </ModalComponent>
    </div>
  );
};

export default AdminUser;
