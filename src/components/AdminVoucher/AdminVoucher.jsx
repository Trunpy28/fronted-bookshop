import React, { useState } from 'react';
import { Button, Form, Space, DatePicker, Input, InputNumber, Modal, Select, message, Row, Col, Card, Statistic, Tooltip, Checkbox, Upload, Image, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, FilterOutlined, UploadOutlined, DollarOutlined, PercentageOutlined, CalendarOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import locale from 'antd/es/date-picker/locale/vi_VN';
import * as VoucherService from '../../services/VoucherService';
import { WrapperHeader } from '../AdminProduct/style';
import Loading from '../LoadingComponent/Loading';
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
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
        description: data.description || '',
        startDate: data.startDate.format('YYYY-MM-DD HH:mm:ss'),
        endDate: data.endDate.format('YYYY-MM-DD HH:mm:ss'),
      };
      
      // Nếu có file ảnh
      if (data.image && data.image.fileList && data.image.fileList.length > 0 && data.image.fileList[0].originFileObj) {
        formattedData.image = data.image.fileList[0].originFileObj;
      }
      
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
        description: data.description || '',
        startDate: data.startDate?.format ? data.startDate.format('YYYY-MM-DD HH:mm:ss') : data.startDate,
        endDate: data.endDate?.format ? data.endDate.format('YYYY-MM-DD HH:mm:ss') : data.endDate
      };
      
      // Chỉ thêm image vào dữ liệu nếu có tải lên ảnh mới
      if (data.image && data.image.fileList && data.image.fileList.length > 0 && data.image.fileList[0].originFileObj) {
        formattedData.image = data.image.fileList[0].originFileObj;
      }
      
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
        startDate: dayjs(),
        endDate: dayjs().add(7, 'days')
      });
      setDiscountType('percentage');
    } else {
      setRowSelected(voucher._id);
      form.setFieldsValue({
        ...voucher,
        startDate: dayjs(voucher.startDate),
        endDate: dayjs(voucher.endDate)
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
        <Tooltip title="Chỉnh sửa thông tin">
          <EditOutlined 
          style={{ color: "orange", fontSize: "25px", cursor: "pointer" }} 
            onClick={() => handleOpenModal('update', record)}
          />
        </Tooltip>
        <Tooltip title="Xóa">
          <DeleteOutlined 
            style={{ color: "red", fontSize: "25px", cursor: "pointer" }} 
            onClick={() => handleDeleteModal(record)}
          />
        </Tooltip>
      </Space>
    );
  };

  const handlePaginationChange = (pagination) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>{text}</Tag>,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm kiếm mã voucher"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Đặt lại
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) =>
        record.code
          ? record.code.toString().toLowerCase().includes(value.toLowerCase())
          : '',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <div style={{ maxWidth: '200px', minWidth: '150px' }}>
          <Tooltip title={text || ''}>
            <div style={{ 
              wordWrap: 'break-word', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {text || ''}
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <div style={{ textAlign: 'center' }}>
          {image ? (
            <Image
              src={image}
              alt="Ảnh voucher"
              style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: '4px' }}
              preview={{ src: image }}
            />
          ) : (
            <span>Không có ảnh</span>
          )}
        </div>
      ),
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {type === 'percentage' ? (
            <>
              <PercentageOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
              <span style={{ fontWeight: 'bold', color: '#722ed1' }}>
                {record.discountValue}%
              </span>
            </>
          ) : (
            <>
              <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                {record.discountValue.toLocaleString('vi-VN')} đ
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Đơn hàng tối thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      render: (value) => (
        <div style={{ fontWeight: 'bold', color: 'red' }}>
          {value.toLocaleString('vi-VN')} đ
        </div>
      ),
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          <span>{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>
        </div>
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <DatePicker
            value={selectedKeys[0] ? dayjs(selectedKeys[0], 'DD/MM/YYYY') : null}
            onChange={(date) => {
              if (date) {
                const formattedDate = date.format('DD/MM/YYYY');
                setSelectedKeys([formattedDate]);
              } else {
                setSelectedKeys([]);
              }
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
            locale={locale}
            format="DD/MM/YYYY"
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Đặt lại
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => {
        if (!record.startDate) return false;
        const startDateStr = dayjs(record.startDate).format('DD/MM/YYYY');
        return startDateStr === value;
      },
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ marginRight: '8px', color: '#f5222d' }} />
          <span>{dayjs(date).format('DD/MM/YYYY HH:mm')}</span>
        </div>
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <DatePicker
            value={selectedKeys[0] ? dayjs(selectedKeys[0], 'DD/MM/YYYY') : null}
            onChange={(date) => {
              if (date) {
                const formattedDate = date.format('DD/MM/YYYY');
                setSelectedKeys([formattedDate]);
              } else {
                setSelectedKeys([]);
              }
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
            locale={locale}
            format="DD/MM/YYYY"
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Đặt lại
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => {
        if (!record.endDate) return false;
        const endDateStr = dayjs(record.endDate).format('DD/MM/YYYY');
        return endDateStr === value;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (status) => (
        <Tag color={status ? 'success' : 'error'} style={{ fontSize: '14px', padding: '2px 10px' }}>
          {status ? 'Kích hoạt' : 'Vô hiệu'}
        </Tag>
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Checkbox.Group
            value={selectedKeys}
            onChange={setSelectedKeys}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 8 }}
          >
            <Checkbox value={true}>Kích hoạt</Checkbox>
            <Checkbox value={false}>Vô hiệu</Checkbox>
          </Checkbox.Group>
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Lọc
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Đặt lại
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => {
        return record.isActive === value;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: renderAction,
    },
  ];

  // Định dạng thời gian
  const dateFormat = 'DD/MM/YYYY HH:mm';

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
          <Row gutter={40} style={{ width: "30vw" }}>
            <Col span={14}>
              <Card 
                style={{ 
                  border: "1px solid #00B55F", 
                  padding: "12px", 
                  borderRadius: "6px",
                  boxShadow: "0 2px 6px rgba(0, 181, 95, 0.1)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ 
                    backgroundColor: "#f6ffed", 
                    width: "50px", 
                    height: "50px", 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginRight: "12px",
                    border: "1px solid #b7eb8f"
                  }}>
                    <CreditCardOutlined style={{ fontSize: "24px", color: "#00B55F" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", color: "#8c8c8c", marginBottom: "4px" }}>Tổng số mã</div>
                    <div style={{ fontSize: "26px", fontWeight: "bold", color: "#00B55F", lineHeight: "1" }}>
                      {vouchersData?.data?.length || 0}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        <div style={{ marginTop: "20px" }}>
          <TableComponent
            columns={columns}
            dataSource={vouchersData?.data}
            loading={isLoadingVouchers}
            bordered
            pagination={{
              ...pagination,
              total: vouchersData?.total,
              pageSizeOptions: [10, 20, 50, 100],
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} bản ghi`
            }}
            onChange={handlePaginationChange}
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
              startDate: dayjs(),
              endDate: dayjs().add(7, 'days')
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
              label="Hình ảnh"
              name="image"
            >
              <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={() => false} // Ngăn upload tự động
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
              </Upload>
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
                max={discountType === 'percentage' ? 100 : undefined}
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