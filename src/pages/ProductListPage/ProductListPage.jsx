import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  ConfigProvider,
  Tag
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
import { SearchOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Lấy từ khóa tìm kiếm từ URL
  const searchQuery = searchParams.get("q") || "";
  const isElasticsearchSearch = !!searchQuery;
  
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
    queryKey: ["products", isElasticsearchSearch ? searchQuery : filters, isElasticsearchSearch ? filters.sort : null],
    queryFn: () => {
      if (isElasticsearchSearch) {
        // Chuyển đổi cấu trúc sort từ {sortBy, order} sang chuỗi cho Elasticsearch
        let sortParam = "relevance"; // Mặc định là sắp xếp theo độ liên quan
        if (filters.sort.sortBy) {
          sortParam = `${filters.sort.sortBy}-${filters.sort.order}`;
        }
        
        // Sử dụng API tìm kiếm Elasticsearch
        return ProductService.searchProducts({
          q: searchQuery,
          page: filters.page,
          limit: filters.limit,
          sort: sortParam
        });
      } else {
        // Sử dụng API thông thường
        return ProductService.getProductsPaginated({
          page: filters.page,
          limit: filters.limit,
          name: filters.name || undefined,
          genres: filters.genres.length > 0 ? filters.genres : undefined,
          price: (filters.price.min !== null || filters.price.max !== null) ? filters.price : undefined,
          sort: filters.sort.sortBy ? { sortBy: filters.sort.sortBy, order: filters.sort.order } : undefined
        });
      }
    },
    staleTime: 1000 * 60 * 3,
  });

  // Cập nhật URL khi filters thay đổi
  useEffect(() => {
    // Tạo params mới cho URL
    const newSearchParams = new URLSearchParams();
    
    // Luôn giữ tham số q nếu đang tìm kiếm Elasticsearch
    if (isElasticsearchSearch) {
      newSearchParams.set("q", searchQuery);
    }
    
    // Các tham số chung cho cả hai loại tìm kiếm
    if (filters.page !== 1) {
      newSearchParams.set("page", filters.page.toString());
    }
    
    if (filters.limit !== 12) {
      newSearchParams.set("limit", filters.limit.toString());
    }
    
    // Chỉ thêm các tham số bộ lọc cho tìm kiếm thông thường
    if (!isElasticsearchSearch) {
      if (filters.name) {
        newSearchParams.set("name", filters.name);
      }
      
      if (filters.genres.length > 0) {
        newSearchParams.set("genres", filters.genres.join(","));
      }
      
      if (filters.price.min !== null) {
        newSearchParams.set("priceMin", filters.price.min.toString());
      }
      
      if (filters.price.max !== null) {
        newSearchParams.set("priceMax", filters.price.max.toString());
      }
    }
    
    // Cấu hình sắp xếp cho cả hai loại tìm kiếm
    if (filters.sort.sortBy) {
      newSearchParams.set("sortBy", filters.sort.sortBy);
      newSearchParams.set("order", filters.sort.order);
    }
    
    setSearchParams(newSearchParams);
  }, [filters, searchQuery, isElasticsearchSearch, setSearchParams]);

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
    if (isElasticsearchSearch) {
      // Chuyển về tìm kiếm thông thường nếu đang dùng Elasticsearch
      clearElasticsearchSearch();
    }
    
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
    if (isElasticsearchSearch) {
      // Chuyển về tìm kiếm thông thường nếu đang dùng Elasticsearch
      clearElasticsearchSearch();
    }
    
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
  
  // Xóa tìm kiếm Elasticsearch và chuyển về tìm kiếm thông thường
  const clearElasticsearchSearch = () => {
    const newSearchParams = new URLSearchParams();
    
    // Giữ lại các tham số hiện tại trừ q
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'q') {
        newSearchParams.append(key, value);
      }
    }
    
    setSearchParams(newSearchParams);
  };

  const products = productsData?.data || productsData?.products || [];
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
  
  // Thêm option "Độ liên quan" cho tìm kiếm Elasticsearch
  const elasticSortOptions = [
    { label: 'Độ liên quan', value: '' }, // Để trống để reset về default
    ...sortOptions
  ];
  
  // State cho input giá
  const [priceInputs, setPriceInputs] = useState({
    min: searchParams.get("priceMin") || "",
    max: searchParams.get("priceMax") || ""
  });

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
        <Title level={2}>
          {isElasticsearchSearch 
            ? `Kết quả tìm kiếm cho "${searchQuery}"` 
            : "Danh sách sản phẩm"}
        </Title>
        
        {isElasticsearchSearch && (
          <Tag 
            color="blue" 
            closable 
            onClose={clearElasticsearchSearch}
            style={{ marginBottom: 16 }}
          >
            <SearchOutlined /> {searchQuery}
          </Tag>
        )}
        
        <Row gutter={24}>
          {/* Phần bộ lọc bên trái - luôn hiển thị */}
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
          <Col xs={24} sm={24} md={16} lg={18}>
            <ProductsSection>
              <SortContainer>
                <Select
                  allowClear
                  placeholder="Sắp xếp theo"
                  style={{ width: 200 }}
                  value={filters.sort.sortBy ? `${filters.sort.sortBy}-${filters.sort.order}` : undefined}
                  onChange={handleSortChange}
                >
                  {(isElasticsearchSearch ? elasticSortOptions : sortOptions).map(option => (
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
                        key={product._id || product.id}
                        images={product.images || []}
                        name={product.name}
                        originalPrice={product.originalPrice || product.price}
                        rating={product.rating}
                        selled={product.selled}
                        _id={product._id || product.id}
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