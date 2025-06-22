import { Image } from 'antd';
import React from 'react'
import { WrapperSliderStyle } from './style';

const SliderComponent = ({ arrImages, onClick }) => {
    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000
    };
    return (
        <WrapperSliderStyle {...settings}>
            {arrImages.map((image) => {
                return (
                  <div key={image}>
                    <Image 
                      src={image} 
                      alt="slider" 
                      preview={false} 
                      width='100%' 
                      height='30vw' 
                      onClick={onClick}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                )
            })}
        </WrapperSliderStyle>
    )
}

export default SliderComponent
