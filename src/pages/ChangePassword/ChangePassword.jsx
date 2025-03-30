import React, { useState } from "react";
import { WrapperForm, WrapperInputPage } from "./style";
import { Button, ConfigProvider, Form, Input, message } from "antd";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../../services/UserService";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/LoadingComponent/Loading";
import { useSelector } from "react-redux";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  // Change password mutation
  const mutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => 
      changePassword(user?.id, user?.access_token, currentPassword, newPassword),
    onSuccess: () => {
      message.success("Đổi mật khẩu thành công!", 3);
      navigate("/profile-user");
    },

    onError: (error) => {
      message.error(error?.response?.data?.message || "Đổi mật khẩu thất bại!", 3);
    },
  });

  const { isPending } = mutation;

  const handleChangePassword = () => {
    mutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div
      style={{
        backgroundColor: "#F0F0F0",
        padding: "80px 35vw",
        minWidth: "fit-content",
      }}
    >
      <Loading isLoading={isPending}>
        <WrapperInputPage>
          <div
            style={{
              color: "black",
              fontSize: "24px",
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            Đổi mật khẩu
          </div>

          <WrapperForm>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "#00A651",
                },
              }}
            >
              <Form
                name="change-password"
                onFinish={handleChangePassword}
                autoComplete="off"
              >
                <Form.Item
                  name="currentPassword"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu hiện tại!",
                    },
                  ]}
                >
                  <Input.Password
                    placeholder="Mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu mới!",
                    },
                    {
                      min: 8,
                      message: "Mật khẩu phải có ít nhất 8 ký tự!",
                    },
                  ]}
                >
                  <Input.Password
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng xác nhận mật khẩu mới!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Mật khẩu xác nhận không khớp!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isPending}
                    style={{
                      width: "100%",
                      height: "40px",
                      fontSize: "16px",
                    }}
                  >
                    Đổi mật khẩu
                  </Button>
                </Form.Item>
              </Form>
            </ConfigProvider>
          </WrapperForm>
        </WrapperInputPage>
      </Loading>
    </div>
  );
};

export default ChangePassword; 