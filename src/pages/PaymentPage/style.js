import { Checkbox, Radio } from "antd";
import styled from "styled-components";

export const WrapperStyleHeader = styled.div`
  background: rgb(255, 255, 255);
  padding: 9px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  span {
    color: rgb(36, 36, 36);
    font-weight: 500;
    font-size: 13px;
  }
`;
export const WrapperStyleHeaderDelivery = styled.div`
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
  margin-bottom: 4px;
`;

export const WrapperLeft = styled.div`
  flex: 1;
  padding: 16px 0;
`;

export const WrapperListOrder = styled.div``;

export const WrapperItemOrder = styled.div`
  display: flex;
  align-items: center;
  padding: 9px 16px;
  background: #fff;
  margin-top: 12px;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  gap: 10px;
`;

export const WrapperPriceDiscount = styled.span`
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
  margin-left: 4px;
`;
export const WrapperCountOrder = styled.div`
  height: 40px;
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const WrapperRight = styled.div`
  width: 320px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
`;

export const WrapperInfo = styled.div`
  padding: 17px 20px;
  border-radius: 6px;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

export const WrapperTotal = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 20px;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  
  & > span:first-child {
    font-weight: 500;
  }
  
  & > span:last-child {
    text-align: right;
  }
`;

export const CustomCheckbox = styled(Checkbox)`
  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: #01c661;
    border-color: #01c661;
  }
  .ant-checkbox:hover .ant-checkbox-inner {
    border-color: #01c661;
  }
`;

export const WrapperNameProductOrder = styled.div`
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  display: -webkit-box;
  &:hover {
    color: #00a651;
  }
`;

export const WrapperChangeInfo = styled.div`
  color: #00a551;
  text-decoration: underline;
  font-size: 14px;
  &:hover {
    opacity: 0.8;
  }
`;

export const Label = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 15px;
  display: block;
`;

export const WrapperRadio = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #fff;

  & .ant-radio-wrapper {
    margin-right: 0 !important;
    font-size: 15px;
    padding: 10px 12px;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
  }

  & .ant-radio-wrapper-checked {
    border-color: #00a551;
    background-color: #e6f7ee;
  }
`;

export const WrapperInputNumber = styled.div`
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 50px;
  height: 25px;
`;

export const WrapperStyleContent = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 0 20px;
`;

export const WrapperInfoUser = styled.div`
  padding: 17px 20px;
  border-bottom: 1px solid #f5f5f5;
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  width: 100%;
`;

export const WrapperInfoPay = styled.div`
  padding: 17px 20px;
  border-bottom: 1px solid #f5f5f5;
  background-color: #fff;
  width: 100%;
`;

export const WrapperItemOrderInfo = styled.div`
  padding: 17px 20px;
  border-bottom: 1px solid #f5f5f5;
  background-color: #fff;
  width: 100%;
`;

export const WrapperAllPrice = styled.div`
  padding: 17px 20px;
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 6px;
  background-color: #fff;
  width: 100%;
`;

export const WrapperUpdateInfo = styled.div`
  display: flex;
  justify-content: space-between;
  span.change-user-info {
    color: #0089ff;
    flex: 1;
    cursor: pointer;
  }
`;

export const PaymentMethodWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
`;

export const PaymentOptionCard = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid ${(props) => (props.isSelected ? "#00a551" : "#e0e0e0")};
  border-radius: 8px;
  gap: 15px;
  position: relative;
  transition: all 0.3s ease;
  background-color: ${(props) => (props.isSelected ? "#f7fcf9" : "#fff")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  
  &:hover {
    border-color: ${(props) => (props.disabled ? "#e0e0e0" : "#00a551")};
    box-shadow: ${(props) => (props.disabled ? "none" : "0 2px 8px rgba(0, 165, 81, 0.15)")};
  }
  
  .payment-icon {
    min-width: 80px;
    display: flex;
    justify-content: center;
  }
  
  .payment-info {
    flex: 1;
    
    h4 {
      font-size: 17px;
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
    }
    
    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    
    .tap-qr {
      margin-top: 5px;
      color: #00a551;
      font-style: italic;
      font-size: 13px;
    }
  }
  
  .check-icon {
    position: absolute;
    top: 15px;
    right: 15px;
    color: #00a551;
    font-size: 18px;
  }
`;

export const QRCodeWrapper = styled.div`
  display: flex;
  gap: 30px;
  padding: 20px 10px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const PaymentInstructions = styled.div`
  flex: 1;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
  }
  
  p {
    margin-bottom: 12px;
    font-size: 15px;
    line-height: 1.5;
    color: #333;
  }
  
  .payment-note {
    margin-top: 20px;
    padding: 12px;
    background-color: #fff8e6;
    border-radius: 6px;
    border-left: 3px solid #f29d38;
    font-size: 14px;
    line-height: 1.5;
    
    .anticon {
      color: #f29d38;
      margin-right: 8px;
    }
  }
`;
