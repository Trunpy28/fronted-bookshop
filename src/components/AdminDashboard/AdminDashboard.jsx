import React, { useState } from 'react';
import { Row, Col, Card, Empty, DatePicker } from 'antd';
import { 
  UserOutlined, 
  InboxOutlined, 
  GiftOutlined, 
  ShoppingCartOutlined, 
  BookOutlined,
  AppstoreOutlined,
  DollarOutlined,
  StarOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { 
  getGeneralStatistics, 
  getRatingStatistics,
  getOrderStatusStatistics, 
  getPaymentStatistics,
  getRevenueByMonth,
  getRevenueByYear
} from '../../services/StatisticsService';
import { convertPrice } from '../../utils/utils';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import Loading from '../LoadingComponent/Loading';
import * as message from "../Message/Message";
import dayjs from 'dayjs';
import locale from 'antd/lib/date-picker/locale/vi_VN';

// Định nghĩa màu sắc nhất quán cho toàn bộ dashboard
const COLORS = {
  primary: '#1677ff',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#f5222d',
  purple: '#722ed1',
  cyan: '#13c2c2',
  orange: '#fa541c',
  pink: '#eb2f96',
  
  // Màu cho các biểu đồ
  chart: {
    orderStatus: ['#1677ff', '#faad14', '#52c41a', '#f5222d'],
    paymentMethod: ['#faad14', '#1677ff', '#722ed1'],
    paymentStatus: ['#faad14', '#52c41a', '#f5222d'],
    rating: ['#f5222d', '#fa541c', '#faad14', '#52c41a', '#1677ff']
  }
};

const AdminDashboard = () => {
  const user = useSelector((state) => state.user);
  
  // State cho biểu đồ doanh thu theo năm
  const [yearlyRevenueYear, setYearlyRevenueYear] = useState(new Date().getFullYear());
  
  // State cho biểu đồ doanh thu theo tháng
  const [monthlyRevenueYear, setMonthlyRevenueYear] = useState(new Date().getFullYear());
  const [monthlyRevenueMonth, setMonthlyRevenueMonth] = useState(new Date().getMonth() + 1); // tháng thực tế (1-12)
  
  const { 
    data: generalStats, 
    isPending: isGeneralStatsPending
  } = useQuery({
    queryKey: ['general-statistics'],
    queryFn: () => getGeneralStatistics(user?.access_token),
    enabled: !!user?.access_token,
    staleTime: 0,
    refetchOnWindowFocus: "always",
    onError: (error) => {
      message.error('Lỗi khi lấy dữ liệu thống kê chung: ' + error.message);
    }
  });

  const { 
    data: ratingStats, 
    isPending: isRatingStatsPending
  } = useQuery({
    queryKey: ['rating-statistics'],
    queryFn: () => getRatingStatistics(user?.access_token),
    enabled: !!user?.access_token,
    staleTime: 0,
    refetchOnWindowFocus: "always",
    onError: (error) => {
      message.error('Lỗi khi lấy dữ liệu thống kê đánh giá: ' + error.message);
    }
  });

  const { 
    data: orderStatusStats, 
    isPending: isOrderStatusStatsPending
  } = useQuery({
    queryKey: ['order-status-statistics'],
    queryFn: () => getOrderStatusStatistics(user?.access_token),
    enabled: !!user?.access_token,
    staleTime: 0,
    refetchOnWindowFocus: "always",
    onError: (error) => {
      message.error('Lỗi khi lấy dữ liệu thống kê trạng thái đơn hàng: ' + error.message);
    }
  });

  const { 
    data: paymentStats, 
    isPending: isPaymentStatsPending
  } = useQuery({
    queryKey: ['payment-statistics'],
    queryFn: () => getPaymentStatistics(user?.access_token),
    enabled: !!user?.access_token,
    staleTime: 0,
    refetchOnWindowFocus: "always",
    onError: (error) => {
      message.error('Lỗi khi lấy dữ liệu thống kê thanh toán: ' + error.message);
    }
  });

  const { 
    data: monthlyRevenue, 
    isPending: isMonthlyRevenuePending
  } = useQuery({
    queryKey: ['monthly-revenue', monthlyRevenueMonth, monthlyRevenueYear],
    queryFn: () => getRevenueByMonth(user?.access_token, monthlyRevenueMonth, monthlyRevenueYear),
    enabled: !!user?.access_token,
    staleTime: 0,
    refetchOnWindowFocus: "always",
    onError: (error) => {
      message.error('Lỗi khi lấy dữ liệu doanh thu theo tháng: ' + error.message);
    }
  });

  const { 
    data: yearlyRevenue, 
    isPending: isYearlyRevenuePending
  } = useQuery({
    queryKey: ['yearly-revenue', yearlyRevenueYear],
    queryFn: () => getRevenueByYear(user?.access_token, yearlyRevenueYear),
    enabled: !!user?.access_token,
    staleTime: 0,
    onError: (error) => {
      message.error('Lỗi khi lấy dữ liệu doanh thu theo năm: ' + error.message);
    }
  });

  const dashboardCards = [
    {
      title: 'Tổng số tài khoản',
      value: generalStats?.totalUsers || 0,
      icon: <UserOutlined />,
      color: COLORS.primary,
      bgColor: '#e6f4ff',
      textColor: COLORS.primary
    },
    {
      title: 'Tổng số sách',
      value: generalStats?.totalBooks || 0,
      icon: <BookOutlined />,
      color: COLORS.purple,
      bgColor: '#f9f0ff',
      textColor: COLORS.purple
    },
    {
      title: 'Tổng số thể loại',
      value: generalStats?.totalGenres || 0,
      icon: <AppstoreOutlined />,
      color: COLORS.cyan,
      bgColor: '#e6fffb',
      textColor: COLORS.cyan
    },
    {
      title: 'Tổng doanh thu',
      value: convertPrice(generalStats?.totalRevenue || 0),
      icon: <DollarOutlined />,
      color: COLORS.danger,
      bgColor: '#fff1f0',
      textColor: COLORS.danger
    },
    {
      title: 'Số lượt đánh giá',
      value: generalStats?.totalReviews || 0,
      icon: <StarOutlined />,
      color: COLORS.warning,
      bgColor: '#fffbe6',
      textColor: COLORS.warning
    },
    {
      title: 'Tổng đơn hàng',
      value: generalStats?.totalOrders || 0,
      icon: <ShoppingCartOutlined />,
      color: COLORS.orange,
      bgColor: '#fff2e8',
      textColor: COLORS.orange
    },
    {
      title: 'Số lô đã nhập',
      value: generalStats?.totalBatches || 0,
      icon: <InboxOutlined />,
      color: COLORS.success,
      bgColor: '#f6ffed',
      textColor: COLORS.success
    },
    {
      title: 'Mã giảm giá đang có hiệu lực',
      value: generalStats?.activeVouchers || 0,
      icon: <GiftOutlined />,
      color: COLORS.pink,
      bgColor: '#fff0f6',
      textColor: COLORS.pink
    }
  ];

  // Dữ liệu cho biểu đồ trạng thái đơn hàng
  const orderStatusData = orderStatusStats?.orderStatusData ? [
    { name: 'Đang xử lý', 'Số lượng': orderStatusStats.orderStatusData.pending },
    { name: 'Đang giao hàng', 'Số lượng': orderStatusStats.orderStatusData.shipping },
    { name: 'Đã giao hàng', 'Số lượng': orderStatusStats.orderStatusData.delivered },
    { name: 'Đã hủy', 'Số lượng': orderStatusStats.orderStatusData.cancelled }
  ] : [];

  // Dữ liệu cho biểu đồ phương thức thanh toán
  const paymentMethodData = paymentStats?.paymentMethodData ? [
    { name: 'COD', 'Số lượng': paymentStats.paymentMethodData.cod },
    { name: 'VNPAY', 'Số lượng': paymentStats.paymentMethodData.vnpay },
    { name: 'PAYPAL', 'Số lượng': paymentStats.paymentMethodData.paypal }
  ] : [];

  // Dữ liệu cho biểu đồ trạng thái thanh toán
  const paymentStatusData = paymentStats?.paymentStatusData ? [
    { name: 'Đang chờ', 'Số lượng': paymentStats.paymentStatusData.pending },
    { name: 'Hoàn thành', 'Số lượng': paymentStats.paymentStatusData.completed },
    { name: 'Thất bại', 'Số lượng': paymentStats.paymentStatusData.failed }
  ] : [];

  // Dữ liệu cho biểu đồ đánh giá theo sao
  const ratingData = ratingStats?.ratingData ? [
    { name: '1 sao', 'Số lượng': ratingStats.ratingData.oneStar },
    { name: '2 sao', 'Số lượng': ratingStats.ratingData.twoStars },
    { name: '3 sao', 'Số lượng': ratingStats.ratingData.threeStars },
    { name: '4 sao', 'Số lượng': ratingStats.ratingData.fourStars },
    { name: '5 sao', 'Số lượng': ratingStats.ratingData.fiveStars }
  ] : [];

  // Dữ liệu doanh thu theo tháng (ngày)
  const dailyRevenueData = monthlyRevenue?.data?.map(item => ({
    name: `Ngày ${item.day}`,
    'Doanh thu': item.revenue
  })) || [];

  // Dữ liệu doanh thu theo năm (tháng)
  const monthlyRevenueData = yearlyRevenue?.data?.map(item => ({
    name: `Tháng ${item.month}`,
    'Doanh thu': item.revenue
  })) || [];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '24px' }}>Tổng quan</h2>
      
      <Row gutter={[20, 20]}>
        {dashboardCards.map((card, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card 
              style={{ 
                borderRadius: '10px', 
                boxShadow: '0 3px 6px rgba(0,0,0,0.08)',
                height: '100%'
              }}
              bodyStyle={{ padding: '16px' }}
              hoverable
              variant="outlined"
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div 
                  style={{ 
                    fontSize: '24px',
                    padding: '10px',
                    borderRadius: '8px',
                    marginRight: '12px',
                    backgroundColor: card.bgColor, 
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '45px',
                    height: '45px'
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <p style={{ color: '#8c8c8c', margin: 0, fontSize: '14px' }}>
                    {card.title}
                  </p>
                  <h3 
                    style={{ 
                      fontSize: '20px', 
                      margin: '4px 0 0', 
                      fontWeight: 'bold',
                      color: card.textColor
                    }}
                  >
                    <Loading isLoading={isGeneralStatsPending}>
                      {card.value}
                    </Loading>
                  </h3>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Row gutter={[24, 24]} style={{ marginTop: '20px' }}>
        <Col xs={24}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Doanh thu theo năm</span>
                <DatePicker
                  picker="year"
                  value={dayjs().year(yearlyRevenueYear)}
                  onChange={(date) => date && setYearlyRevenueYear(date.year())}
                  allowClear={false}
                  locale={locale}
                  style={{ width: 120 }}
                />
              </div>
            }
            variant="outlined"
            style={{ borderRadius: '10px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}
          >
            <Loading isLoading={isYearlyRevenuePending}>
              {monthlyRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={monthlyRevenueData}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => convertPrice(value)} />
                    <Line 
                      type="monotone" 
                      dataKey="Doanh thu" 
                      stroke={COLORS.primary} 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Không có dữ liệu" />
              )}
            </Loading>
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Doanh thu theo tháng</span>
                <div>
                  <DatePicker
                    picker="month"
                    value={dayjs().year(monthlyRevenueYear).month(monthlyRevenueMonth - 1)}
                    onChange={(date) => {
                      if (date) {
                        setMonthlyRevenueMonth(date.month() + 1);
                        setMonthlyRevenueYear(date.year());
                      }
                    }}
                    allowClear={false}
                    locale={locale}
                    style={{ width: 140 }}
                  />
                </div>
              </div>
            }
            variant="outlined"
            style={{ borderRadius: '10px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}
          >
            <Loading isLoading={isMonthlyRevenuePending}>
              {dailyRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={dailyRevenueData}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => convertPrice(value)} />
                    <Line 
                      type="monotone" 
                      dataKey="Doanh thu" 
                      stroke={COLORS.danger} 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Không có dữ liệu" />
              )}
            </Loading>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[24, 24]} style={{ marginTop: '20px' }}>
        <Col xs={24}>
          <Card 
            title="Trạng thái đơn hàng" 
            variant="outlined"
            style={{ borderRadius: '10px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}
          >
            <Loading isLoading={isOrderStatusStatsPending}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={orderStatusData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis dataKey="Số lượng" type='number'/>
                  <Tooltip />
                  <Bar dataKey="Số lượng" fill={COLORS.primary}>
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.chart.orderStatus[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Loading>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[24, 24]} style={{ marginTop: '20px' }}>
        <Col xs={24} md={12}>
          <Card 
            title="Phương thức thanh toán" 
            variant="outlined"
            style={{ borderRadius: '10px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}
          >
            <Loading isLoading={isPaymentStatsPending}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    dataKey="Số lượng"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.chart.paymentMethod[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Loading>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card 
            title="Trạng thái thanh toán" 
            variant="outlined"
            style={{ borderRadius: '10px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}
          >
            <Loading isLoading={isPaymentStatsPending}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={paymentStatusData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis dataKey="Số lượng" type='number'/>
                  <Tooltip />
                  <Bar dataKey="Số lượng" fill={COLORS.primary}>
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.chart.paymentStatus[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Loading>
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card 
            title="Đánh giá theo số sao" 
            variant="outlined"
            style={{ borderRadius: '10px', boxShadow: '0 3px 6px rgba(0,0,0,0.08)' }}
          >
            <Loading isLoading={isRatingStatsPending}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={ratingData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis dataKey="Số lượng" type='number'/>
                  <Tooltip />
                  <Bar dataKey="Số lượng" fill={COLORS.primary}>
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.chart.rating[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Loading>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard; 