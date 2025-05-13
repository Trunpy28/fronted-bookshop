import React, { useState } from "react";
import { Button, Card, Col, Form, Input, Row, Space, Statistic, Table, Modal, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as GenreService from "../../services/GenreService";
import Loading from "../LoadingComponent/Loading";
import * as message from "../../components/Message/Message";
import { useSelector } from "react-redux";
import { WrapperHeader } from "../AdminProduct/style";
import TableComponent from "../TableComponent/TableComponent";

const AdminGenre = () => {
  const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
  const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const user = useSelector((state) => state.user);

  const { data: genres, refetch, isLoading: isLoadingGenres } = useQuery({
    queryKey: ["admin-genres"],
    queryFn: () => GenreService.getAllGenres(),
    enabled: !!user?.access_token && user?.isAdmin,
  });

  const mutationCreate = useMutation({
    mutationFn: (data) => GenreService.createGenre(data, user?.access_token),
    onSuccess: () => {
      message.success("Thêm thể loại thành công");
      refetch();
      setIsModalOpenCreate(false);
    },
    onError: () => {
      message.error("Thêm thể loại thất bại");
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: (data) => {
      return GenreService.updateGenre(data, user?.access_token)
    },
    onSuccess: () => {
      message.success("Cập nhật thể loại thành công");
      refetch();
      setIsModalOpenUpdate(false);
    },
    onError: () => {
      message.error("Cập nhật thể loại thất bại");
    },
  });

  const mutationDelete = useMutation({
    mutationFn: (id) => GenreService.deleteGenre(id, user?.access_token),
    onSuccess: () => {
      message.success("Xóa thể loại thành công");
      refetch();
    },
    onError: () => {
      message.error("Xóa thể loại thất bại");
    },
  });

  const handleCreateGenre = async () => {
    try {
      const values = await formCreate.validateFields();
      mutationCreate.mutate(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };
  
  const handleUpdateGenre = async () => {
    try {
      const values = await formUpdate.validateFields();
      mutationUpdate.mutate({ genreData: values, id: selectedGenre });
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleDeleteGenre = (id) => {
    mutationDelete.mutate(id);
  };

  const handleEditGenre = (record) => {
    formUpdate.setFieldsValue(record);
    setSelectedGenre(record);
    setIsModalOpenUpdate(true);
  };

  const handleConfirmDelete = (id) => {
    setSelectedGenre(id);
    setIsModalOpenDelete(true);
  };

  const handleDeleteConfirmed = () => {
    if (selectedGenre) {
      handleDeleteGenre(selectedGenre);
      setIsModalOpenDelete(false);
    }
  };

  const columns = [
    {
      title: "Tên thể loại",
      dataIndex: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa thông tin">
            <EditOutlined style={{ color: "orange", fontSize: "30px", cursor: "pointer" }} onClick={() => handleEditGenre(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined style={{ color: "red", fontSize: "30px", cursor: "pointer" }} onClick={() => handleConfirmDelete(record._id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const dataTable =
    genres?.data?.length &&
    genres?.data?.map((genre) => {
      return {
        ...genre,
        key: genre._id
      };
    });
    
  return (
    <Loading isLoading={mutationCreate.isPending || mutationUpdate.isPending || mutationDelete.isPending || isLoadingGenres}>
      <WrapperHeader>Quản lý thể loại</WrapperHeader>
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          style={{
            height: "150px",
            width: "150px",
            borderRadius: "6px",
            borderStyle: "dashed",
          }}
          onClick={() => setIsModalOpenCreate(true)}
        >
          <PlusOutlined style={{ fontSize: "40px" }} />
        </Button>
        <Row gutter={40} style={{ width: "40vw" }}>
          <Col span={10}>
            <Card style={{ border: "1px solid #00B55F" }}>
              <Statistic title="Số thể loại" value={genres?.data?.length} />
            </Card>
          </Col>
        </Row>
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <TableComponent
          columns={columns}
          data={dataTable}
          isLoading={isLoadingGenres}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setSelectedGenre(record._id);
              },
            };
          }}
        />
      </div>

      <Modal
        title="Thêm thể loại"
        open={isModalOpenCreate}
        onCancel={() => setIsModalOpenCreate(false)}
        onOk={handleCreateGenre}
        confirmLoading={mutationCreate.isPending}
      >
        <Form form={formCreate} layout="vertical">
          <Form.Item
            label="Tên thể loại"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên thể loại!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea className="min-h-24"/>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cập nhật thể loại"
        open={isModalOpenUpdate}
        onCancel={() => setIsModalOpenUpdate(false)}
        onOk={handleUpdateGenre}
        confirmLoading={mutationUpdate.isPending}
      >
        <Form form={formUpdate} layout="vertical">
          <Form.Item
            label="Tên thể loại"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên thể loại!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea className="min-h-24"/>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận xóa"
        open={isModalOpenDelete}
        onCancel={() => setIsModalOpenDelete(false)}
        onOk={handleDeleteConfirmed}
      >
        <p>Bạn có chắc chắn muốn xóa thể loại này không?</p>
      </Modal>
    </Loading>
  );
};

export default AdminGenre; 