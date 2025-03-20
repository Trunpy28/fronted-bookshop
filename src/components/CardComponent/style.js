import { Card } from "antd";
import styled from "styled-components";

export const StyledNameProduct = styled.div`
    font-weight: 500;
    font-size: 16px;
    color: #4B4848;
    cursor: pointer;
    height: 50px;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    display: -webkit-box;
    transition: color 0.3s ease;
    &:hover {
        color: #00A651;
    }
`

export const WrapperReportText = styled.div`
    display: flex;
    align-items: center;
    color: #6c757d;
    font-size: 14px;
    margin: 8px 0;
`

export const WrapperPriceText = styled.div`
    font-size: 20px;
    font-weight: 700;
    color: #E62531;
`

export const WrapperOriginalPriceText = styled.div`
    font-size: 15px;
    font-weight: 500;
    color: #888888;
    text-decoration: line-through;
`

export const StyledCard = styled(Card)`
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }
    
    &:hover .view-details {
        bottom: 0;
    }
`