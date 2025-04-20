import styled from "styled-components";

export const WrapperContainer = styled.div`
  width: 100%;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

export const OrderInfo = styled.div`
  width: 100%;
`;

export const WrapperInfo = styled.div`
  padding: 20px;
  border-radius: 8px;
  background-color: #f7f7f7;
`;

export const OrderStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
`;

export const OrderDetails = styled.div`
  margin-top: 20px;
  background-color: #f7f7f7;
  border-radius: 8px;
  padding: 20px;
`;

export const ProductList = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
`;

export const WrapperItemOrder = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

export const WrapperStyleHeader = styled.div`
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
`;

export const WrapperNameProductOrder = styled.span``;

export const WrapperCountOrder = styled.div``;

export const PriceSummary = styled.div`
  margin-top: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: white;
`;

export const PriceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const PriceTotal = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Label = styled.div`
  font-weight: 600;
`;

export const PaymentInfo = styled.div`
  padding: 20px;
  border-radius: 8px;
  background-color: #f7f7f7;
`;

export const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    height: auto;
  }
`; 