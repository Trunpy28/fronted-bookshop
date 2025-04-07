import React from "react";
import { Form, Input, Button } from "antd";

const { TextArea } = Input;

const ContactPage = () => {
  const onFinish = (values) => {
    console.log("Form values:", values);
  };

  const inputStyle = {
    ':hover': {
      borderColor: '#00A651',
    }
  };

  return (
    <div className="flex flex-col items-center p-8 md:px-[15vw]">
      <h1 className="text-2xl font-bold pb-4">Liên hệ</h1>
      
      <div className="w-full h-[400px] mb-8">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d1075.852278218103!2d105.84413589485185!3d21.002339701763773!3m2!1i1024!2i768!4f13.1!5e0!3m2!1svi!2s!4v1717945871409!5m2!1svi!2s"
          className="w-full h-full border-0"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="BKshop Location"
        ></iframe>
      </div>
      
      <Form
        name="contactForm"
        onFinish={onFinish}
        layout="vertical"
        className="w-full max-w-[600px] my-4"
      >
        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập tên của bạn!' }]}
        >
          <Input 
            placeholder="Tên của bạn" 
            size="large" 
            style={inputStyle}
            className="hover:border-green-600 focus:border-green-600"
          />
        </Form.Item>
        
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email của bạn!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input 
            placeholder="Email của bạn" 
            size="large" 
            style={inputStyle}
            className="hover:border-green-600 focus:border-green-600"
          />
        </Form.Item>
        
        <Form.Item
          name="subject"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
        >
          <Input 
            placeholder="Tiêu đề" 
            size="large" 
            style={inputStyle}
            className="hover:border-green-600 focus:border-green-600"
          />
        </Form.Item>
        
        <Form.Item
          name="message"
          label="Nội dung"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
        >
          <TextArea
            placeholder="Nội dung"
            rows={5}
            size="large"
            style={inputStyle}
            className="hover:border-green-600 focus:border-green-600"
          />
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit"
            style={{ backgroundColor: "#00A651" }}
            size="large"
          >
            Gửi
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ContactPage;
