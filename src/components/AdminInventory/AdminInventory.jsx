import React, { useState, useEffect } from "react";
import { Button, Card, Col, Form, Input, Row, Space, Statistic, Modal, InputNumber, DatePicker, Select, Table, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ShoppingCartOutlined, ProductOutlined, FilterOutlined, CalendarOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as BatchService from "../../services/BatchService";
import * as ProductService from "../../services/ProductService";
import Loading from "../LoadingComponent/Loading";
import * as message from "../Message/Message";
import { useSelector } from "react-redux";
import { WrapperHeader } from "../AdminProduct/style";
import TableComponent from "../TableComponent/TableComponent";
import dayjs from 'dayjs';
import locale from 'antd/es/date-picker/locale/vi_VN';
import { convertPrice } from "../../utils/utils";
const { RangePicker } = DatePicker;

const AdminInventory = () => {
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [isModalManageItemsOpen, setIsModalManageItemsOpen] = useState(false);
  const [isModalAddItemOpen, setIsModalAddItemOpen] = useState(false);
  const [isModalDeleteItemOpen, setIsModalDeleteItemOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [formAddItem] = Form.useForm();
  const user = useSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [productOptions, setProductOptions] = useState([]);
  const [filterForm] = Form.useForm();
  const [filters, setFilters] = useState({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const queryBatches = useQuery({
    queryKey: ["admin-batches", currentPage, pageSize, filters],
    queryFn: () => BatchService.getBatchesPaginated(currentPage, pageSize, user?.access_token, filters),
    enabled: !!user?.access_token && user?.isAdmin && !!currentPage && !!pageSize,
    keepPreviousData: true,
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products-select"],
    queryFn: () => ProductService.getAllProductsForSelect(),
    enabled: !!user?.access_token && user?.isAdmin,
  });

  useEffect(() => {
    if (products) {
      const options = products.map(product => ({
        value: product._id,
        label: product.name,
        disabled: isModalAddOpen 
          ? items.some(item => item.product._id === product._id)
          : selectedBatch?.items.some(item => item.product._id === product._id),
        data: {
          image: product.images && product.images.length > 0 ? product.images[0] : "",
          name: product.name,
          productCode: product.productCode,
          author: product.author || "Không có",
          publicationYear: product.publicationYear || "N/A",
          originalPrice: product.originalPrice || 0,
        }
      }));
      setProductOptions(options);
    }
  }, [products, items, selectedBatch, isModalAddOpen]);

  const mutationCreate = useMutation({
    mutationFn: (data) => BatchService.createBatch(data, user?.access_token),
    onSuccess: () => {
      message.success("Thêm lô hàng thành công");
      queryBatches.refetch();
      setIsModalAddOpen(false);
      formAdd.resetFields();
    },
    onError: (error) => {
      message.error(error.message || "Thêm lô hàng thất bại");
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: ({ id, batchData }) => {
      const formattedData = {
        ...batchData,
        dateReceived: batchData.dateReceived ? 
          (typeof batchData.dateReceived === 'object' && batchData.dateReceived.format ? 
            batchData.dateReceived.format('YYYY-MM-DD HH:mm:ss') : 
            batchData.dateReceived) 
          : undefined
      };
      return BatchService.updateBatch({ id, batchData: formattedData }, user?.access_token);
    },
    onSuccess: () => {
      message.success("Cập nhật lô hàng thành công");
      queryBatches.refetch();
      setIsModalEditOpen(false);
      formEdit.resetFields();
      setSelectedBatch(null);
    },
    onError: (error) => {
      message.error(error.message || "Cập nhật lô hàng thất bại");
    },
  });

  const mutationDelete = useMutation({
    mutationFn: (id) => BatchService.deleteBatch(id, user?.access_token),
    onSuccess: () => {
      message.success("Xóa lô hàng thành công");
      if (currentPage > 1 && queryBatches.data?.batches?.length === 1) {
        setCurrentPage(currentPage - 1);
      }
      queryBatches.refetch();
      setIsModalOpenDelete(false);
    },
    onError: (error) => {
      message.error(error.message || "Xóa lô hàng thất bại");
    },
  });

  const mutationAddItem = useMutation({
    mutationFn: ({ batchId, itemData }) => BatchService.addItemToBatch(batchId, itemData, user?.access_token),
    onSuccess: (data) => {     
      message.success("Thêm sản phẩm vào lô hàng thành công");
      setIsModalAddItemOpen(false);
      formAddItem.resetFields();
      if (selectedBatch) {
        setSelectedBatch(data);
      }
    },
    onError: (error) => {
      message.error(error.message || "Thêm sản phẩm thất bại");
    },
  });

  const mutationRemoveItem = useMutation({
    mutationFn: ({ batchId, itemId }) => BatchService.removeItemFromBatch(batchId, itemId, user?.access_token),
    onSuccess: (data) => {
      message.success("Xóa sản phẩm khỏi lô hàng thành công");
      setIsModalDeleteItemOpen(false);
      setSelectedItem(null);
      if (selectedBatch) {
        setSelectedBatch(data);
      }
    },
    onError: (error) => {
      message.error(error.message || "Xóa sản phẩm thất bại");
    },
  });

  const handleAddBatch = async () => {
    try {
      const values = await formAdd.validateFields();
      const batchData = {
        ...values,
        items: items,
        dateReceived: values.dateReceived.format('YYYY-MM-DD HH:mm:ss')
      };
      mutationCreate.mutate(batchData);
    } catch (error) {
      console.error("Lỗi validation:", error);
    }
  };

  const handleUpdateBatch = async () => {
    try {
      const values = await formEdit.validateFields();
      if (selectedBatch) {
        mutationUpdate.mutate({ id: selectedBatch._id, batchData: values });
      }
    } catch (error) {
      console.error("Lỗi validation:", error);
    }
  };

  const handleAddItemToForm = async () => {
    try {
      const values = await formAddItem.validateFields();
      
                // Tìm sản phẩm đã chọn trong danh sách products
          const selectedProduct = products?.find(product => product._id === values.product);
          
          if (!selectedProduct) {
            message.error("Không tìm thấy thông tin sản phẩm");
            return;
          }

          const newItem = {
            product: {
              _id: selectedProduct._id,
              productCode: selectedProduct.productCode,
              name: selectedProduct.name,
              images: selectedProduct.images,
              originalPrice: selectedProduct.originalPrice,
              author: selectedProduct.author,
              publicationYear: selectedProduct.publicationYear
            },
            importPrice: values.importPrice,
            quantity: values.quantity
          };
      
      if (isModalAddOpen) {
        // Thêm vào form tạo lô hàng mới
        setItems([...items, newItem]);
      } else if (selectedBatch) {
        // Thêm vào lô hàng đã có
        mutationAddItem.mutate({ 
          batchId: selectedBatch._id, 
          itemData: newItem 
        });
      }
      
      formAddItem.resetFields();
      setIsModalAddItemOpen(false);
    } catch (error) {
      console.error("Lỗi validation:", error);
    }
  };

  const handleRemoveFromFormAdd = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleEditBatch = (record) => {
    setSelectedBatch(record);
    formEdit.setFieldsValue({
      supplierName: record.supplierName,
      notes: record.notes,
      dateReceived: dayjs(record.dateReceived)
    });
    setIsModalEditOpen(true);
  };

  const handleManageItems = (record) => {
    setSelectedBatch(record);
    setIsModalManageItemsOpen(true);
  };

  const handleConfirmDelete = (batch) => {
    setSelectedBatch(batch);
    setIsModalOpenDelete(true);
  };

  const handleConfirmDeleteItem = (item) => {
    setSelectedItem(item);
    setIsModalDeleteItemOpen(true);
  };

  const handleDeleteItem = () => {
    if (selectedBatch && selectedItem) {
      mutationRemoveItem.mutate({ 
        batchId: selectedBatch._id, 
        itemId: selectedItem._id 
      });
    }
  };

  const handleTableChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleApplyFilter = async () => {
    try {
      const values = await filterForm.validateFields();
      
      // Xử lý giá trị ngày nếu có
      const formattedFilters = { ...values };
      
      if (values.dateRange) {
        // Kiểm tra từng giá trị trong mảng dateRange
        if (values.dateRange[0]) {
          formattedFilters.startDate = values.dateRange[0].format('YYYY-MM-DD');
        }
        
        if (values.dateRange[1]) {
          formattedFilters.endDate = values.dateRange[1].format('YYYY-MM-DD');
        }
        
        // Xóa trường dateRange vì BE không cần
        delete formattedFilters.dateRange;
      }
      
      setFilters(formattedFilters);
      setCurrentPage(1); // Reset về trang 1 khi lọc
      setIsFilterModalOpen(false);
    } catch (error) {
      console.error("Lỗi validation:", error);
    }
  };

  const handleResetFilter = () => {
    filterForm.resetFields();
  };

  // Nạp giá trị filter vào form khi mở modal
  useEffect(() => {
    if (isFilterModalOpen) {
      const formValues = {...filters};
      
      // Chuyển đổi startDate và endDate thành dateRange nếu có
      if (formValues.startDate || formValues.endDate) {
        formValues.dateRange = [
          formValues.startDate ? dayjs(formValues.startDate) : null,
          formValues.endDate ? dayjs(formValues.endDate) : null
        ];
        
        // Xóa các trường riêng lẻ
        delete formValues.startDate;
        delete formValues.endDate;
      }
      
      filterForm.setFieldsValue(formValues);
    }
  }, [isFilterModalOpen, filters]);

  const columns = [
    {
      title: "Nhà cung cấp",
      dataIndex: "supplierName",
      render: (text) => (
        <div style={{ fontWeight: "bold", color: "#1677ff", fontSize: "16px" }}>{text}</div>
      )
    },
    {
      title: "ID",
      dataIndex: "_id",
      render: (text) => (
        <span style={{ fontSize: '16px', backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{text}</span>
      )
    },
    {
      title: "Thời gian nhập lô",
      dataIndex: "dateReceived",
      render: (text) => (
        <span style={{ color: "black", fontSize: "16px" }}>
          <CalendarOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
          {text ? dayjs(text).format('DD/MM/YYYY HH:mm') : 'Chưa có'}
        </span>
      )
    },
    {
      title: "Tổng giá trị",
      dataIndex: "totalPrice",
      render: (value) => (
        <span style={{ 
          color: "#CD3238",
          fontWeight: "bold",
          fontSize: "16px",
        }}>
          {convertPrice(value)}
        </span>
      )
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      render: (text) => (
        <div style={{ 
          maxHeight: '40px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical',
        }}>
          {text || 'Không có ghi chú'}
        </div>
      )
    },
    {
      title: "Thao tác",
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa thông tin">
            <EditOutlined style={{ color: "orange", fontSize: "25px", cursor: "pointer" }} onClick={() => handleEditBatch(record)} />
          </Tooltip>
          <Tooltip title="Quản lý sản phẩm">
            <ProductOutlined style={{ color: "blue", fontSize: "25px", cursor: "pointer" }} onClick={() => handleManageItems(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined style={{ color: "red", fontSize: "25px", cursor: "pointer" }} onClick={() => handleConfirmDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Định dạng thời gian
  const dateFormat = 'DD/MM/YYYY HH:mm';

  // Custom render option cho Select sản phẩm
  const renderProductOption = (option) => {
    const optionData = option?.data;

    return (
      <div className={`flex py-4 px-4 gap-6 items-center justify-between border-b border-gray-100 hover:bg-gray-50 ${optionData?.disabled ? 'opacity-50 bg-gray-100 cursor-not-allowed' : ''}`}>
        <div className="w-[80px] h-[120px] flex-shrink-0 flex justify-center items-center overflow-hidden rounded bg-gray-100">
          <img src={optionData?.data?.image} alt={option?.label} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-2xl font-bold text-gray-800">{optionData?.data?.name}</div>
          <div className="text-2xl font-bold">Mã sản phẩm: {optionData?.data?.productCode}</div>
          <div className="text-2xl font-bold text-red-500">{convertPrice(optionData?.data?.originalPrice)}</div>
          <div className="flex flex-col text-base text-gray-600">
            <span className="mb-1.5 text-2xl">Tác giả: {optionData?.data?.author}</span>
            <span className="text-2xl">Năm XB: {optionData?.data?.publicationYear}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Loading isLoading={mutationCreate.isPending || mutationUpdate.isPending || mutationDelete.isPending || queryBatches.isLoading}>
      <div>
        <WrapperHeader>Quản lý kho hàng</WrapperHeader>
        <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            style={{
              height: "150px",
              width: "150px",
              borderRadius: "6px",
              borderStyle: "dashed",
            }}
            onClick={() => {
              formAdd.resetFields();
              setIsModalAddOpen(true);
              setItems([]);
            }}
          >
            <PlusOutlined style={{ fontSize: "40px" }} />
          </Button>
          
          <Button 
            type="primary" 
            icon={<FilterOutlined />}
            onClick={() => setIsFilterModalOpen(true)}
            style={{ height: "50px", fontSize: "16px", padding: "0 25px" }}
            size="large"
          >
            Lọc lô hàng
          </Button>
        </div>
        
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <TableComponent
            columns={columns}
            dataSource={queryBatches.data?.batches}
            loading={queryBatches.isLoading}
            bordered
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: queryBatches.data?.total,
              onChange: handleTableChange,
              showTotal: (total) => `Tổng ${total} bản ghi`
            }}
          />
        </div>

        {/* Modal thêm lô hàng mới */}
        <Modal
          title="Thêm lô hàng mới"
          open={isModalAddOpen}
          onCancel={() => {
            setIsModalAddOpen(false);
            formAdd.resetFields();
            setItems([]);
          }}
          onOk={handleAddBatch}
          confirmLoading={mutationCreate.isPending}
          width={1000}
          afterClose={() => {
            setItems([]);
          }}
        >
          <Form form={formAdd} layout="vertical">
            <Form.Item
              label="Nhà cung cấp"
              name="supplierName"
              rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp!" }]}
            >
              <Input placeholder="Nhập tên nhà cung cấp" />
            </Form.Item>

            <Form.Item
              label="Thời gian nhập lô"
              name="dateReceived"
              rules={[{ required: true, message: "Vui lòng chọn thời gian nhập lô!" }]}
              initialValue={dayjs()}
            >
              <DatePicker 
                showTime={{ format: 'HH:mm', defaultValue: dayjs() }}
                format={dateFormat} 
                style={{ width: "30%" }}
                locale={locale}
                placeholder="Chọn ngày và giờ"
              />
            </Form.Item>
            <Form.Item
              label="Ghi chú"
              name="notes"
            >
              <Input.TextArea rows={4} placeholder="Nhập ghi chú" />
            </Form.Item>

            <div style={{ marginBottom: 16 }}>
              <Button type="primary" onClick={() => setIsModalAddItemOpen(true)}>
                Thêm sản phẩm vào lô hàng mới
              </Button>
            </div>

            <Table
              columns={[
                {
                  title: "Ảnh",
                  dataIndex: ["product", "images"],
                  render: (images) => (
                    <div className="w-[60px] h-[90px] flex-shrink-0 flex justify-center items-center overflow-hidden rounded bg-gray-100">
                      <img 
                        src={images?.[0] || ""} 
                        alt="product" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )
                },
                {
                  title: "Mã SP",
                  dataIndex: ["product", "productCode"],
                  render: (text) => text || "N/A"
                },
                {
                  title: "Tên sản phẩm",
                  dataIndex: ["product", "name"],
                  render: (text) => text || "N/A"
                },
                {
                  title: "Đơn giá bán",
                  dataIndex: ["product", "originalPrice"],
                  render: (price) => (
                    <span className="text-2xl font-bold text-red-500">
                      {convertPrice(price) || "N/A"}
                    </span>
                  )
                },
                {
                  title: "Đơn giá nhập",
                  dataIndex: "importPrice",
                  render: (price) => (
                    <span className="text-2xl font-bold text-blue-500">
                      {convertPrice(price) || "N/A"}
                    </span>
                  )
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                },
                {
                  title: "Thao tác",
                  render: (text, record, index) => (
                    <Space size="middle">
                      <DeleteOutlined 
                        style={{ color: "red", fontSize: "25px", cursor: "pointer" }} 
                        onClick={() => handleRemoveFromFormAdd(index)} 
                      />
                    </Space>
                  ),
                },
              ]}
              dataSource={items}
              pagination={false}
            />
          </Form>
        </Modal>

        {/* Modal cập nhật lô hàng */}
        <Modal
          title="Cập nhật lô hàng"
          open={isModalEditOpen}
          onCancel={() => setIsModalEditOpen(false)}
          onOk={handleUpdateBatch}
          confirmLoading={mutationUpdate.isPending}
        >
          <Form form={formEdit} layout="vertical">
            <Form.Item
              label="Nhà cung cấp"
              name="supplierName"
              rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp!" }]}
            >
              <Input placeholder="Nhập tên nhà cung cấp" />
            </Form.Item>

            <Form.Item
              label="Thời gian nhập lô"
              name="dateReceived"
              rules={[{ required: true, message: "Vui lòng chọn thời gian nhập lô!" }]}
            >
              <DatePicker 
                showTime={{ format: 'HH:mm', defaultValue: dayjs() }}
                format={dateFormat} 
                style={{ width: "100%" }}
                locale={locale}
                placeholder="Chọn ngày và giờ"
              />
            </Form.Item>
            <Form.Item
              label="Ghi chú"
              name="notes"
            >
              <Input.TextArea rows={4} placeholder="Nhập ghi chú" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal quản lý sản phẩm trong lô hàng đã tạo */}
        <Modal
          title={`Quản lý sản phẩm - Lô hàng #${selectedBatch?._id}`}
          open={isModalManageItemsOpen}
          onCancel={() => setIsModalManageItemsOpen(false)}
          width={800}
          zIndex={1000}
          footer={[
            <Button key="add" type="primary" onClick={() => {
              formAddItem.resetFields();
              setIsModalAddItemOpen(true);
            }}>
              Thêm sản phẩm vào lô hàng
            </Button>,
            <Button key="close" onClick={() => setIsModalManageItemsOpen(false)}>
              Đóng
            </Button>
          ]}
        >
          <div style={{ marginBottom: '20px', padding: '15px' }}>
            <Statistic 
              title="Tổng giá trị lô hàng" 
              value={selectedBatch?.totalPrice || 0} 
              formatter={value => convertPrice(value)}
              valueStyle={{ color: '#CD3238', fontWeight: 'bold', fontSize: '28px' }}
            />
          </div>
          <Table
            columns={[
              {
                title: "Ảnh",
                dataIndex: ["product", "images"],
                render: (images) => (
                  <div className="w-[60px] h-[90px] flex-shrink-0 flex justify-center items-center overflow-hidden rounded bg-gray-100">
                    <img 
                      src={images?.[0] || ""} 
                      alt="product" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )
              },
              {
                title: "Mã SP",
                dataIndex: ["product", "productCode"],
                render: (text) => text || "N/A"
              },
              {
                title: "Tên sản phẩm",
                dataIndex: ["product", "name"],
                render: (text) => text || "N/A"
              },
              {
                title: "Đơn giá bán",
                dataIndex: ["product", "originalPrice"],
                render: (price) => (
                  <span className="text-2xl font-bold text-red-500">
                    {convertPrice(price) || "N/A"}
                  </span>
                )
              },
              {
                title: "Đơn giá nhập",
                dataIndex: "importPrice",
                render: (price) => (
                  <span className="text-2xl font-bold text-blue-500">
                    {convertPrice(price) || "N/A"}
                  </span>
                )
              },
              {
                title: "Số lượng",
                dataIndex: "quantity",
              },
              {
                title: "Thao tác",
                render: (text, record) => (
                  <Space size="middle">
                    <DeleteOutlined 
                      style={{ color: "red", fontSize: "25px", cursor: "pointer" }} 
                      onClick={() => handleConfirmDeleteItem(record)} 
                    />
                  </Space>
                ),
              },
            ]}
            dataSource={selectedBatch?.items}
            pagination={false}
          />
        </Modal>

        {/* Modal xác nhận xóa lô hàng */}
        <Modal
          title="Xác nhận xóa"
          open={isModalOpenDelete}
          onCancel={() => setIsModalOpenDelete(false)}
          onOk={() => selectedBatch && mutationDelete.mutate(selectedBatch._id)}
          confirmLoading={mutationDelete.isPending}
        >
          <p>Bạn có chắc chắn muốn xóa lô hàng này không?</p>
        </Modal>

        {/* Modal xác nhận xóa sản phẩm khỏi lô hàng */}
        <Modal
          title="Xác nhận xóa sản phẩm"
          open={isModalDeleteItemOpen}
          onCancel={() => {
            setIsModalDeleteItemOpen(false);
            setSelectedItem(null);
          }}
          onOk={handleDeleteItem}
          confirmLoading={mutationRemoveItem.isPending}
        >
          <p>Bạn có chắc chắn muốn xóa sản phẩm "{selectedItem?.product?.name}" khỏi lô hàng không?</p>
        </Modal>

        {/* Modal thêm sản phẩm vào lô hàng */}
        <Modal
          title={isModalAddOpen ? "Thêm sản phẩm vào lô hàng mới" : "Thêm sản phẩm vào lô hàng"}
          open={isModalAddItemOpen}
          onCancel={() => setIsModalAddItemOpen(false)}
          onOk={handleAddItemToForm}
          confirmLoading={!isModalAddOpen && mutationAddItem.isPending}
          width={700}
          zIndex={1500}
        >
          <Form form={formAddItem} layout="vertical">
            <Form.Item
              label="Sản phẩm"
              name="product"
              rules={[{ required: true, message: "Vui lòng chọn sản phẩm!" }]}
            >
              <Select
                loading={isLoadingProducts}
                placeholder="Chọn sản phẩm"
                options={productOptions}
                optionRender={renderProductOption}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                listHeight={500}
                style={{ width: '100%' }}
                dropdownStyle={{ minWidth: '550px' }}
                disabled={isModalAddOpen && items.length >= 10}
                optionFilterProp="label"
                notFoundContent="Không tìm thấy sản phẩm"
              />
            </Form.Item>
            <Form.Item
              label="Đơn giá nhập"
              name="importPrice"
              rules={[{ required: true, message: "Vui lòng nhập giá nhập vào!" }]}
            >
              <InputNumber 
                style={{width: '40%', fontSize: '18px'}}
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                addonAfter={<span style={{color: '#CD3238', fontWeight: 'bold', fontSize: '18px'}}>VNĐ</span>}
              />
            </Form.Item>
            <Form.Item
              label="Số lượng"
              name="quantity"
              rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
            >
              <InputNumber min={1} style={{ width: '30%', fontSize: '18px' }} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal lọc lô hàng */}
        <Modal
          title="Lọc lô hàng"
          open={isFilterModalOpen}
          onCancel={() => setIsFilterModalOpen(false)}
          footer={[
            <Button key="reset" onClick={handleResetFilter}>
              Đặt lại
            </Button>,
            <Button key="submit" type="primary" onClick={handleApplyFilter}>
              Áp dụng
            </Button>,
          ]}
          initialValues={filters}
        >
          <Form form={filterForm} layout="vertical">
            <Form.Item label="Nhà cung cấp" name="supplierName">
              <Input placeholder="Nhập tên nhà cung cấp" />
            </Form.Item>
            <Form.Item label="Mã lô hàng" name="batchId">
              <Input placeholder="Nhập mã lô hàng" />
            </Form.Item>
            <Form.Item label="Khoảng thời gian nhập lô" name="dateRange">
              <RangePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY" 
                locale={locale}
                placeholder={["Từ ngày", "Đến ngày"]}
                allowEmpty={[true, true]}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Loading>
  );
};

export default AdminInventory; 