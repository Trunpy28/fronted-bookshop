import React, { useState, useEffect } from "react";
import { Button, Card, Col, Form, Input, Row, Space, Statistic, Table, Modal, InputNumber, Select, Image } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as InventoryService from "../../services/InventoryService";
import * as ProductService from "../../services/ProductService";
import * as BatchService from "../../services/BatchService";
import Loading from "../LoadingComponent/Loading";
import * as message from "../../components/Message/Message";
import { useSelector } from "react-redux";
import { WrapperHeader } from "../AdminProduct/style";
import TableComponent from "../TableComponent/TableComponent";
import { timeTranform, convertPrice } from "../../utils";

const AdminInventory = () => {
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();
  const user = useSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [productOptions, setProductOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  
  // Queries
  const queryInventories = useQuery({
    queryKey: ["inventories", currentPage, pageSize],
    queryFn: () => InventoryService.getInventoriesPaginated(currentPage, pageSize, user?.access_token),
    enabled: !!user?.access_token,
    keepPreviousData: true,
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products-select"],
    queryFn: () => ProductService.getAllProductsForSelect(),
    enabled: !!user?.access_token,
  });

  const { data: batches, isLoading: isLoadingBatches } = useQuery({
    queryKey: ["batches-select"],
    queryFn: () => BatchService.getAllBatches(user?.access_token),
    enabled: !!user?.access_token,
  });

  // Cập nhật productOptions khi products thay đổi
  useEffect(() => {
    if (products) {   
      const options = products.map(product => ({
        value: product._id,
        label: product.name,
        data: {
          image: product.images && product.images.length > 0 ? product.images[0] : "",
          name: product.name,
          author: product.author || "Không có",
          year: product.publicationYear || "N/A",
          price: product.originalPrice || 0,
        }
      }));
      setProductOptions(options);
    }
  }, [products]);

  // Cập nhật batchOptions khi batches thay đổi
  useEffect(() => {
    if (batches) {
      const options = batches.map(batch => {
        const dateReceived = batch.dateReceived ? timeTranform(batch.dateReceived) : "N/A";
        return {
          label: `#${batch._id} - Thời gian nhập lô: ${dateReceived}`,
          value: batch._id,
        };
      });
      setBatchOptions(options);
    }
  }, [batches]);

  const mutationCreate = useMutation({
    mutationFn: (data) => InventoryService.addInventory(data, user?.access_token),
    onSuccess: () => {
      message.success("Thêm kho hàng thành công");
      queryInventories.refetch();
      setIsModalAddOpen(false);
      formAdd.resetFields();
    },
    onError: (error) => {
      message.error(error.message || "Thêm kho hàng thất bại");
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: ({ id, data }) => InventoryService.updateInventory(id, data, user?.access_token),
    onSuccess: () => {
      message.success("Cập nhật kho hàng thành công");
      queryInventories.refetch();
      setIsModalEditOpen(false);
      formEdit.resetFields();
      setSelectedInventory(null);
    },
    onError: (error) => {
      message.error(error.message || "Cập nhật kho hàng thất bại");
    },
  });

  const mutationDelete = useMutation({
    mutationFn: (id) => InventoryService.deleteInventory(id, user?.access_token),
    onSuccess: () => {
      message.success("Xóa kho hàng thành công");
      queryInventories.refetch();
      setIsModalOpenDelete(false);
    },
    onError: (error) => {
      message.error(error.message || "Xóa kho hàng thất bại");
    },
  });

  const handleAddInventory = async () => {
    try {
      const values = await formAdd.validateFields();
      mutationCreate.mutate(values);
    } catch (error) {
      console.error("Lỗi validation:", error);
    }
  };

  const handleUpdateInventory = async () => {
    try {
      const values = await formEdit.validateFields();
      if (selectedInventory) {
        mutationUpdate.mutate({ id: selectedInventory._id, data: values });
      }
    } catch (error) {
      console.error("Lỗi validation:", error);
    }
  };

  const handleEditInventory = (record) => {
    setSelectedInventory(record);
    formEdit.setFieldsValue({
      product: record.product?._id,
      batch: record.batch?._id,
      quantity: record.quantity
    });
    setIsModalEditOpen(true);
  };

  const handleConfirmDelete = (inventory) => {
    setSelectedInventory(inventory);
    setIsModalOpenDelete(true);
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: ["product", "name"],
      render: (text) => text || "N/A"
    },
    {
      title: "Lô hàng",
      dataIndex: ["batch", "_id"],
      render: (text) => `#${text || "N/A"}`
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      render: (date) => timeTranform(date)
    },
    {
      title: "Thao tác",
      render: (text, record) => (
        <Space size="middle">
          <EditOutlined style={{ color: "orange", fontSize: "25px", cursor: "pointer" }} onClick={() => handleEditInventory(record)} />
          <DeleteOutlined style={{ color: "red", fontSize: "25px", cursor: "pointer" }} onClick={() => handleConfirmDelete(record)} />
        </Space>
      ),
    },
  ];

  // Custom render option cho Select sản phẩm
  const renderProductOption = (option) => {
    const optionData = option?.data;

    return (
    <div className="flex py-4 px-4 gap-6 items-center justify-between border-b border-gray-100 hover:bg-gray-50">
      <div className="w-[80px] h-[120px] flex-shrink-0 flex justify-center items-center overflow-hidden rounded bg-gray-100">
        <img src={optionData?.data?.image} alt={option?.label} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col gap-3">
        <div className="text-2xl font-bold text-gray-800">{optionData?.data?.name}</div>
        <div className="text-2xl font-bold text-red-500">{convertPrice(optionData?.data?.price)}</div>
        <div className="flex flex-col text-base text-gray-600">
          <span className="mb-1.5 text-2xl">Tác giả: {optionData?.data?.author}</span>
          <span className="text-2xl">Năm XB: {optionData?.data?.year}</span>
        </div>
      </div>
    </div>
  );
}
  
  return (
    <Loading isLoading={mutationCreate.isPending || mutationUpdate.isPending || mutationDelete.isPending || queryInventories.isLoading}>
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
            }}
          >
            <PlusOutlined style={{ fontSize: "40px" }} />
          </Button>
          <Row gutter={40} style={{ width: "40vw" }}>
            <Col span={12}>
              <Card style={{ border: "1px solid #00B55F" }}>
                <Statistic title="Số mục kho hàng" value={queryInventories.data?.total || 0} />
              </Card>
            </Col>
          </Row>
        </div>
        
        <div style={{ marginTop: "20px" }}>
          <TableComponent
            columns={columns}
            dataSource={queryInventories.data?.inventories}
            loading={queryInventories.isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: queryInventories.data?.total,
              onChange: handleTableChange,
            }}
          />
        </div>

        {/* Modal thêm mới kho hàng */}
        <Modal
          title="Thêm kho hàng mới"
          open={isModalAddOpen}
          onCancel={() => setIsModalAddOpen(false)}
          onOk={handleAddInventory}
          confirmLoading={mutationCreate.isPending}
          width={700}
        >
          <Form form={formAdd} layout="vertical">
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
              />
            </Form.Item>
            <Form.Item
              label="Lô hàng"
              name="batch"
              rules={[{ required: true, message: "Vui lòng chọn lô hàng!" }]}
            >
              <Select
                loading={isLoadingBatches}
                placeholder="Chọn lô hàng"
                options={batchOptions}
              />
            </Form.Item>
            <Form.Item
              label="Số lượng"
              name="quantity"
              rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal chỉnh sửa kho hàng */}
        <Modal
          title="Cập nhật kho hàng"
          open={isModalEditOpen}
          onCancel={() => setIsModalEditOpen(false)}
          onOk={handleUpdateInventory}
          confirmLoading={mutationUpdate.isPending}
          width={700}
        >
          <Form form={formEdit} layout="vertical">
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
              />
            </Form.Item>
            <Form.Item
              label="Lô hàng"
              name="batch"
              rules={[{ required: true, message: "Vui lòng chọn lô hàng!" }]}
            >
              <Select
                loading={isLoadingBatches}
                placeholder="Chọn lô hàng"
                options={batchOptions}
              />
            </Form.Item>
            <Form.Item
              label="Số lượng"
              name="quantity"
              rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Xác nhận xóa"
          open={isModalOpenDelete}
          onCancel={() => setIsModalOpenDelete(false)}
          onOk={() => selectedInventory && mutationDelete.mutate(selectedInventory._id)}
          confirmLoading={mutationDelete.isPending}
        >
          <p>Bạn có chắc chắn muốn xóa kho hàng này không?</p>
        </Modal>
      </div>
    </Loading>
  );
};

export default AdminInventory; 