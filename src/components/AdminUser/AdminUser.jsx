import React, { useEffect, useMemo, useRef, useState } from "react";
import { WrapperHeader } from "./style";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import TableComponent from "../TableComponent/TableComponent";
import InputComponent from "../InputComponent/InputComponent";
import { WrapperUploadFile } from "../../pages/ProfilePage/style";
import { getBase64 } from "../../utils";
import * as UserService from "../../services/UserService";
import Loading from "../LoadingComponent/Loading";
import * as message from "../../components/Message/Message";
import { useQuery, useMutation } from "@tanstack/react-query";
import DrawerComponent from "../DrawerComponent/DrawerComponent";
import { useSelector } from "react-redux";
import ModalComponent from "../ModalComponent/ModalComponent";
import CountUp from "react-countup";

const AdminUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowSelected, setRowSelected] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const user = useSelector((state) => state?.user);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const customnerFormatter = (value) => (
    <CountUp
      end={value}
      separator="."
      style={{ color: "green", fontWeight: "bold" }}
    />
  );

  const adminFormatter = (value) => (
    <CountUp
      end={value}
      separator="."
      style={{ color: "blue", fontWeight: "bold" }}
    />
  );

  // Chỉ chứa các thông tin cơ bản khi tạo user mới, không bao gồm địa chỉ
  const [stateUser, setStateUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    isAdmin: false,
    phone: "",
    avatar: "",
  });

  // Vẫn giữ nguyên thông tin địa chỉ để hiển thị chi tiết
  const [stateUserDetails, setStateUserDetails] = useState({
    name: "",
    email: "",
    isAdmin: false,
    phone: "",
    address: "",  // Giữ nguyên thông tin địa chỉ
    avatar: "",
  });

  const [form] = Form.useForm();
  const [formDetails] = Form.useForm();

  // Sử dụng useMutation trực tiếp
  const { mutate: mutationCreateUser, isPending, isSuccess, isError, data } = useMutation({
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
  });

  const { 
    mutate: mutationUpdateUser, 
    isPending: isLoadingUpdated, 
    isSuccess: isSuccessUpdated, 
    isError: isErrorUpdated,
    data: dataUpdated 
  } = useMutation({
    mutationFn: (data) => {
      const { id, token, ...rests } = data;
      return UserService.updateUser(id, token, { ...rests });
    },
  });

  const { 
    mutate: mutationDeleteUser, 
    isPending: isLoadingDeleted, 
    isSuccess: isSuccessDeleted, 
    isError: isErrorDeleted,
    data: dataDeleted 
  } = useMutation({
    mutationFn: (data) => {
      const { id, token } = data;
      return UserService.deleteUser(id, token);
    },
  });

  const getAllUsers = async () => {
    const res = await UserService.getAllUser(user?.access_token);
    return res;
  };

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

  const handleDetailsUser = () => {
    setIsOpenDrawer(true);
  };

  const queryUser = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });
  const { isPending: isLoadingUsers, data: users } = queryUser;

  const renderAction = () => {
    return (
      <div style={{ display: "flex", gap: "20px" }}>
        <EditOutlined
          style={{ color: "orange", fontSize: "30px", cursor: "pointer" }}
          onClick={handleDetailsUser}
        />
        <DeleteOutlined
          style={{ color: "red", fontSize: "30px", cursor: "pointer" }}
          onClick={() => setIsModalOpenDelete(true)}
        />
      </div>
    );
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Tìm ${dataIndex === 'name' ? 'tên' : 
                        dataIndex === 'email' ? 'email' : 
                        dataIndex === 'isAdmin' ? 'vai trò' : 'số điện thoại'}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
            fontSize: "16px",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
              height: "30px",
              fontSize: "16px",
            }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
              height: "30px",
              fontSize: "16px",
            }}
          >
            Đặt lại
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
            style={{
              height: "30px",
              fontSize: "16px",
            }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
  });

  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "name",
      render: (text) => <a>{text}</a>,
      ...getColumnSearchProps("name"),
    },
    {
      title: "Email",
      dataIndex: "email",
      ...getColumnSearchProps("email"),
    },
    {
      title: "Vai trò",
      dataIndex: "isAdmin",
      ...getColumnSearchProps("isAdmin"),
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      ...getColumnSearchProps("phone"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      render: (address) => getFullAddress(address),
      width: 300,
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      render: renderAction,
    },
  ];

  const dataTable =
    users?.data?.length &&
    users?.data?.map((user) => {
      return {
        ...user,
        key: user._id,
        isAdmin: user.isAdmin ? "Quản trị viên" : "Khách hàng",
      };
    });

  useEffect(() => {
    if (isSuccess && data?.status === "OK") {
      message.success("Thêm tài khoản thành công");
      handleCancelDelete();
    } else if (isError || data?.status === "ERR") {
      message.error("Thêm tài khoản thất bại. " + data?.message);
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (isSuccessDeleted && dataDeleted?.status === "OK") {
      message.success("Xóa tài khoản thành công");
      handleCancelDelete();
    } else if (isErrorDeleted || dataDeleted?.status === "ERR") {
      message.error("Xóa tài khoản thất bại. ");
    }
  }, [isSuccessDeleted, isErrorDeleted]);

  useEffect(() => {
    if (isSuccessUpdated && dataUpdated?.status === "OK") {
      message.success("Cập nhật tài khoản thành công");
      handleCloseDrawer();
    } else if (isErrorUpdated || dataUpdated?.status === "ERR") {
      message.error("Cập nhật tài khoản thất bại. ");
    }
  }, [isSuccessUpdated, isErrorUpdated]);

  useEffect(() => {
    setStateUser({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      isAdmin: false,
      phone: "",
      avatar: "",
    });
  }, [isModalOpen]);

  const handleCloseDrawer = () => {
    setIsOpenDrawer(false);
    setStateUserDetails({
      name: "",
      email: "",
      isAdmin: false,
      phone: "",
      address: "",
      avatar: "",
    });
    formDetails.resetFields();
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setStateUser({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      isAdmin: false,
      phone: "",
      avatar: "",
    });
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleCancelDelete = () => {
    setIsModalOpenDelete(false);
  };

  const handleDeleteUser = () => {
    mutationDeleteUser(
      { id: rowSelected, token: user?.access_token },
      {
        onSettled: () => {
          queryUser.refetch();
        },
      }
    );
  };

  const handleDeleteManyUsers = () => {
    message.warning("Tính năng xóa nhiều tài khoản chưa được hỗ trợ");
  };

  const handleCancel = () => {
    setStateUser({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      isAdmin: false,
      phone: "",
      avatar: "",
    });
    form.resetFields();
    setIsModalOpen(false);
  };

  const onFinish = () => {
    handleOk();
    mutationCreateUser(stateUser, {
      onSettled: () => {
        queryUser.refetch();
      },
    });
  };


  const handleOnChange = (e) => {
    setStateUser({
      ...stateUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleOnChangeRole = (value) => {
    setStateUser({
      ...stateUser,
      isAdmin: value,
    });
  };

  const handleOnChangeDetailsRole = (value) => {
    setStateUserDetails({
      ...stateUserDetails,
      isAdmin: value,
    });
  };

  const handleOnChangeAvatar = async ({ file }) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateUser({
      ...stateUser,
      avatar: file.preview,
    });
  };

  const onUpdateUser = () => {
    mutationUpdateUser(
      {
        id: rowSelected,
        token: user?.access_token,
        isAdmin: stateUserDetails.isAdmin
      },
      {
        onSettled: () => {
          queryUser.refetch();
        },
      }
    );
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

  //Memo cho thống kê
  const adminAccount = useMemo(() => {
    return users?.data?.reduce((total, user) => {
      return total + (user?.isAdmin ? 1 : 0);
    }, 0);
  }, [users]);

  const customerAccount = useMemo(() => {
    return users?.data?.length - adminAccount;
  }, [users]);

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
            height: "150px",
            width: "150px",
            borderRadius: "6px",
            borderStyle: "dashed",
          }}
          onClick={showModal}
        >
          <PlusOutlined style={{ fontSize: "40px" }} />
        </Button>
        <Row gutter={40} style={{ width: "40vw" }}>
          <Col span={10}>
            <Card style={{ border: "1px solid #1677FF" }}>
              <Statistic
                title="Quản trị viên"
                value={adminAccount}
                formatter={adminFormatter}
              />
            </Card>
          </Col>
          <Col span={10}>
            <Card style={{ border: "1px solid #00B55F" }}>
              <Statistic
                title="Khách hàng"
                value={customerAccount}
                formatter={customnerFormatter}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <div style={{ marginTop: "20px" }}>
        <TableComponent
          handleDeleteMany={handleDeleteManyUsers}
          columns={columns}
          data={dataTable}
          isLoading={isLoadingUsers}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setRowSelected(record._id);
              },
            };
          }}
        />
      </div>
      <ModalComponent
        forceRender
        title="Tạo tài khoản"
        open={isModalOpen}
        onOk={handleOk}
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
        onClose={() => {
          setIsOpenDrawer(false);
        }}
        width="65%"
        forceRender
      >
        <Loading isLoading={isLoadingUpdate || isLoadingUpdated}>
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
              label="Tên người dùng"
            >
              <span>{stateUserDetails?.name}</span>
            </Form.Item>

            <Form.Item
              label="Email"
            >
              <span>{stateUserDetails?.email}</span>
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
            >
              <span>{stateUserDetails?.phone || "Chưa có thông tin"}</span>
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
            >
              <span>{getFullAddress(stateUserDetails?.address)}</span>
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
              />
            </Form.Item>

            <Form.Item
              label="Ảnh đại diện"
            >
              {stateUserDetails?.avatar && (
                <img
                  src={stateUserDetails?.avatar}
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
