import React from "react";
import SliderComponent from "../../components/SliderComponent/SliderComponent";
import slider1 from "../../assets/images/slider1.jpg";
import slider2 from "../../assets/images/slider2.webp";
import slider3 from "../../assets/images/slider3.webp";
import slider4 from "../../assets/images/slider4.jpg";
import slider5 from "../../assets/images/slider5.jpg";
import CardComponent from "../../components/CardComponent/CardComponent";
import { WrapperProducts, WrapperGenreTitle, GenreSection, PageContainer } from "./style";
import { useQuery, useQueries } from "@tanstack/react-query";
import * as ProductService from "../../services/ProductService";
import * as GenreService from "../../services/GenreService";
import * as VoucherService from "../../services/VoucherService";
import Loading from "../../components/LoadingComponent/Loading";
import { Button, ConfigProvider, Empty } from "antd";
import { ArrowRightOutlined, AppstoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  
  const { data: genresData, isLoading: isLoadingGenres } = useQuery({
    queryKey: ["genres"],
    queryFn: GenreService.getAllGenres,
    staleTime: 1000 * 60 * 5,
  });

  const { data: vouchersData, isLoading: isLoadingVouchers } = useQuery({
    queryKey: ["activeVouchers"],
    queryFn: VoucherService.getActiveVouchers,
    staleTime: 1000 * 60 * 5,
  });

  const genreQueries = (genresData?.data || []).map(genre => ({
    queryKey: ["productsByGenre", genre._id],
    queryFn: () => ProductService.getProductsByGenre(genre._id, 1, 5),
    staleTime: 1000 * 60 * 5,
  }));

  const genreProductsResults = useQueries({
    queries: genreQueries.length > 0 ? genreQueries : [],
  });

  const handleViewMoreGenre = (genreId) => {
    navigate(`/products?genres=${genreId}`);
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  const handleVoucherClick = () => {
    navigate('/vouchers');
  };

  // Lọc ra các voucher có ảnh
  const voucherImages = vouchersData?.data?.filter(voucher => voucher.image)?.map(voucher => voucher.image) || [];

  return (
    <PageContainer>
      <Loading isLoading={isLoadingVouchers}>
        {voucherImages.length > 0 ? (
          <div style={{ marginBottom: "30px", borderRadius: "12px", overflow: "hidden" }}>
            <SliderComponent
              arrImages={voucherImages}
              onClick={handleVoucherClick}
            />
          </div>
        ) : (
          <div style={{ marginBottom: "30px", borderRadius: "12px", overflow: "hidden" }}>
            <SliderComponent
              arrImages={[slider1, slider2, slider3, slider4, slider5]}
            />
          </div>
        )}
      </Loading>
      
      {/* Nút "Xem tất cả sản phẩm" */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <ConfigProvider
          theme={{
            components: {
              Button: {
                colorPrimary: '#00A651',
                colorPrimaryHover: '#008E45',
                colorPrimaryActive: '#007A3B',
                defaultBg: '#00A651',
                defaultColor: '#ffffff',
                defaultBorderColor: '#00A651',
                defaultHoverBg: '#008E45',
                defaultHoverColor: '#ffffff',
                defaultHoverBorderColor: '#008E45',
              }
            }
          }}
        >
          <Button 
            type="primary" 
            size="large" 
            icon={<AppstoreOutlined />}
            onClick={handleViewAllProducts}
            style={{ 
              borderRadius: "6px", 
              padding: "0 30px",
              height: "48px",
              fontSize: "16px"
            }}
          >
            Xem tất cả sản phẩm
          </Button>
        </ConfigProvider>
      </div>
      
      <Loading isLoading={isLoadingGenres}>
        {(genresData?.data || []).map((genre, index) => {
          const productsResult = genreProductsResults[index];
          
          const products = productsResult?.data?.data || [];
          const isLoadingProducts = productsResult?.isLoading;

          if (products.length === 0 && !isLoadingProducts) {
            return null;
          }

          return (
            <GenreSection key={genre._id}>
              <WrapperGenreTitle>
                {genre.name}
              </WrapperGenreTitle>
              <Loading isLoading={isLoadingProducts}>
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
                {products.length > 0 && (
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <ConfigProvider
                      theme={{
                        components: {
                          Button: {
                            colorPrimary: '#00A651',
                            colorPrimaryHover: '#008E45',
                            colorPrimaryActive: '#007A3B',
                            defaultBg: '#00A651',
                            defaultColor: '#ffffff',
                            defaultBorderColor: '#00A651',
                            defaultHoverBg: '#008E45',
                            defaultHoverColor: '#ffffff',
                            defaultHoverBorderColor: '#008E45',
                          }
                        }
                      }}
                    >
                      <Button 
                        type="primary" 
                        onClick={() => handleViewMoreGenre(genre._id)}
                        icon={<ArrowRightOutlined />}
                        size="large"
                        style={{ borderRadius: "6px" }}
                      >
                        Xem thêm
                      </Button>
                    </ConfigProvider>
                  </div>
                )}
              </Loading>
            </GenreSection>
          );
        })}
      </Loading>
    </PageContainer>
  );
};

export default HomePage;
