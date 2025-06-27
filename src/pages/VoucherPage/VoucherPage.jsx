import React, { useState, useMemo } from 'react';
import { ConfigProvider, Row, Col, Typography, Badge, message, Button, Empty, Modal, Tabs } from 'antd';
import { CopyOutlined, ClockCircleOutlined, PercentageOutlined, DollarOutlined, CheckOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import * as VoucherService from '../../services/VoucherService';
import { WrapperVoucherContainer, VoucherCard, VoucherHeader, VoucherContent, VoucherFooter, VoucherDetailModal } from './style';
import { convertPrice } from '../../utils/utils';
import Loading from '../../components/LoadingComponent/Loading';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const VoucherPage = () => {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  
  const { data: vouchersData, isLoading } = useQuery({
    queryKey: ['activeVouchers'],
    queryFn: () => VoucherService.getActiveVouchers(),
    onError: (error) => {
      message.error('Lấy danh sách voucher thất bại');
    }
  });

  // Phân loại voucher theo trạng thái
  const categorizedVouchers = useMemo(() => {
    if (!vouchersData?.data) return { active: [], upcoming: [] };
    
    const now = new Date();
    const active = [];
    const upcoming = [];
    
    vouchersData.data.forEach(voucher => {
      const startDate = new Date(voucher.startDate);
      if (startDate > now) {
        upcoming.push(voucher);
      } else {
        active.push(voucher);
      }
    });
    
    return { active, upcoming };
  }, [vouchersData]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        message.success('Đã sao chép mã');
        setCopiedCode(code);
        setTimeout(() => {
          setCopiedCode(null);
        }, 3000);
      })
      .catch(() => {
        message.error('Không thể sao chép mã');
      });
  };

  const handleViewDetails = (voucher) => {
    setSelectedVoucher(voucher);
    setModalVisible(true);
  };

  const getVoucherStatus = (voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    if (now < startDate) {
      return 'upcoming'; // Sắp mở
    } else if (now > endDate) {
      return 'expired'; // Hết hạn
    } else {
      return 'active'; // Đang hoạt động
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'upcoming':
        return <Badge status="warning" text="Sắp mở" />;
      case 'active':
        return <Badge status="success" text="Đang hoạt động" />;
      case 'expired':
        return <Badge status="error" text="Hết hạn" />;
      default:
        return null;
    }
  };

  const renderVoucherValue = (voucher) => {
    if (voucher.discountType === 'percentage') {
      return (
        <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
          <PercentageOutlined /> {voucher.discountValue}%
        </Text>
      );
    } else {
      return (
        <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
          <DollarOutlined /> {convertPrice(voucher.discountValue)}
        </Text>
      );
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const renderVoucherCard = (voucher) => {
    const status = getVoucherStatus(voucher);
    return (
      <Col xs={24} sm={12} md={8} key={voucher._id}>
        <VoucherCard>
          <VoucherHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>BKshop</Text>
              {getStatusBadge(status)}
            </div>
          </VoucherHeader>
          
          <VoucherContent>
            <div style={{ marginBottom: '10px' }}>
              {renderVoucherValue(voucher)}
            </div>
            <Paragraph 
              ellipsis={{ rows: 2 }}
              style={{ minHeight: '40px', color: '#595959' }}
            >
              {voucher.description || 'Mã giảm giá từ BookShop'}
            </Paragraph>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
              <ClockCircleOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
              {status === 'upcoming' ? (
                <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                  Mở từ: {formatDate(voucher.startDate)}
                </Text>
              ) : (
                <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                  HSD: {formatDate(voucher.endDate)}
                </Text>
              )}
            </div>
            {voucher.minOrderValue > 0 && (
              <div style={{ marginTop: '5px' }}>
                <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                  Đơn tối thiểu: {convertPrice(voucher.minOrderValue)}
                </Text>
              </div>
            )}
          </VoucherContent>
          
          <VoucherFooter>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text code style={{ padding: '5px 8px', fontSize: '18px', letterSpacing: '1px', fontWeight: 'bold' }}>
                  {voucher.code}
                </Text>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button 
                  type="text" 
                  icon={copiedCode === voucher.code ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                  onClick={() => handleCopyCode(voucher.code)}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {copiedCode === voucher.code ? 'Đã sao chép' : 'Sao chép'}
                </Button>
                <Button 
                  type="primary" 
                  ghost
                  onClick={() => handleViewDetails(voucher)}
                >
                  Chi tiết
                </Button>
              </div>
            </div>
          </VoucherFooter>
        </VoucherCard>
      </Col>
    );
  };

  const renderVoucherList = (vouchers) => {
    if (vouchers.length === 0) {
      return (
        <Empty 
          description="Không có mã giảm giá nào" 
          style={{ padding: '30px 0' }}
        />
      );
    }

    return (
      <Row gutter={[24, 24]}>
        {vouchers.map(renderVoucherCard)}
      </Row>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00a551',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          colorInfo: '#1890ff',
        },
      }}
    >
      <Loading isLoading={isLoading}>
        <WrapperVoucherContainer>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Title level={2} style={{ color: '#00a551', marginBottom: '10px' }}>
              Mã giảm giá
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#595959' }}>
              Áp dụng các mã giảm giá để tiết kiệm chi phí khi mua sách tại BKshop
            </Paragraph>
          </div>

          {(categorizedVouchers.active.length > 0 || categorizedVouchers.upcoming.length > 0) ? (
            <Tabs defaultActiveKey="active" centered>
              <TabPane 
                tab={
                  <span style={{ fontSize: '16px', padding: '0 10px' }}>
                    Đang áp dụng 
                    <Badge 
                      count={categorizedVouchers.active.length} 
                      style={{ backgroundColor: '#52c41a', marginLeft: '8px' }} 
                    />
                  </span>
                } 
                key="active"
              >
                {renderVoucherList(categorizedVouchers.active)}
              </TabPane>
              <TabPane 
                tab={
                  <span style={{ fontSize: '16px', padding: '0 10px' }}>
                    Sắp mở 
                    <Badge 
                      count={categorizedVouchers.upcoming.length} 
                      style={{ backgroundColor: '#faad14', marginLeft: '8px' }} 
                    />
                  </span>
                } 
                key="upcoming"
              >
                {renderVoucherList(categorizedVouchers.upcoming)}
              </TabPane>
            </Tabs>
          ) : (
            <Empty 
              description="Hiện tại không có mã giảm giá nào" 
              style={{ padding: '50px 0' }}
            />
          )}

          <Modal
            title="Chi tiết mã giảm giá"
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button 
                key="copy" 
                type="primary" 
                icon={<CopyOutlined />}
                onClick={() => selectedVoucher && handleCopyCode(selectedVoucher.code)}
              >
                Sao chép mã
              </Button>,
              <Button 
                key="close" 
                onClick={() => setModalVisible(false)}
              >
                Đóng
              </Button>
            ]}
            width={500}
          >
            {selectedVoucher && (
              <VoucherDetailModal>
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <Title level={4} style={{ color: '#00a551', margin: '0 0 5px 0' }}>
                    {selectedVoucher.discountType === 'percentage' 
                      ? `Giảm ${selectedVoucher.discountValue}%` 
                      : `Giảm ${convertPrice(selectedVoucher.discountValue)}`}
                  </Title>
                  <Text style={{ fontSize: '16px' }}>
                    {selectedVoucher.description || 'Mã giảm giá từ BKshop'}
                  </Text>
                </div>
                
                <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                  <Text style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                    Mã: <Text code style={{ padding: '5px 8px', fontSize: '16px' }}>{selectedVoucher.code}</Text>
                  </Text>
                  
                  <Row gutter={[16, 16]} style={{ marginTop: '15px' }}>
                    <Col span={12}>
                      <Text style={{ color: '#8c8c8c' }}>Thời gian bắt đầu:</Text>
                      <div>{formatDate(selectedVoucher.startDate)}</div>
                    </Col>
                    <Col span={12}>
                      <Text style={{ color: '#8c8c8c' }}>Thời gian kết thúc:</Text>
                      <div>{formatDate(selectedVoucher.endDate)}</div>
                    </Col>
                  </Row>
                </div>

                <div>
                  <Title level={5}>Điều kiện áp dụng:</Title>
                  <ul style={{ paddingLeft: '20px' }}>
                    {selectedVoucher.minOrderValue > 0 && (
                      <li>
                        <Text>Áp dụng cho đơn hàng từ {convertPrice(selectedVoucher.minOrderValue)}</Text>
                      </li>
                    )}
                    <li>
                      <Text>Thời hạn sử dụng đến hết ngày {formatDate(selectedVoucher.endDate)}</Text>
                    </li>
                  </ul>
                </div>
              </VoucherDetailModal>
            )}
          </Modal>
        </WrapperVoucherContainer>
      </Loading>
    </ConfigProvider>
  );
};

export default VoucherPage; 