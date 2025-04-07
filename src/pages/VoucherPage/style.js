import styled from 'styled-components';
import { Card } from 'antd';

export const WrapperVoucherContainer = styled.div`
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
`;

export const VoucherCard = styled(Card)`
  border-radius: 10px;
  overflow: hidden;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-3px);
  }

  .ant-card-body {
    padding: 0;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
`;

export const VoucherHeader = styled.div`
  background-color: #e6f7ee;
  padding: 12px 16px;
  border-bottom: 1px dashed #d9d9d9;
`;

export const VoucherContent = styled.div`
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  
  p {
    margin-bottom: 0;
  }
`;

export const VoucherFooter = styled.div`
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-top: 1px dashed #d9d9d9;
`;

export const VoucherDetailModal = styled.div`
  padding: 8px 0;
`;

export const CopyButton = styled.button`
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #00a551;
  padding: 4px 8px;
  font-size: 14px;
  
  &:hover {
    background-color: #f0f0f0;
    border-radius: 4px;
  }
`;

export const ViewDetailsButton = styled.button`
  background: transparent;
  border: 1px solid #00a551;
  color: #00a551;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #f0fff7;
  }
`; 