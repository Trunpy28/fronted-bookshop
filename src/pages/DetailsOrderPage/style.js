import styled from "styled-components";

export const WrapperContainer = styled.div`
  width: 100%;
  padding: 50px 15vw;
`;

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  gap: 20px;

  h2 {
    font-size: 24px;
    color: #333;
    margin: 0;
  }

  p {
    font-size: 16px;
    color: #666;
    margin: 0;
  }

  button {
    padding: 10px 20px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;

    &:hover {
      background-color: #40a9ff;
    }
  }
`; 