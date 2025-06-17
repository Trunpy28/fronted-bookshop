import { Link } from "react-router-dom";
import styled from "styled-components";

export const TypeProductWrapper = styled.div`
    display: flex;
    padding-left: 15vw;
    padding-right: 15vw;
    background-color: #00A651;
`
    
export const LinkNavBar = styled(Link)`
    text-decoration: none;
    padding: 20px 20px;
    font-size: 16px;
    font-weight: ${props => props.isActive ? '700' : '600'};
    color: white;
    background-color: ${props => props.isActive ? '#0C6136' : '#00A651'};
    &:hover{
        background-color: #27B96C;
        color: white;
    }
`