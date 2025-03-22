import React, { useState, useEffect } from 'react';
import { Button, Form, Space, DatePicker, Input, InputNumber, Modal, Select, Table, message, Row, Col, Card, Statistic } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/vi_VN';

import * as VoucherService from '../../services/VoucherService';
import { WrapperHeader } from '../AdminProduct/style';
import Loading from '../LoadingComponent/Loading';
import { formatDate } from '../../utils';
import TableComponent from '../TableComponent/TableComponent';

const { Option } = Select;
const { TextArea } = Input;

const AdminVoucher = () => {
  const user = useSelector((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowSelected, setRowSelected] = useState('');
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [typeModal, setTypeModal] = useState('');
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [discountType, setDiscountType] = useState('percentage');

  // Lấy danh sách voucher
  const getAllVouchers = async () => {
    const res = await VoucherService.getAllVouchers(user?.access_token);
    return res;
  };

  const { data: vouchersData, isLoading: isLoadingVouchers, refetch } = useQuery({
    queryKey: ['vouchers'],
    queryFn: getAllVouchers,
    enabled: !!user?.access_token,
  });

  const mutationCreate = useMutation({
    mutationFn: (data) => {
      const formattedData = {
        ...data,
        startDate: data.startDate.format('YYYY-MM-DD HH:mm:ss'),
        endDate: data.endDate.format('YYYY-MM-DD HH:mm:ss')
      };
      return VoucherService.createVoucher(formattedData, user?.access_token);
    },
    onSuccess: () => {
      message.success('Thêm mã giảm giá thành công');
      handleCancel();
      refetch();
    },
    onError: (error) => {
      message.error('Thêm mã giảm giá thất bại: ' + error.response?.data?.message);
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: ({ id, data }) => {
      const formattedData = {
        ...data,
        startDate: data.startDate?.format ? data.startDate.format('YYYY-MM-DD HH:mm:ss') : data.startDate,
        endDate: data.endDate?.format ? data.endDate.format('YYYY-MM-DD HH:mm:ss') : data.endDate
      };
      return VoucherService.updateVoucher(id, formattedData, user?.access_token);
    },
    onSuccess: () => {
      message.success('Cập nhật mã giảm giá thành công');
      handleCancel();
      refetch();
    },
    onError: (error) => {
      message.error('Cập nhật mã giảm giá thất bại: ' + error.response?.data?.message);
    },
  });

  const mutationDelete = useMutation({
    mutationFn: (id) => VoucherService.deleteVoucher(id, user?.access_token),
    onSuccess: () => {
      message.success('Xóa mã giảm giá thành công');
      setIsModalOpenDelete(false);
      refetch();
    },
    onError: (error) => {
      message.error('Xóa mã giảm giá thất bại: ' + error.response?.data?.message);
    },
  });

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setTypeModal('');
    setRowSelected('');
  };

  const onFinish = (values) => {
    if (typeModal === 'create') {
      mutationCreate.mutate(values);
    } else {
      mutationUpdate.mutate({ id: rowSelected, data: values });
    }
  };

  const handleDeleteVoucher = () => {
    mutationDelete.mutate(rowSelected);
  };

  const handleOpenModal = (type, voucher = {}) => {
    setTypeModal(type);
    if (type === 'create') {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        discountType: 'percentage',
        minOrderValue: 0,
        startDate: moment(),
        endDate: moment().add(7, 'days')
      });
      setDiscountType('percentage');
    } else {
      setRowSelected(voucher._id);
      form.setFieldsValue({
        ...voucher,
        startDate: moment(voucher.startDate),
        endDate: moment(voucher.endDate)
      });
      setDiscountType(voucher.discountType);
    }
    setIsModalOpen(true);
  };

  const handleDeleteModal = (record) => {
    setIsModalOpenDelete(true);
    setRowSelected(record._id);
  };

  const renderAction = (text, record) => {
    return (
      <Space size="middle">
        <EditOutlined 
          style={{ color: "orange", fontSize: "25px", cursor: "pointer" }} 
          onClick={() => handleOpenModal('update', record)}
        />
        <DeleteOutlined 
          style={{ color: "red", fontSize: "25px", cursor: "pointer" }} 
          onClick={() => handleDeleteModal(record)}
        />
      </Space>
    );
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>{text}</div>,
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type, record) => (
        <span>
          {type === 'percentage' ? `${record.discountValue}%` : `${record.discountValue.toLocaleString('vi-VN')}đ`}
        </span>
      ),
    },
    {
      title: 'Đơn hàng tối thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      render: (value) => value.toLocaleString('vi-VN') + 'đ',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => formatDate(date),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (status) => (status ? 'Kích hoạt' : 'Vô hiệu'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: renderAction,
    },
  ];

  // Định dạng thời gian
  const dateFormat = 'DD/MM/YYYY HH:mm';

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <Loading isLoading={isLoadingVouchers || mutationCreate.isPending || mutationUpdate.isPending || mutationDelete.isPending}>
      <div>
        <WrapperHeader>Quản lý mã giảm giá</WrapperHeader>
        <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
          <Button
            style={{
              height: '150px',
              width: '150px',
              borderRadius: '6px',
              borderStyle: 'dashed',
            }}
            onClick={() => handleOpenModal('create')}
          >
            <PlusOutlined style={{ fontSize: '40px' }} />
          </Button>
          <Row gutter={40} style={{ width: "40vw" }}>
            <Col span={12}>
              <Card style={{ border: "1px solid #00B55F" }}>
                <Statistic title="Tổng số mã" value={vouchersData?.data?.length || 0} />
              </Card>
            </Col>
          </Row>
        </div>

        <div style={{ marginTop: "20px" }}>
          <TableComponent
            columns={columns}
            dataSource={vouchersData?.data}
            loading={isLoadingVouchers}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: vouchersData?.total,
              onChange: handleTableChange,
              pageSizeOptions: [10, 20, 50, 100],
              showSizeChanger: true
            }}
          />
        </div>
        <Modal
          title={typeModal === 'create' ? 'Tạo mã giảm giá' : 'Cập nhật mã giảm giá'}
          open={isModalOpen}
          onCancel={handleCancel}
          onOk={form.submit}
          confirmLoading={mutationCreate.isPending || mutationUpdate.isPending}
          width={700}
        >
          <Form
            name="voucher-form"
            layout="vertical"
            onFinish={onFinish}
            form={form}
            initialValues={{
              isActive: true,
              discountType: 'percentage',
              minOrderValue: 0,
              startDate: moment(),
              endDate: moment().add(7, 'days')
            }}
          >
            <Form.Item
              label="Mã giảm giá"
              name="code"
              rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá!' }]}
            >
              <Input 
                placeholder="Nhập mã giảm giá (VD: SUMMER2023)" 
                disabled={typeModal === 'update'}
              />
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <TextArea rows={2} placeholder="Nhập mô tả mã giảm giá" />
            </Form.Item>

            <Form.Item
              label="Loại giảm giá"
              name="discountType"
              rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá!' }]}
            >
              <Select onChange={(value) => setDiscountType(value)}>
                <Option value="percentage">Phần trăm (%)</Option>
                <Option value="fixed">Số tiền cố định (VND)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Giá trị giảm"
              name="discountValue"
              rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm!' }]}
            >
              <InputNumber
                style={{ width: '40%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="Nhập giá trị giảm"
                min={0}
                addonAfter={<span style={{color: '#CD3238', fontWeight: 'bold'}}>{discountType === 'fixed' ? 'đ' : '%'}</span>}
              />
            </Form.Item>

            <Form.Item
              label="Giá trị tối thiểu"
              name="minOrderValue"
              tooltip="Giá trị đơn hàng tối thiểu để áp dụng mã giảm giá"
              rules={[{ required: true, message: 'Vui lòng nhập giá trị tối thiểu!' }]}
            >
              <InputNumber
                style={{ width: '40%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="Nhập giá trị tối thiểu"
                min={0}
                addonAfter={<span style={{color: '#CD3238', fontWeight: 'bold'}}>đ</span>}
              />
            </Form.Item>

            <Form.Item
              label="Ngày bắt đầu"
              name="startDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
            >
              <DatePicker 
                format={dateFormat}
                showTime 
                placeholder="Chọn ngày và giờ bắt đầu"
                style={{ width: '100%' }}
                locale={locale}
              />
            </Form.Item>

            <Form.Item
              label="Ngày kết thúc"
              name="endDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
            >
              <DatePicker 
                format={dateFormat}
                showTime
                placeholder="Chọn ngày và giờ kết thúc"
                style={{ width: '100%' }}
                locale={locale}
              />
            </Form.Item>

            <Form.Item
              label="Trạng thái"
              name="isActive"
              valuePropName="checked"
            >
              <Select>
                <Option value={true}>Kích hoạt</Option>
                <Option value={false}>Vô hiệu</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Xác nhận xóa"
          open={isModalOpenDelete}
          onCancel={() => setIsModalOpenDelete(false)}
          onOk={handleDeleteVoucher}
          confirmLoading={mutationDelete.isPending}
        >
          <p>Bạn có chắc chắn muốn xóa mã giảm giá này không?</p>
        </Modal>
      </div>
    </Loading>
  );
};

export default AdminVoucher; 