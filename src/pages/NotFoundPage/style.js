import styled from 'styled-components';

export const WrapperNotFoundPage = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);

  .content {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 8px 30px rgba(24, 144, 255, 0.1);
    max-width: 500px;
    width: 90%;

    h1 {
      font-size: 120px;
      margin: 0;
      color: #1890ff;
      font-weight: bold;
      line-height: 1;
    }

    h2 {
      font-size: 32px;
      margin: 20px 0;
      color: #333;
    }

    p {
      font-size: 18px;
      color: #666;
      margin-bottom: 30px;
    }

    button {
      padding: 12px 30px;
      font-size: 16px;
      height: auto;
      background: #1890ff;
      border-color: #1890ff;

      &:hover {
        background: #40a9ff;
        border-color: #40a9ff;
      }
    }
  }
`; 