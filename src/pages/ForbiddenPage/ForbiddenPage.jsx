import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { WrapperForbiddenPage } from './style';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <WrapperForbiddenPage>
      <div className="content">
        <h1>403</h1>
        <h2>Không có quyền truy cập</h2>
        <p>Bạn không có quyền truy cập vào trang này.</p>
        <Button type="primary" onClick={() => navigate('/')}>
          Về trang chủ
        </Button>
      </div>
    </WrapperForbiddenPage>
  );
};

export default ForbiddenPage; 