import { Upload } from "antd";
import styled from "styled-components";

export const WrapperHeader = styled.h1`
    color: #000;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 30px;
    text-align: center;
`

export const FormContainer = styled.div`
    width: 100%;
    min-width: 1000px;
`

export const WrapperContentProfile = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid #eaeaea;
    width: 100%;
    border-radius: 8px;
    padding: 20px 30px;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
`

export const WrapperInputField = styled.div`
    margin-bottom: 16px;
`

export const WrapperUploadFile = styled(Upload)`
    & .ant-upload {
        cursor: pointer;
    }
    & .ant-upload-list-item-container {
        display: none !important;
    }
`

export const ChangingButton = styled.button`
    background-color: #00A651;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    min-width: 120px;
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.9;
        background-color: #008543;
    }
`

export const ProfileContainer = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    width: 100%;

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
    }
`

export const AvatarContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;

    .ant-card {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    }

    .ant-card-head {
        background-color: #f8f8f8;
        border-bottom: 1px solid #eaeaea;
    }
`

export const AddressForm = styled.div`
    margin-bottom: 20px;
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    background-color: #fafafa;
`
