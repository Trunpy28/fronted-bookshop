import React from "react";
import { DownOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Dropdown, ConfigProvider, Space } from "antd";
import { LinkNavBar, TypeProductWrapper } from "./style";
import { useNavigate } from "react-router-dom";
import * as GenreService from "../../services/GenreService";
import { useQuery } from "@tanstack/react-query";
import Loading from "../LoadingComponent/Loading";
const HeaderNavBar = () => {
  const navigate = useNavigate();
  
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
        navigate(`/product/genre/${genre._id}`, { state: genre.name });
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
          <LinkNavBar to={'/'}>
            <Space>TRANG CHỦ</Space>
          </LinkNavBar>
          <LinkNavBar to={'/contact'}>
            <Space>LIÊN HỆ</Space>
          </LinkNavBar>
          <LinkNavBar to={'/'}>
            <Space>TIN TỨC</Space>
          </LinkNavBar>
          <LinkNavBar to={'/'}>
            <Space>KHUYẾN MẠI</Space>
          </LinkNavBar>
          <LinkNavBar to={'/'}>
            <Space>CHÍNH SÁCH KHÁCH HÀNG</Space>
          </LinkNavBar>
        </ConfigProvider>
      </TypeProductWrapper>
  );
};

export default HeaderNavBar;
