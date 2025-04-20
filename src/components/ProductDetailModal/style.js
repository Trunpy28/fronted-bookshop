import styled from 'styled-components';
import { Typography, Image } from 'antd';

const { Text } = Typography;

export const WrapperContainer = styled.div`
  padding: 20px;
`;

export const WrapperItemOrder = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

export const WrapperHeaderItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ImageContainer = styled.div`
  width: 350px;
`;

export const WrapperInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
`;

export const WrapperLabel = styled(Text)`
  color: #666;
  font-weight: 500;
  font-size: 16px;
`;

export const WrapperValue = styled(Text)`
  color: #333;
  font-weight: 600;
  font-size: 16px;
`;

export const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 50px;
`;

export const DescriptionWrapper = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 4px;

  p {
    font-size: 16px;
    line-height: 1.5;
  }
`; 