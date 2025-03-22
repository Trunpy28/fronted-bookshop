import React, { useEffect, useState } from "react";
import { WrapperHeader } from "./style";
import {
  Button, Card, Col, Form, Input, Row, Select, Space, Statistic, InputNumber, Upload,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
} from "@ant-design/icons";
import TableComponent from "../TableComponent/TableComponent";
import InputComponent from "../InputComponent/InputComponent";
import { convertPrice } from "../../utils";
import * as ProductService from "../../services/ProductService";
import * as GenreService from "../../services/GenreService";
import { useMutation, useQuery } from "@tanstack/react-query";
import Loading from "../LoadingComponent/Loading";
import * as message from "../../components/Message/Message";
import DrawerComponent from "../DrawerComponent/DrawerComponent";
import { useSelector } from "react-redux";
import ModalComponent from "../ModalComponent/ModalComponent";
import CountUp from "react-countup";
import RichTextEditor from "../RichTextEditor/RichTextEditor";

const AdminProduct = () => {
  // State đã tinh gọn
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelected, setRowSelected] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [fileList, setFileList] = useState([]);

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const user = useSelector((state) => state?.user);

  // Queries và Mutations
  const queryProduct = useQuery({
    queryKey: ["products", currentPage, pageSize],
    queryFn: () => ProductService.getProductsPaginated(currentPage, pageSize),
    keepPreviousData: true,
  });

  const queryGenres = useQuery({
    queryKey: ["genres"],
    queryFn: () => GenreService.getAllGenres()
  });

  const mutation = useMutation({
    mutationFn: (data) => ProductService.createProduct(data, user?.access_token),
    onSuccess: () => {
      message.success("Thêm sản phẩm thành công");
      handleCancel();
      queryProduct.refetch();
    },
    onError: () => {
      message.error("Thêm sản phẩm thất bại");
    }
  });

  const mutationUpdate = useMutation({
    mutationFn: (data) => {
      const { id, token, formData } = data;
      return ProductService.updateProduct(id, token, formData);
    },
    onSuccess: () => {
      message.success("Cập nhật sản phẩm thành công");
      handleCloseDrawer();
      queryProduct.refetch();
    },
    onError: () => {
      message.error("Cập nhật sản phẩm thất bại");
    }
  });

  const mutationDeleted = useMutation({
    mutationFn: (data) => {
      const { id, token } = data;
      return ProductService.deleteProduct(id, token);
    },
    onSuccess: () => {
      message.success("Xóa sản phẩm thành công");
      handleCancelDelete();
      queryProduct.refetch();
    },
    onError: () => {
      message.error("Xóa sản phẩm thất bại");
    }
  });

  // Xử lý form thêm mới
  const handleOpenAddForm = () => {
    setFileList([]);
    createForm.resetFields();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setFileList([]);
    createForm.resetFields();
    setIsModalOpen(false);
  };

  // Xử lý form cập nhật
  const handleDetailsProduct = async (id) => {
    setIsLoading(true);
    setRowSelected(id);
    
    try {
      const res = await ProductService.getDetailsProduct(id);
      if (res?.data) {
        updateForm.setFieldsValue({
          name: res.data.name,
          genre: res.data.genre?._id,
          description: res.data.description,
          author: res.data.author,
          publisher: res.data.publisher,
          originalPrice: res.data.originalPrice,
          publicationYear: res.data.publicationYear,
          weight: res.data.weight,
          dimensions: res.data.dimensions,
          pageCount: res.data.pageCount,
          format: res.data.format
        });
         
        setFileList([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsOpenDrawer(true);
    }
  };
  
  const handleCloseDrawer = () => {
    setFileList([]);
    updateForm.resetFields();
    setIsOpenDrawer(false);
  };

  // Xử lý upload hình ảnh
  const handleChangeUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Xử lý xóa sản phẩm
  const handleOpenDeleteModal = (id) => {
    setRowSelected(id);
    setIsModalOpenDelete(true);
  };

  const handleCancelDelete = () => {
    setIsModalOpenDelete(false);
  };

  const handleDeleteProduct = () => {
    mutationDeleted.mutate({ id: rowSelected, token: user?.access_token });
  };

  // Xử lý submit form
  const onFinishCreate = (values) => {
    const formData = new FormData();
    
    Object.keys(values).forEach(key => {
      if (key !== 'images') {
        formData.append(key, values[key]);
      }
    });
    
    if (fileList && fileList.length > 0) {
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });
    }

    mutation.mutate(formData);
  };

  const onFinishUpdate = (values) => {
    const formData = new FormData();
    
    Object.keys(values).forEach(key => {
      if (key !== 'images') {
        formData.append(key, values[key]);
      }
    });
    
    if (fileList && fileList.length > 0) {
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });
    }

    mutationUpdate.mutate({
      id: rowSelected,
      token: user?.access_token,
      formData
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Không thành công:", errorInfo);
  };

  const { data: genres } = queryGenres;

  const columns = [
    {
      title: "Tên sách",
      dataIndex: "name",
      render: (text) => <a>{text}</a>
    },
    {
      title: "Giá bìa",
      dataIndex: "originalPrice",
      render: (text) => (
        <span style={{ color: "green", fontWeight: "bold" }}>{convertPrice(text)}</span>
      )
    },
    {
      title: "Thể loại",
      dataIndex: "genre",
      render: (text, record) => {
        const genre = genres?.data?.find(g => g._id === record.genre);
        return genre?.name || '';
      }
    },
    {
      title: "Tác giả",
      dataIndex: "author"
    },
    {
      title: "Nhà xuất bản",
      dataIndex: "publisher"
    },
    {
      title: "Số lượng",
      dataIndex: "countInStock"
    },
    {
      title: "Thao tác",
      render: (text, record) => (
        <Space size="middle">
          <EditOutlined
            style={{ color: "orange", fontSize: "30px", cursor: "pointer" }}
            onClick={() => handleDetailsProduct(record._id)}
          />
          <DeleteOutlined
            style={{ color: "red", fontSize: "30px", cursor: "pointer" }}
            onClick={() => handleOpenDeleteModal(record._id)}
          />
        </Space>
      ),
    }
  ];

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div>
      <WrapperHeader>Quản lý sản phẩm</WrapperHeader>
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          style={{
            height: "150px",
            width: "150px",
            borderRadius: "6px",
            borderStyle: "dashed",
          }}
          onClick={handleOpenAddForm}
        >
          <PlusOutlined style={{ fontSize: "40px" }} />
        </Button>
        <Row gutter={40} style={{ width: "40vw" }}>
          <Col span={10}>
            <Card style={{ border: "1px solid #00B55F" }}>
              <Statistic
                title="Số sản phẩm"
                value={queryProduct.data?.total}
                formatter={(value) => (
                  <CountUp
                    end={value}
                    separator="."
                    style={{ color: "green", fontWeight: "bold" }}
                  />
                )}
              />
            </Card>
          </Col>
          <Col span={10}>
            <Card style={{ border: "1px solid red" }}>
              <Statistic
                title="Số thể loại"
                value={genres?.data?.length}
                formatter={(value) => (
                  <CountUp
                    end={value}
                    separator="."
                    style={{ color: "green", fontWeight: "bold" }}
                  />
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <div style={{ marginTop: "20px" }}>
        <TableComponent
          columns={columns}
          dataSource={queryProduct.data?.products}
          loading={queryProduct.isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: queryProduct.data?.total,
            onChange: handleTableChange,
          }}
          onRow={(record) => {
            return {
              onClick: () => {
                setRowSelected(record._id);
              },
            };
          }}
        />
      </div>

      {/* Modal thêm mới */}
      <ModalComponent
        forceRender
        title="Tạo sản phẩm"
        open={isModalOpen}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Loading isLoading={mutation.isPending}>
          <Form
            form={createForm}
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onFinishCreate}
            onFinishFailed={onFinishFailed}
            autoComplete="on"
          >
            <Form.Item
              label="Tên sách"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên sách!" }]}
            >
              <InputComponent name="name" />
            </Form.Item>

            <Form.Item
              label="Thể loại"
              name="genre"
              rules={[{ required: true, message: "Vui lòng chọn thể loại!" }]}
            >
              <Select
                placeholder="Chọn thể loại"
                options={genres?.data?.map((genre) => ({
                  label: genre.name,
                  value: genre._id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Tác giả"
              name="author"
              rules={[{ required: true, message: "Vui lòng nhập tên tác giả!" }]}
            >
              <InputComponent name="author" />
            </Form.Item>

            <Form.Item
              label="Nhà xuất bản"
              name="publisher"
              rules={[{ required: true, message: "Vui lòng nhập tên nhà xuất bản!" }]}
            >
              <InputComponent name="publisher" />
            </Form.Item>

            <Form.Item
              label="Giá bìa"
              name="originalPrice"
              rules={[{ required: true, message: "Vui lòng nhập giá bìa!" }]}
            >
              <InputNumber
                style={{width: '40%'}}
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                addonAfter={<span style={{color: '#CD3238', fontWeight: 'bold'}}>VNĐ</span>}
              />
            </Form.Item>

            <Form.Item
              label="Ảnh"
              name="images"
              rules={[
                { 
                  required: true, 
                  message: "Vui lòng chọn ảnh!",
                  validator: () => {
                    if (fileList && fileList.length > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Vui lòng chọn ảnh!');
                  }
                }
              ]}
            >
              <Upload 
                onChange={handleChangeUpload}
                fileList={fileList}
                multiple={true}
                listType="picture-card"
                beforeUpload={() => false}
                showUploadList={{ showError: false }}
                onError={() => {}}
              >
                {(fileList?.length || 0) < 5 && 
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                  </div>
                }
              </Upload>
            </Form.Item>

            <Form.Item
              label="Năm xuất bản"
              name="publicationYear"
              rules={[{ required: true, message: "Vui lòng nhập năm xuất bản!" }]}
            >
              <InputNumber
                style={{width: '30%'}}
                min={0}
              />
            </Form.Item>

            <Form.Item
              label="Trọng lượng"
              name="weight"
            >
              <InputComponent name="weight" />
            </Form.Item>

            <Form.Item
              label="Kích thước bao bì"
              name="dimensions"
            >
              <InputComponent name="dimensions" />
            </Form.Item>

            <Form.Item
              label="Số trang"
              name="pageCount"
              rules={[{ required: true, message: "Vui lòng nhập số trang!" }]}
            >
              <InputNumber
                style={{width: '30%'}}
                min={0}
              />
            </Form.Item>

            <Form.Item
              label="Hình thức"
              name="format"
            >
              <InputComponent name="format" />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <RichTextEditor />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={mutation.isPending}>
                Tạo sản phẩm
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </ModalComponent>

      {/* Drawer chỉnh sửa */}
      <DrawerComponent
        title="Chi tiết sản phẩm"
        isOpen={isOpenDrawer}
        onClose={handleCloseDrawer}
        width="50%"
      >
        <Loading isLoading={isLoading || mutationUpdate.isPending}>
          <Form
            form={updateForm}
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onFinishUpdate}
            autoComplete="on"
          >
            <Form.Item
              label="Tên sách"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên sách!" }]}
            >
              <InputComponent name="name" />
            </Form.Item>

            <Form.Item
              label="Thể loại"
              name="genre"
              rules={[{ required: true, message: "Vui lòng chọn thể loại!" }]}
            >
              <Select
                placeholder="Chọn thể loại"
                options={genres?.data?.map((genre) => ({
                  label: genre.name,
                  value: genre._id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Tác giả"
              name="author"
              rules={[{ required: true, message: "Vui lòng nhập tên tác giả!" }]}
            >
              <InputComponent name="author" />
            </Form.Item>

            <Form.Item
              label="Nhà xuất bản"
              name="publisher"
              rules={[{ required: true, message: "Vui lòng nhập tên nhà xuất bản!" }]}
            >
              <InputComponent name="publisher" />
            </Form.Item>

            <Form.Item
              label="Giá bìa"
              name="originalPrice"
              rules={[{ required: true, message: "Vui lòng nhập giá bìa!" }]}
            >
              <InputNumber
                style={{width: '40%'}}
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                addonAfter={<span style={{color: '#CD3238', fontWeight: 'bold'}}>VNĐ</span>}
              />
            </Form.Item>

            <Form.Item
              label="Ảnh"
              name="images"
            >
              <Upload 
                onChange={handleChangeUpload}
                fileList={fileList}
                multiple={true}
                listType="picture-card"
                beforeUpload={() => false}
                showUploadList={{ showError: false }}
                onError={() => {}}
              >
                {(fileList?.length || 0) < 5 && 
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Chọn ảnh mới</div>
                  </div>
                }
              </Upload>
              <div style={{marginTop: 8, color: '#999'}}>
                * Nếu bạn thêm ảnh mới, tất cả ảnh cũ sẽ bị thay thế
              </div>
            </Form.Item>

            <Form.Item
              label="Năm xuất bản"
              name="publicationYear"
              rules={[{ required: true, message: "Vui lòng nhập năm xuất bản!" }]}
            >
              <InputNumber
                style={{width: '30%'}}
                min={0}
              />
            </Form.Item>

            <Form.Item
              label="Trọng lượng"
              name="weight"
            >
              <InputComponent name="weight" />
            </Form.Item>

            <Form.Item
              label="Kích thước bao bì"
              name="dimensions"
            >
              <InputComponent name="dimensions" />
            </Form.Item>

            <Form.Item
              label="Số trang"
              name="pageCount"
              rules={[{ required: true, message: "Vui lòng nhập số trang!" }]}
            >
              <InputNumber
                style={{width: '30%'}}
                min={0}
              />
            </Form.Item>

            <Form.Item
              label="Hình thức"
              name="format"
            >
              <InputComponent name="format" />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <RichTextEditor />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={mutationUpdate.isPending}>
                Cập nhật sản phẩm
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </DrawerComponent>

      <ModalComponent
        title="Xóa sản phẩm"
        open={isModalOpenDelete}
        onCancel={handleCancelDelete}
        onOk={handleDeleteProduct}
        confirmLoading={mutationDeleted.isPending}
      >
        <Loading isLoading={mutationDeleted.isPending}>
          <div>Bạn có chắc muốn xóa sản phẩm này không?</div>
        </Loading>
      </ModalComponent>
    </div>
  );
};

export default AdminProduct;
