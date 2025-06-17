import React, { useEffect, useState } from "react";
import { WrapperHeader } from "./style";
import {
  Button, Card, Col, Form, Input, Row, Select, Space, Statistic, InputNumber, Upload,
  Tooltip, Modal, Tag,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined,
  BookOutlined,
} from "@ant-design/icons";
import TableComponent from "../TableComponent/TableComponent";
import InputComponent from "../InputComponent/InputComponent";
import { convertPrice } from "../../utils/utils";
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
import ProductDetailModal from '../ProductDetailModal/ProductDetailModal';

const AdminProduct = () => {
  // State đã tinh gọn
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelected, setRowSelected] = useState("");
  const [fileList, setFileList] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // State cho phân trang và lọc
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // State lưu các bộ lọc
  const [filters, setFilters] = useState({
    productCode: '',
    name: '',
    genres: [],
    author: '',
    publisher: ''
  });
  
  // Modal lọc sản phẩm
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [searchForm] = Form.useForm();

  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const user = useSelector((state) => state?.user);

  // Queries và Mutations
  const queryProduct = useQuery({
    queryKey: ["products", pagination.current, pagination.pageSize, filters],
    queryFn: () => {
      const options = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      return ProductService.getProductsPaginated(options, user?.access_token);
    },
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
    onError: (error) => {
      message.error(error.response.data.message);
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
    onError: (error) => {
      message.error(error.response.data.message);
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
    onError: (error) => {
      message.error(error.response.data.message);
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
          productCode: res.data.productCode,
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

  const { data: genres } = queryGenres;

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  // Handler cho thay đổi trang
  const handlePaginationChange = (pagination) => {
    setPagination({
      ...pagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };
  
  // Handler cho việc áp dụng bộ lọc
  const handleApplyFilters = (values) => {
    const cleanedFilters = {};
    
    // Chỉ thêm các trường không rỗng vào filters
    if (values.productCode && values.productCode.trim() !== '') 
      cleanedFilters.productCode = values.productCode.trim();
    
    if (values.name && values.name.trim() !== '') 
      cleanedFilters.name = values.name.trim();
    
    if (values.genres && values.genres.length > 0) 
      cleanedFilters.genres = values.genres;
    
    if (values.author && values.author.trim() !== '') 
      cleanedFilters.author = values.author.trim();
    
    if (values.publisher && values.publisher.trim() !== '') 
      cleanedFilters.publisher = values.publisher.trim();
    
    setFilters(cleanedFilters);
    setPagination({
      ...pagination,
      current: 1,
    });
    setIsFilterModalVisible(false);
  };
  
  // Handler reset bộ lọc
  const handleResetFilters = () => {
    searchForm.setFieldsValue({
      productCode: '',
      name: '',
      genres: [],
      author: '',
      publisher: ''
    });
  };
  
  // Khi mở modal, set giá trị form từ filters hiện tại
  useEffect(() => {
    if (isFilterModalVisible) {
      searchForm.setFieldsValue(filters);
    }
  }, [isFilterModalVisible]);

  // Cập nhật tổng số bản ghi từ response
  useEffect(() => {
    if (queryProduct.data?.pagination) {
      setPagination({
        ...pagination,
        total: queryProduct.data.pagination.total || 0,
      });
    }
  }, [queryProduct.data]);

  const columns = [
    {
      title: "Mã hàng",
      dataIndex: "productCode",
      render: (text) => (
        <span style={{ fontSize: '14px', backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{text}</span>
      )
    },
    {
      title: "Tên sách",
      dataIndex: "name",
      render: (text) => (
        <div style={{ fontWeight: "bold", color: "#1677ff", fontSize: "15px" }}>{text}</div>
      )
    },
    {
      title: "Giá bán",
      dataIndex: "originalPrice",
      render: (text) => (
        <div style={{ 
          color: "#f5222d", 
          fontWeight: "bold", 
          fontSize: "16px",
        }}>
          {convertPrice(text)}
        </div>
      )
    },
    {
      title: "Thể loại",
      dataIndex: "genre",
      render: (genre) => (
        <Tag color="blue" style={{ fontSize: '14px', padding: '2px 6px' }}>
          <BookOutlined style={{ marginRight: '6px' }} />
          {genre?.name || 'Chưa phân loại'}
        </Tag>
      )
    },
    {
      title: "Tác giả",
      dataIndex: "author"
    },
    {
      title: "Nhà xuất bản",
      dataIndex: "publisher",
    },
    {
      title: "Số lượng",
      dataIndex: "countInStock",
      render: (count) => (
        <div style={{ 
          backgroundColor: count > 0 ? "#f6ffed" : "#fff2f0", 
          color: count > 0 ? "#52c41a" : "#f5222d",
          fontWeight: "bold",
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: "10px",
          fontSize: "14px",
          border: count > 0 ? "1px solid #b7eb8f" : "1px solid #ffccc7",
          minWidth: "60px",
          textAlign: "center"
        }}>
          {count || 0}
        </div>
      )
    },
    {
      title: "Thao tác",
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              style={{ color: "blue", fontSize: "30px", cursor: "pointer" }}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa thông tin">
            <EditOutlined
              style={{ color: "orange", fontSize: "30px", cursor: "pointer" }}
              onClick={() => handleDetailsProduct(record._id)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: "red", fontSize: "30px", cursor: "pointer" }}
              onClick={() => handleOpenDeleteModal(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    }
  ];

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

        <Button 
          type="primary" 
          icon={<SearchOutlined />}
          onClick={() => setIsFilterModalVisible(true)}
          style={{ height: "50px", fontSize: "16px", padding: "0 25px" }}
          size="large"
        >
          Lọc sản phẩm
        </Button>
      </div>

      {/* Bảng dữ liệu */}
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <TableComponent
          columns={columns}
          dataSource={queryProduct.data?.data}
          loading={queryProduct.isLoading}
          bordered
          pagination={{
            ...pagination,
            pageSizeOptions: [10, 20, 50, 100],
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`
          }}
          onChange={handlePaginationChange}
          onRow={(record) => {
            return {
              onClick: () => {
                setRowSelected(record._id);
              },
            };
          }}
        />
      </div>

      {/* Modal lọc sản phẩm */}
      <Modal
        title="Lọc sản phẩm"
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
              <Form.Item name="productCode" label="Mã hàng">
                <Input placeholder="Nhập mã hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="Tên sách">
                <Input placeholder="Nhập tên sách" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="genres" label="Thể loại">
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Chọn thể loại"
                  options={genres?.data?.map((genre) => ({
                    label: genre.name,
                    value: genre._id,
                  }))}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="author" label="Tác giả">
                <Input placeholder="Nhập tên tác giả" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="publisher" label="Nhà xuất bản">
                <Input placeholder="Nhập tên nhà xuất bản" />
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
            autoComplete="on"
          >
            <Form.Item
              label="Mã hàng"
              name="productCode"
              rules={[{ required: true, message: "Vui lòng nhập mã hàng!" }]}
            >
              <InputComponent name="productCode" />
            </Form.Item>
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
              label="Giá bán"
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
                accept="image/*"
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                </div>
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
        title="Cập nhật sản phẩm"
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
              label="Mã hàng"
              name="productCode"
              rules={[{ required: true, message: "Vui lòng nhập mã hàng!" }]}
            >
              <InputComponent name="productCode" />
            </Form.Item>
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
              label="Giá bán"
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
                accept="image/*"
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Chọn ảnh mới</div>
                </div>
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

      <ProductDetailModal
        product={selectedProduct}
        visible={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        genres={genres}
      />
    </div>
  );
};

export default AdminProduct;
