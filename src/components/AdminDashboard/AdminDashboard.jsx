import React, { useState } from 'react';
import { Row, Col, Card, Empty, DatePicker, Button } from 'antd';
import { 
  UserOutlined, 
  InboxOutlined, 
  GiftOutlined, 
  ShoppingCartOutlined, 
  BookOutlined,
  AppstoreOutlined,
  DollarOutlined,
  StarOutlined,
  LineChartOutlined,
  DownloadOutlined,
  FileExcelOutlined
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
import * as XLSX from 'xlsx';

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

  // Hàm xuất dữ liệu ra Excel
  const exportToExcel = (data, sheetName, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Điều chỉnh độ rộng cột
    const maxWidth = data.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
    const colWidths = Array(maxWidth).fill({ wch: 20 });
    worksheet['!cols'] = colWidths;
    
    // Xuất file
    XLSX.writeFile(workbook, `${fileName}_${new Date().toLocaleDateString('vi-VN')}.xlsx`);
    message.success('Xuất báo cáo Excel thành công!');
  };
  
  // Xuất dữ liệu doanh thu theo năm
  const exportYearlyRevenue = () => {
    if (monthlyRevenueData.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    
    const data = monthlyRevenueData.map(item => ({
      'Thời gian': item.name,
      'Doanh thu (VNĐ)': item['Doanh thu'],
    }));
    
    exportToExcel(data, 'DoanhThuTheoNam', `Doanh_Thu_Nam_${yearlyRevenueYear}`);
  };
  
  // Xuất dữ liệu doanh thu theo tháng
  const exportMonthlyRevenue = () => {
    if (dailyRevenueData.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    
    const data = dailyRevenueData.map(item => ({
      'Thời gian': item.name,
      'Doanh thu (VNĐ)': item['Doanh thu'],
    }));
    
    exportToExcel(data, 'DoanhThuTheoThang', `Doanh_Thu_Thang_${monthlyRevenueMonth}_${monthlyRevenueYear}`);
  };
  
  // Xuất dữ liệu trạng thái đơn hàng
  const exportOrderStatusData = () => {
    if (orderStatusData.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    
    exportToExcel(orderStatusData, 'TrangThaiDonHang', 'Thong_Ke_Trang_Thai_Don_Hang');
  };
  
  // Xuất dữ liệu phương thức thanh toán
  const exportPaymentMethodData = () => {
    if (paymentMethodData.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    
    exportToExcel(paymentMethodData, 'PhuongThucThanhToan', 'Thong_Ke_Phuong_Thuc_Thanh_Toan');
  };
  
  // Xuất dữ liệu trạng thái thanh toán
  const exportPaymentStatusData = () => {
    if (paymentStatusData.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    
    exportToExcel(paymentStatusData, 'TrangThaiThanhToan', 'Thong_Ke_Trang_Thai_Thanh_Toan');
  };
  
  // Xuất dữ liệu đánh giá
  const exportRatingData = () => {
    if (ratingData.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    
    exportToExcel(ratingData, 'ThongKeDanhGia', 'Thong_Ke_Danh_Gia');
  };
  
  // Xuất tất cả dữ liệu thống kê
  const exportAllData = () => {
    if (!generalStats) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }
    
    const workbook = XLSX.utils.book_new();
    
    // Thống kê chung
    const generalData = [
      { 'Chỉ số': 'Tổng số tài khoản', 'Giá trị': generalStats.totalUsers || 0 },
      { 'Chỉ số': 'Tổng số sách', 'Giá trị': generalStats.totalBooks || 0 },
      { 'Chỉ số': 'Tổng số thể loại', 'Giá trị': generalStats.totalGenres || 0 },
      { 'Chỉ số': 'Tổng doanh thu', 'Giá trị': generalStats.totalRevenue || 0 },
      { 'Chỉ số': 'Số lượt đánh giá', 'Giá trị': generalStats.totalReviews || 0 },
      { 'Chỉ số': 'Tổng đơn hàng', 'Giá trị': generalStats.totalOrders || 0 },
      { 'Chỉ số': 'Số lô đã nhập', 'Giá trị': generalStats.totalBatches || 0 },
      { 'Chỉ số': 'Mã giảm giá đang có hiệu lực', 'Giá trị': generalStats.activeVouchers || 0 }
    ];
    
    // Thêm các sheet vào workbook
    const generalSheet = XLSX.utils.json_to_sheet(generalData);
    XLSX.utils.book_append_sheet(workbook, generalSheet, 'ThongKeChung');
    
    // Thêm các sheet khác nếu có dữ liệu
    if (monthlyRevenueData.length > 0) {
      const yearlyData = monthlyRevenueData.map(item => ({
        'Thời gian': item.name,
        'Doanh thu (VNĐ)': item['Doanh thu'],
      }));
      const yearlySheet = XLSX.utils.json_to_sheet(yearlyData);
      XLSX.utils.book_append_sheet(workbook, yearlySheet, 'DoanhThuTheoNam');
    }
    
    if (dailyRevenueData.length > 0) {
      const monthlyData = dailyRevenueData.map(item => ({
        'Thời gian': item.name,
        'Doanh thu (VNĐ)': item['Doanh thu'],
      }));
      const monthlySheet = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(workbook, monthlySheet, 'DoanhThuTheoThang');
    }
    
    if (orderStatusData.length > 0) {
      const orderStatusSheet = XLSX.utils.json_to_sheet(orderStatusData);
      XLSX.utils.book_append_sheet(workbook, orderStatusSheet, 'TrangThaiDonHang');
    }
    
    if (paymentMethodData.length > 0) {
      const paymentMethodSheet = XLSX.utils.json_to_sheet(paymentMethodData);
      XLSX.utils.book_append_sheet(workbook, paymentMethodSheet, 'PhuongThucThanhToan');
    }
    
    if (paymentStatusData.length > 0) {
      const paymentStatusSheet = XLSX.utils.json_to_sheet(paymentStatusData);
      XLSX.utils.book_append_sheet(workbook, paymentStatusSheet, 'TrangThaiThanhToan');
    }
    
    if (ratingData.length > 0) {
      const ratingSheet = XLSX.utils.json_to_sheet(ratingData);
      XLSX.utils.book_append_sheet(workbook, ratingSheet, 'ThongKeDanhGia');
    }
    
    // Xuất file
    XLSX.writeFile(workbook, `Bao_Cao_Thong_Ke_${new Date().toLocaleDateString('vi-VN')}.xlsx`);
    message.success('Xuất báo cáo Excel thành công!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', margin: 0 }}>Tổng quan</h2>
        <Button 
          type="primary" 
          icon={<FileExcelOutlined />} 
          onClick={exportAllData}
          disabled={isGeneralStatsPending}
        >
          Xuất báo cáo tổng hợp
        </Button>
      </div>
      
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <DatePicker
                    picker="year"
                    value={dayjs().year(yearlyRevenueYear)}
                    onChange={(date) => date && setYearlyRevenueYear(date.year())}
                    allowClear={false}
                    locale={locale}
                    style={{ width: 120 }}
                  />
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={exportYearlyRevenue}
                    disabled={isYearlyRevenuePending || monthlyRevenueData.length === 0}
                  >
                    Excel
                  </Button>
                </div>
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
                    margin={{ right: 20, left: 30 }}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={exportMonthlyRevenue}
                    disabled={isMonthlyRevenuePending || dailyRevenueData.length === 0}
                  >
                    Excel
                  </Button>
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
                    margin={{ right: 20, left: 30 }}
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
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Trạng thái đơn hàng</span>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  onClick={exportOrderStatusData}
                  disabled={isOrderStatusStatsPending || orderStatusData.length === 0}
                >
                  Excel
                </Button>
              </div>
            }
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
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Phương thức thanh toán</span>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  onClick={exportPaymentMethodData}
                  disabled={isPaymentStatsPending || paymentMethodData.length === 0}
                >
                  Excel
                </Button>
              </div>
            }
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
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Trạng thái thanh toán</span>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  onClick={exportPaymentStatusData}
                  disabled={isPaymentStatsPending || paymentStatusData.length === 0}
                >
                  Excel
                </Button>
              </div>
            }
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
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Đánh giá theo số sao</span>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  onClick={exportRatingData}
                  disabled={isRatingStatsPending || ratingData.length === 0}
                >
                  Excel
                </Button>
              </div>
            }
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