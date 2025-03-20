import styled from "styled-components";

export const WrapperProducts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  justify-content: flex-start;
  margin-top: 30px;
`

export const WrapperGenreTitle = styled.h2`
  color: #222;
  font-size: 28px;
  margin: 25px 0;
  text-align: center;
  font-weight: 600;
  position: relative;
  letter-spacing: 0.5px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 4px;
    background: linear-gradient(90deg, #00A651, #7ED957);
    border-radius: 2px;
  }
`

export const GenreSection = styled.div`
  margin-bottom: 70px;
  padding: 20px;
  border-radius: 12px;
  background-color: #fafafa;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid transparent;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 166, 81, 0.25);
    border-color: rgba(0, 166, 81, 0.2);
  }
`

export const PageContainer = styled.div`
  padding: 20px 15vw;
  background: linear-gradient(to bottom, #fff, #f0f8f0);
  padding-bottom: 70px;
  min-height: 100vh;
`