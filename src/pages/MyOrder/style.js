import styled from "styled-components";

export const WrapperContainer = styled.div`
  width: 100%;
  padding: 20px 15vw;
  background-color: #f5f5fa;
  height: fit-content;
`;

export const WrapperListOrder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const WrapperItemOrder = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
`;

export const WrapperHeaderItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
`;

export const WrapperInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const WrapperLabel = styled.span`
  color: #666;
  font-size: 16px;
  min-width: 150px;
`;

export const WrapperValue = styled.span`
  color: #333;
  font-size: 16px;
  font-weight: 500;
`;

export const WrapperStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 5px;
`;

export const WrapperFooterItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
`;

export const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
`;

export const ProductImage = styled.img`
  width: 80px;
  height: 110px;
  object-fit: cover;
  border-radius: 4px;
`;

export const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ProductName = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #333;
`;

export const ProductQuantity = styled.div`
  color: #666;
  margin-top: 5px;
  font-size: 16px;
`;

export const ProductPrice = styled.div`
  color: #ff4d4f;
  font-weight: 600;
  font-size: 18px;
`;

export const TotalPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const TotalLabel = styled.span`
  color: #666;
  font-size: 18px;
`;

export const TotalValue = styled.span`
  color: #ff4d4f;
  font-size: 22px;
  font-weight: 600;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

export const WrapperStyleHeader = styled.div`
  background: rgb(255, 255, 255);
  padding: 9px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  span {
    color: rgb(36, 36, 36);
    font-weight: 400;
    font-size: 13px;
  }
`
export const WrapperStyleHeaderDilivery = styled.div`
  background: rgb(255, 255, 255);
  padding: 9px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  span {
    color: rgb(36, 36, 36);
    font-weight: 400;
    font-size: 13px;
  };
  margin-bottom: 4px;
`

export const WrapperLeft = styled.div`
  width: 910px;
`