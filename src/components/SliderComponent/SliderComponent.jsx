import { Image } from 'antd';
import React from 'react'
import { WrapperSliderStyle } from './style';

const SliderComponent = ({ arrImages, onClick }) => {
    const settings = {
        dots: true,
        infinite: true,
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
                  <div key={image} style={{ cursor: onClick ? 'pointer' : 'default' }}>
                    <Image 
                      src={image} 
                      alt="slider" 
                      preview={false} 
                      width='100%' 
                      height='30vw' 
                      onClick={onClick}
                    />
                  </div>
                )
            })}
        </WrapperSliderStyle>
    )
}

export default SliderComponent
