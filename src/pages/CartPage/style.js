import styled from "styled-components";

export const WrapperStyleHeader = styled.div`
  background: #fff;
  padding: 15px 20px;
  border-radius: 6px 6px 0 0;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3px solid #eaeaea;
  margin-bottom: 0;
  font-weight: bold;
`;

export const WrapperStyleHeaderDelivery = styled.div`
  background: #fff;
  padding: 15px 20px;
  border-radius: 6px 6px 0 0;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

export const WrapperLeft = styled.div`
  width: 910px;
  margin-right: 20px;
`;

export const WrapperRight = styled.div`
  width: 320px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  padding: 20px;
  height: fit-content;
`;

export const CustomerInfoSection = styled.div`
  padding: 0 0 15px 0;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 20px;
`;

export const WrapperTotal = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #eaeaea;
`;

export const WrapperItemCart = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eaeaea;
  background: #fff;
  justify-content: space-between;
`;

export const WrapperCountCart = styled.div`
  display: flex;
  align-items: center;
  width: 30%;
  justify-content: center;
  
  .ant-input-number {
    border-color: #d9d9d9;
    
    &:hover {
      border-color: #33b776;
    }
    
    &.ant-input-number-focused, &:focus {
      border-color: #00a551;
      box-shadow: 0 0 0 2px rgba(0, 165, 81, 0.2);
    }
    
    .ant-input-number-input {
      text-align: left !important;
    }
  }
`;

export const WrapperNameProductCart = styled.span`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.4;
  max-width: calc(100% - 95px);
  
  &:hover {
    color: #00a551;
  }
`;

export const WrapperListCart = styled.div`
  border-radius: 0 0 6px 6px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

export const AddressForm = styled.div`
  margin-top: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 5px;
  padding: 20px;
  background-color: #fafafa;
`;