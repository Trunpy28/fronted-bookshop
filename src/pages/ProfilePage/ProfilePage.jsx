import React, { useEffect, useState } from "react";
import {
  ChangingButton,
  WrapperContentProfile,
  WrapperHeader,
  WrapperUploadFile,
  AddressForm,
  ProfileContainer,
  AvatarContainer,
  FormContainer,
} from "./style";
import { ConfigProvider, Form, Input, Button, Upload, Select, Card } from "antd";
import { useDispatch, useSelector } from "react-redux";
import * as UserService from "../../services/UserService";
import { useMutation } from "@tanstack/react-query";
import Loading from "../../components/LoadingComponent/Loading";
import * as message from "../../components/Message/Message";
import { updateUser } from "../../redux/slices/userSlice";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { getBase64 } from "../../utils";
import addressVietNam from "../../constants/addressConstants";

const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const addressFormItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const ProfilePage = () => {
  const user = useSelector((state) => state.user);
  const [form] = Form.useForm();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [avatar, setAvatar] = useState("");
  
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const updateUserMutation = useMutation({
    mutationFn: (data) => {
      const { id, access_token, ...rest } = data;
      return UserService.updateUser(id, access_token, rest);
    },
    onSuccess: () => {
      message.success("Cập nhật thông tin thành công");
      handleGetDetailsUser(user?.id, user?.access_token);
    },
    onError: () => {
      message.error("Cập nhật thông tin thất bại");
    }
  });

  const dispatch = useDispatch();

  const handleGetDetailsUser = async (id, token) => {
    const res = await UserService.getDetailsUser(id, token);
    dispatch(updateUser({ ...res?.data, access_token: token }));
  };

  useEffect(() => {
    setName(user?.name);
    setEmail(user?.email);
    setPhone(user?.phone);
    
    const userCity = user?.address?.city || '';
    const userDistrict = user?.address?.district || '';
    const userWard = user?.address?.ward || '';
    
    setCity(userCity);
    if (userCity) {
      const selectedCity = addressVietNam.find(c => c.name === userCity);
      if (selectedCity) {
        setDistricts(selectedCity.districts);
        setDistrict(userDistrict);
        
        if (userDistrict) {
          const selectedDistrict = selectedCity.districts.find(d => d.name === userDistrict);
          if (selectedDistrict) {
            setWards(selectedDistrict.wards);
            setWard(userWard);
          }
        }
      }
    }
    
    setDetailedAddress(user?.address?.detailedAddress || '');
    setAvatar(user?.avatar);
  }, [user]);

  useEffect(() => {
    if (city && city !== user?.address?.city) {
      const selectedCity = addressVietNam.find(c => c.name === city);
      if (selectedCity) {
        setDistricts(selectedCity.districts);
        setDistrict('');
        setWard('');
      }
    }
  }, [city, user?.address?.city]);

  useEffect(() => {
    if (district && districts.length && district !== user?.address?.district) {
      const selectedDistrict = districts.find(d => d.name === district);
      if (selectedDistrict) {
        setWards(selectedDistrict.wards);
        setWard('');
      }
    }
  }, [district, districts, user?.address?.district]);

  const handleOnChangeName = (e) => setName(e.target.value);
  const handleOnChangePhone = (e) => setPhone(e.target.value);
  const handleOnChangeCity = (value) => setCity(value);
  const handleOnChangeDistrict = (value) => setDistrict(value);
  const handleOnChangeWard = (value) => setWard(value);
  const handleOnChangeDetailedAddress = (e) => setDetailedAddress(e.target.value);

  const handleOnChangeAvatar = async ({ file }) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setAvatar(file.preview);
  };

  const handleUpdate = () => {
    updateUserMutation.mutate({
      id: user?.id,
      name,
      phone,
      address: {
        city,
        district,
        ward,
        detailedAddress
      },
      access_token: user?.access_token,
    });
  };

  const handleUpdateAvatar = () => {
    updateUserMutation.mutate({
      id: user?.id,
      avatar,
      access_token: user?.access_token,
    });
  };

  return (
    <div style={{ padding: "20px 15vw", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <WrapperHeader>Thông tin người dùng</WrapperHeader>
      <Loading isLoading={updateUserMutation.isPending}>
        <FormContainer>
          <ProfileContainer>
            <WrapperContentProfile>
              <ConfigProvider theme={{ token: { colorPrimary: "#00A651" } }}>
                <Form form={form} {...formItemLayout}>
                  <Form.Item label="Email">
                    <Input
                      value={email}
                      disabled
                      style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                    />
                  </Form.Item>

                  <Form.Item label="Họ và tên">
                    <Input
                      value={name}
                      onChange={handleOnChangeName}
                    />
                  </Form.Item>

                  <Form.Item label="Số điện thoại">
                    <Input
                      value={phone}
                      onChange={handleOnChangePhone}
                    />
                  </Form.Item>

                  <AddressForm>
                    <div style={{ fontWeight: "bold", marginBottom: "15px" }}>Địa chỉ</div>
                    
                    <Form.Item label="Tỉnh/Thành phố" {...addressFormItemLayout}>
                      <Select
                        placeholder="Chọn Tỉnh/Thành phố"
                        onChange={handleOnChangeCity}
                        value={city || undefined}
                      >
                        {addressVietNam.map(city => (
                          <Option key={city.code} value={city.name}>
                            {city.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <Form.Item label="Quận/Huyện" {...addressFormItemLayout}>
                      <Select
                        placeholder="Chọn Quận/Huyện"
                        onChange={handleOnChangeDistrict}
                        value={district || undefined}
                        disabled={!city}
                      >
                        {districts.map(dist => (
                          <Option key={dist.code} value={dist.name}>
                            {dist.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <Form.Item label="Phường/Xã" {...addressFormItemLayout}>
                      <Select
                        placeholder="Chọn Phường/Xã"
                        onChange={handleOnChangeWard}
                        value={ward || undefined}
                        disabled={!district}
                      >
                        {wards.map(ward => (
                          <Option key={ward.code} value={ward.name}>
                            {ward.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <Form.Item label="Địa chỉ chi tiết" {...addressFormItemLayout}>
                      <Input
                        placeholder="Số nhà, tên đường..."
                        value={detailedAddress}
                        onChange={handleOnChangeDetailedAddress}
                      />
                    </Form.Item>
                  </AddressForm>

                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <ChangingButton onClick={handleUpdate}>Cập nhật thông tin</ChangingButton>
                  </div>
                </Form>
              </ConfigProvider>
            </WrapperContentProfile>

            <AvatarContainer>
              <Card title="Ảnh đại diện" style={{ width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                  {avatar ? (
                    <img
                      src={avatar}
                      style={{
                        height: "150px",
                        width: "150px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      alt="Ảnh đại diện"
                    />
                  ) : (
                    <UserOutlined style={{ fontSize: '120px', color: '#ccc' }} />
                  )}
                  
                  <ConfigProvider theme={{ token: { colorPrimary: "#00A651" } }}>
                    <WrapperUploadFile
                      onChange={handleOnChangeAvatar}
                      showUploadList={false}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </WrapperUploadFile>
                  </ConfigProvider>
                  
                  <ChangingButton onClick={handleUpdateAvatar}>
                    Cập nhật ảnh đại diện
                  </ChangingButton>
                </div>
              </Card>
            </AvatarContainer>
          </ProfileContainer>
        </FormContainer>
      </Loading>
    </div>
  );
};

export default ProfilePage;
