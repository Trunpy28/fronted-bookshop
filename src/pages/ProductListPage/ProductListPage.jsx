import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { 
  Row, 
  Col, 
  Typography, 
  Select, 
  Checkbox, 
  Pagination, 
  Button, 
  Space, 
  Divider, 
  Empty,
  Input,
  ConfigProvider
} from "antd";
import { useQuery } from "@tanstack/react-query";
import * as ProductService from "../../services/ProductService";
import * as GenreService from "../../services/GenreService";
import CardComponent from "../../components/CardComponent/CardComponent";
import Loading from "../../components/LoadingComponent/Loading";
import { 
  PageContainer, 
  FilterContainer, 
  ProductsSection, 
  SortContainer, 
  PaginationWrapper, 
  TotalProductsText, 
  WrapperProducts 
} from "./style";

const { Title } = Typography;
const { Option } = Select;

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Lấy giá trị từ URL
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get("page")) || 1,
    limit: parseInt(searchParams.get("limit")) || 12,
    name: searchParams.get("name") || "",
    genres: searchParams.get("genres") ? searchParams.get("genres").split(",") : [],
    price: {
      min: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : null,
      max: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : null
    },
    sort: {
      sortBy: searchParams.get("sortBy") || "",
      order: searchParams.get("order") || "asc"
    }
  });

  // State cho input giá
  const [priceInputs, setPriceInputs] = useState({
    min: searchParams.get("priceMin") || "",
    max: searchParams.get("priceMax") || ""
  });

  // Fetch thể loại sách
  const { data: genresData, isLoading: isLoadingGenres } = useQuery({
    queryKey: ["genres"],
    queryFn: GenreService.getAllGenres,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch danh sách sản phẩm
  const { 
    data: productsData, 
    isLoading: isLoadingProducts,
    refetch 
  } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => ProductService.getProductsPaginated({
      page: filters.page,
      limit: filters.limit,
      name: filters.name || undefined,
      genres: filters.genres.length > 0 ? filters.genres : undefined,
      price: (filters.price.min !== null || filters.price.max !== null) ? filters.price : undefined,
      sort: filters.sort.sortBy ? { sortBy: filters.sort.sortBy, order: filters.sort.order } : undefined
    }),
    staleTime: 1000 * 60 * 3,
  });

  // Cập nhật URL khi filters thay đổi
  useEffect(() => {
    const newSearchParams = {};
    
    if (filters.page !== 1) newSearchParams.page = filters.page.toString();
    if (filters.limit !== 12) newSearchParams.limit = filters.limit.toString();
    if (filters.name) newSearchParams.name = filters.name;
    if (filters.genres.length > 0) newSearchParams.genres = filters.genres.join(",");
    if (filters.price.min !== null) newSearchParams.priceMin = filters.price.min.toString();
    if (filters.price.max !== null) newSearchParams.priceMax = filters.price.max.toString();
    if (filters.sort.sortBy) {
      newSearchParams.sortBy = filters.sort.sortBy;
      newSearchParams.order = filters.sort.order;
    }
    
    setSearchParams(newSearchParams);
  }, [filters, setSearchParams]);

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Xử lý thay đổi số lượng hiển thị mỗi trang
  const handleLimitChange = (limit) => {
    setFilters(prev => ({ ...prev, page: 1, limit }));
  };

  // Xử lý thay đổi bộ lọc thể loại
  const handleGenreChange = (genreId, checked) => {
    setFilters(prev => {
      const newGenres = checked 
        ? [...prev.genres, genreId]
        : prev.genres.filter(id => id !== genreId);
      
      return { ...prev, page: 1, genres: newGenres };
    });
  };

  // Format giá tiền cho input (không có đơn vị tiền tệ)
  const formatNumberInput = (value) => {
    if (!value) return '';
    // Chỉ giữ lại số
    const numericValue = value.toString().replace(/[^\d]/g, '');
    // Định dạng số theo locale Việt Nam
    return new Intl.NumberFormat('vi-VN').format(numericValue);
  };

  // Chuyển từ chuỗi đã định dạng sang số
  const parseInputValue = (formattedValue) => {
    if (!formattedValue) return '';
    // Loại bỏ tất cả ký tự không phải số
    return formattedValue.replace(/[^\d]/g, '');
  };

  // Xử lý thay đổi input giá
  const handlePriceInputChange = (type, value) => {
    // Lưu giá trị dạng số (đã loại bỏ dấu phân cách)
    const numericValue = parseInputValue(value);
    setPriceInputs(prev => ({
      ...prev,
      [type]: numericValue
    }));
  };

  // Xử lý áp dụng bộ lọc giá
  const handleApplyPriceFilter = () => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      price: { 
        min: priceInputs.min ? Number(priceInputs.min) : null, 
        max: priceInputs.max ? Number(priceInputs.max) : null 
      }
    }));
  };

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (value) => {
    if (!value) {
      setFilters(prev => ({
        ...prev,
        sort: { sortBy: "", order: "asc" }
      }));
      return;
    }
    
    const [sortBy, order] = value.split("-");
    setFilters(prev => ({
      ...prev,
      sort: { sortBy, order }
    }));
  };

  // Xử lý reset bộ lọc
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      name: "",
      genres: [],
      price: { min: null, max: null },
      sort: { sortBy: "", order: "asc" }
    });
    setPriceInputs({
      min: "",
      max: ""
    });
  };

  const products = productsData?.data || [];
  const pagination = productsData?.pagination || { total: 0, page: 1, limit: 12, totalPages: 0 };

  // Giá trị cho dropdown sắp xếp
  const sortOptions = [
    { label: 'Tên (A-Z)', value: 'name-asc' },
    { label: 'Tên (Z-A)', value: 'name-desc' },
    { label: 'Giá (Thấp đến cao)', value: 'price-asc' },
    { label: 'Giá (Cao đến thấp)', value: 'price-desc' },
    { label: 'Năm xuất bản (Mới nhất)', value: 'publicationYear-desc' },
    { label: 'Năm xuất bản (Cũ nhất)', value: 'publicationYear-asc' },
    { label: 'Đánh giá (Cao nhất)', value: 'rating-desc' },
    { label: 'Đánh giá (Thấp nhất)', value: 'rating-asc' }
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00A651',
        },
        components: {
          Checkbox: {
            colorPrimary: '#00A651',
          },
          Select: {
            colorPrimary: '#00A651',
          },
          Slider: {
            colorPrimary: '#00A651',
          },
          Pagination: {
            colorPrimary: '#00A651',
          }
        }
      }}
    >
      <PageContainer>
        <Title level={2}>Danh sách sản phẩm</Title>
        
        <Row gutter={24}>
          {/* Phần bộ lọc bên trái */}
          <Col xs={24} sm={24} md={8} lg={6}>
            <FilterContainer>
              <Title level={4} style={{ fontSize: 18, marginBottom: 16 }}>Bộ lọc</Title>
              
              <Divider />
              
              <Title level={5}>Thể loại</Title>
              <Loading isLoading={isLoadingGenres}>
                <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }}>
                  {genresData?.data?.map((genre) => (
                    <Checkbox
                      key={genre._id}
                      checked={filters.genres.includes(genre._id)}
                      onChange={(e) => handleGenreChange(genre._id, e.target.checked)}
                    >
                      {genre.name}
                    </Checkbox>
                  ))}
                </Space>
              </Loading>
              
              <Divider />
              
              <Title level={5}>Giá tiền</Title>
              <Row gutter={[8, 16]} style={{ marginTop: 16 }} align="middle">
                <Col span={12}>
                  <Input 
                    placeholder="Giá tối thiểu"
                    value={formatNumberInput(priceInputs.min)}
                    onChange={(e) => handlePriceInputChange("min", e.target.value)}
                    suffix="đ"
                  />
                </Col>
                <Col span={1} style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>-</span>
                </Col>
                <Col span={11}>
                  <Input 
                    placeholder="Giá tối đa"
                    value={formatNumberInput(priceInputs.max)}
                    onChange={(e) => handlePriceInputChange("max", e.target.value)}
                    suffix="đ"
                  />
                </Col>
              </Row>
              
              <Button 
                type="primary" 
                style={{ width: '100%', marginTop: 16 }}
                onClick={handleApplyPriceFilter}
              >
                Áp dụng
              </Button>
              
              <Divider />
              
              <Button 
                type="default" 
                onClick={handleResetFilters}
                style={{ width: '100%' }}
              >
                Xóa bộ lọc
              </Button>
            </FilterContainer>
          </Col>
          
          {/* Phần danh sách sản phẩm bên phải */}
          <Col xs={24} sm={24} md={18} lg={18}>
            <ProductsSection>
              <SortContainer>
                <Select
                  allowClear
                  placeholder="Sắp xếp theo"
                  style={{ width: 200 }}
                  value={filters.sort.sortBy ? `${filters.sort.sortBy}-${filters.sort.order}` : undefined}
                  onChange={handleSortChange}
                >
                  {sortOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
                
                <Select
                  value={filters.limit}
                  onChange={handleLimitChange}
                  style={{ width: 120 }}
                >
                  <Option value={12}>12 mỗi trang</Option>
                  <Option value={24}>24 mỗi trang</Option>
                  <Option value={48}>48 mỗi trang</Option>
                </Select>
              </SortContainer>
              
              <TotalProductsText>
                <strong>Tìm thấy {pagination.total} sản phẩm</strong>
              </TotalProductsText>
              
              <Loading isLoading={isLoadingProducts}>
                {products.length > 0 ? (
                  <WrapperProducts>
                    {products.map((product) => (
                      <CardComponent
                        key={product._id}
                        images={product.images}
                        name={product.name}
                        originalPrice={product.originalPrice}
                        rating={product.rating}
                        selled={product.selled}
                        _id={product._id}
                      />
                    ))}
                  </WrapperProducts>
                ) : (
                  <Empty description="Không tìm thấy sản phẩm nào" />
                )}
              </Loading>
              
              <PaginationWrapper>
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  pageSize={pagination.limit}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                />
              </PaginationWrapper>
            </ProductsSection>
          </Col>
        </Row>
      </PageContainer>
    </ConfigProvider>
  );
};

export default ProductListPage;