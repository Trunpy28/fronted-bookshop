import React from "react";
import { DownOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Dropdown, ConfigProvider, Space } from "antd";
import { LinkNavBar, TypeProductWrapper } from "./style";
import { useNavigate, useLocation } from "react-router-dom";
import * as GenreService from "../../services/GenreService";
import { useQuery } from "@tanstack/react-query";
import Loading from "../LoadingComponent/Loading";

const HeaderNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: genresData, isPending } = useQuery({
    queryKey: ['genres'],
    queryFn: GenreService.getAllGenres,
    staleTime: 1000 * 60 * 5,
  });

  const genres = genresData?.data || [];

  const genreItems = genres.map((genre) => {
    return {
      key: genre._id,
      label: <span style={{ paddingLeft: '20px' }}>{genre.name}</span>,
      onClick: () => {
        navigate(`/products?genres=${genre._id}`);
      },
    }
  })
  
  return (
      <TypeProductWrapper>
        <ConfigProvider
          theme={{
            token: {
              // Seed Token
              fontSize: "16px",
              lineHeight: "40px",
              marginXXS: "0px 20px",
              fontWeightStrong: "bold",
              controlItemBgHover: "lightgreen",
            },
          }}
        >
          <Dropdown
            menu={{
              items: genreItems,
            }}
          >
            <LinkNavBar onClick={(e) => e.preventDefault()}>
              <Space>
                <UnorderedListOutlined />
                DANH MỤC SẢN PHẨM
                <DownOutlined />
              </Space>
            </LinkNavBar>
          </Dropdown>
          <LinkNavBar to={'/'} isActive={location.pathname === '/'}>
            <Space>TRANG CHỦ</Space>
          </LinkNavBar>
          <LinkNavBar to={'/vouchers'} isActive={location.pathname.includes('/vouchers')}>
            <Space>KHUYẾN MÃI</Space>
          </LinkNavBar>
          <LinkNavBar to={'/contact'} isActive={location.pathname.includes('/contact')}>
            <Space>LIÊN HỆ</Space>
          </LinkNavBar>
        </ConfigProvider>
      </TypeProductWrapper>
  );
};

export default HeaderNavBar;
