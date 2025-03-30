import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { WrapperNotFoundPage } from './style';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <WrapperNotFoundPage>
      <div className="content">
        <h1>404</h1>
        <h2>Không tìm thấy trang</h2>
        <p>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <Button type="primary" onClick={() => navigate('/')}>
          Về trang chủ
        </Button>
      </div>
    </WrapperNotFoundPage>
  );
};

export default NotFoundPage;

