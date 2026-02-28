import React, { useState, useEffect, useRef } from 'react';


interface SliderProps {
  slides: {
    id: number;
    image: string;
    title?: string;
    description?: string;
  }[];
  speed?: number;
}

const SmoothContinuousSlider: React.FC<SliderProps> = ({
  slides,
  speed = 50 
}) => {
  const [slidesToShow, setSlidesToShow] = useState(10);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const positionRef = useRef<number>(0);
  
  const allSlides = [...slides, ...slides, ...slides];

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        setSlidesToShow(10);
      } else if (width >= 992) {
        setSlidesToShow(7); 
      } else if (width >= 576) {
        setSlidesToShow(4); 
      } else {
        setSlidesToShow(2); 
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const animate = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const elapsed = timestamp - lastTimeRef.current;
    
    if (elapsed > 0 && sliderTrackRef.current) {
      const pixelsToMove = (speed * elapsed) / 1000;
      positionRef.current += pixelsToMove;
      

      const slideWidth = 100 / slidesToShow;
      
      if (positionRef.current >= slides.length * slideWidth) {

        positionRef.current = 0;
      }
      
      sliderTrackRef.current.style.transform = `translateX(-${positionRef.current}%)`;
      lastTimeRef.current = timestamp;
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
   
    positionRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, slidesToShow, slides.length]);


  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {

        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      } else {
      
        if (!animationRef.current) {
          lastTimeRef.current = 0; 
          animationRef.current = requestAnimationFrame(animate);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="smooth-slider-container">
      <div className="smooth-slider">
        <div 
          className="smooth-slider-track" 
          ref={sliderTrackRef}
        >
          {allSlides.map((slide, index) => (
            <div 
              key={`${slide.id}-${index}`} 
              className="smooth-slider-item"
              style={{ width: `${100 / slidesToShow}%` }}
            >
              <div className="smooth-slider-image-container">
                <img src={slide.image} alt={slide.title || `Slide ${index + 1}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmoothContinuousSlider;