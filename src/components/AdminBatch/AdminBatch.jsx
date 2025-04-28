import React, { useState } from "react";
import { Button, Card, Col, Form, Input, Row, Space, Statistic, Modal, InputNumber, DatePicker } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as BatchService from "../../services/BatchService";
import Loading from "../LoadingComponent/Loading";
import * as message from "../../components/Message/Message";
import { useSelector } from "react-redux";
import { WrapperHeader } from "../AdminProduct/style";
import TableComponent from "../TableComponent/TableComponent";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import locale from 'antd/es/date-picker/locale/vi_VN';

const AdminBatch = () => {
  const navigate = useNavigate();
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();
  const user = useSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryBatches = useQuery({
    queryKey: ["admin-batches", currentPage, pageSize],
    queryFn: () => BatchService.getBatchesPaginated(currentPage, pageSize, user?.access_token),
    enabled: !!user?.access_token && user?.isAdmin && !!currentPage && !!pageSize,
    keepPreviousData: true,
  });

  const mutationCreate = useMutation({
    mutationFn: (data) => {
      const formattedData = {
        ...data,
        dateReceived: data.dateReceived ? data.dateReceived.format('YYYY-MM-DD HH:mm:ss') : undefined
      };
      return BatchService.createBatch(formattedData, user?.access_token);
    },
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
      // Chuyển đổi đối tượng moment thành string nếu có
      const formattedData = {
        ...batchData,
        dateReceived: batchData.dateReceived ? 
          (batchData.dateReceived.format ? batchData.dateReceived.format('YYYY-MM-DD HH:mm:ss') : batchData.dateReceived) 
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

  const handleAddBatch = async () => {
    try {
      const values = await formAdd.validateFields();
      mutationCreate.mutate(values);
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

  const handleEditBatch = (record) => {
    setSelectedBatch(record);
    formEdit.setFieldsValue({
      supplierName: record.supplierName,
      discountPercentage: record.discountPercentage,
      notes: record.notes,
      dateReceived: record.dateReceived ? dayjs(record.dateReceived) : undefined
    });
    setIsModalEditOpen(true);
  };

  const handleConfirmDelete = (batch) => {
    setSelectedBatch(batch);
    setIsModalOpenDelete(true);
  };

  const handleTableChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const columns = [
    {
      title: "Nhà cung cấp",
      dataIndex: "supplierName",
    },
    {
      title: "ID",
      dataIndex: "_id",
    },
    {
      title: "Thời gian nhập lô",
      dataIndex: "dateReceived",
      render: (text) => text ? dayjs(text).format('DD/MM/YYYY HH:mm') : 'Chưa có',
    },
    {
      title: "Chiết khấu (%)",
      dataIndex: "discountPercentage",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
    },
    {
      title: "Thao tác",
      render: (text, record) => (
        <Space size="middle">
          <EditOutlined style={{ color: "orange", fontSize: "25px", cursor: "pointer" }} onClick={() => handleEditBatch(record)} />
          <DeleteOutlined style={{ color: "red", fontSize: "25px", cursor: "pointer" }} onClick={() => handleConfirmDelete(record)} />
        </Space>
      ),
    },
  ];

  // Định dạng thời gian
  const dateFormat = 'DD/MM/YYYY HH:mm';

  return (
    <Loading isLoading={mutationCreate.isPending || mutationUpdate.isPending || mutationDelete.isPending || queryBatches.isLoading}>
      <div>
        <WrapperHeader>Quản lý lô hàng</WrapperHeader>
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
                <Statistic title="Số lô hàng" value={queryBatches.data?.total || 0} />
              </Card>
            </Col>
          </Row>
        </div>
        
        <div style={{ marginTop: "20px" }}>
          <TableComponent
            columns={columns}
            dataSource={queryBatches.data?.batches}
            loading={queryBatches.isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: queryBatches.data?.total,
              onChange: handleTableChange,
            }}
          />
        </div>

        <Modal
          title="Thêm lô hàng mới"
          open={isModalAddOpen}
          onCancel={() => setIsModalAddOpen(false)}
          onOk={handleAddBatch}
          confirmLoading={mutationCreate.isPending}
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
              label="Chiết khấu (%)"
              name="discountPercentage"
              initialValue={0}
              rules={[
                { required: true, message: "Vui lòng nhập phần trăm chiết khấu!" },
                () => ({
                  validator(_, value) {
                    if (value >= 0 && value <= 100) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Phần trăm chiết khấu phải từ 0 đến 100!'));
                  },
                }),
              ]}
            >
              <InputNumber min={0} max={100} style={{ width: "100%" }} />
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
              label="Chiết khấu (%)"
              name="discountPercentage"
              rules={[
                { required: true, message: "Vui lòng nhập phần trăm chiết khấu!" },
                () => ({
                  validator(_, value) {
                    if (value >= 0 && value <= 100) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Phần trăm chiết khấu phải từ 0 đến 100!'));
                  },
                }),
              ]}
            >
              <InputNumber min={0} max={100} style={{ width: "100%" }} />
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

        <Modal
          title="Xác nhận xóa"
          open={isModalOpenDelete}
          onCancel={() => setIsModalOpenDelete(false)}
          onOk={() => selectedBatch && mutationDelete.mutate(selectedBatch._id)}
          confirmLoading={mutationDelete.isPending}
        >
          <p>Bạn có chắc chắn muốn xóa lô hàng này không?</p>
        </Modal>
      </div>
    </Loading>
  );
};

export default AdminBatch; 