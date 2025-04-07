import { Steps } from "antd";
import styled from "styled-components";
const { Step } = Steps;


export const CustomStep = styled(Step)`
  .ant-steps-item-process>.ant-steps-item-container>.ant-steps-item-icon {
    background: #00a551;
  }
  
  .ant-steps-item-finish .ant-steps-item-icon {
    background-color: #fff;
    border-color: #00a551;
  }
  
  .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
    color: #00a551;
  }
  
  .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title::after {
    background-color: #00a551;
  }
`