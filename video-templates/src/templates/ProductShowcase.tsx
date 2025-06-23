import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Img,
  staticFile,
} from 'remotion';

interface ProductData {
  url: string;
  title: string;
  description: string;
  price?: string;
  images: string[];
  features: string[];
  category?: string;
}

interface AdScript {
  hook: string;
  problem: string;
  solution: string;
  benefits: string[];
  callToAction: string;
  duration: number;
}

interface ProductShowcaseProps {
  productData: ProductData;
  adScript: AdScript;
  aspectRatio: '9:16' | '16:9';
  template: string;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  productData,
  adScript,
  aspectRatio,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width, height} = useVideoConfig();
  
  // Calculate timing for different sections
  const hookDuration = fps * 3; // 3 seconds
  const problemDuration = fps * 5; // 5 seconds
  const solutionDuration = fps * 8; // 8 seconds
  const benefitsDuration = fps * 10; // 10 seconds
  const ctaDuration = fps * 4; // 4 seconds
  
  const hookStart = 0;
  const problemStart = hookStart + hookDuration;
  const solutionStart = problemStart + problemDuration;
  const benefitsStart = solutionStart + solutionDuration;
  const ctaStart = benefitsStart + benefitsDuration;

  // Animation helpers
  const fadeIn = (startFrame: number, duration: number = 30) => {
    return interpolate(
      frame,
      [startFrame, startFrame + duration],
      [0, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.quad),
      }
    );
  };

  const slideUp = (startFrame: number, duration: number = 30) => {
    return interpolate(
      frame,
      [startFrame, startFrame + duration],
      [50, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.quad),
      }
    );
  };

  const scale = (startFrame: number, duration: number = 30) => {
    return interpolate(
      frame,
      [startFrame, startFrame + duration],
      [0.8, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.back(1.7)),
      }
    );
  };

  // Responsive styles based on aspect ratio
  const isVertical = aspectRatio === '9:16';
  const containerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isVertical ? '40px 20px' : '60px 40px',
    textAlign: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isVertical ? '48px' : '72px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    lineHeight: 1.2,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: isVertical ? '24px' : '36px',
    marginBottom: '30px',
    opacity: 0.9,
    lineHeight: 1.4,
  };

  const imageStyle: React.CSSProperties = {
    width: isVertical ? '300px' : '400px',
    height: isVertical ? '300px' : '400px',
    objectFit: 'cover',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    margin: '20px 0',
  };

  const priceStyle: React.CSSProperties = {
    fontSize: isVertical ? '36px' : '48px',
    fontWeight: 'bold',
    color: '#FFD700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    margin: '20px 0',
  };

  const benefitStyle: React.CSSProperties = {
    fontSize: isVertical ? '20px' : '28px',
    margin: '10px 0',
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '25px',
    backdropFilter: 'blur(10px)',
  };

  const ctaStyle: React.CSSProperties = {
    fontSize: isVertical ? '32px' : '48px',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
    padding: '20px 40px',
    borderRadius: '50px',
    border: 'none',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    animation: 'pulse 2s infinite',
  };

  return (
    <AbsoluteFill style={containerStyle}>
      {/* Hook Section */}
      {frame >= hookStart && frame < problemStart && (
        <div
          style={{
            opacity: fadeIn(hookStart),
            transform: `translateY(${slideUp(hookStart)}px) scale(${scale(hookStart)})`,
          }}
        >
          <h1 style={titleStyle}>{adScript.hook}</h1>
          {productData.images[0] && (
            <img
              src={productData.images[0]}
              alt={productData.title}
              style={imageStyle}
            />
          )}
        </div>
      )}

      {/* Problem Section */}
      {frame >= problemStart && frame < solutionStart && (
        <div
          style={{
            opacity: fadeIn(problemStart),
            transform: `translateY(${slideUp(problemStart)}px)`,
          }}
        >
          <h2 style={subtitleStyle}>{adScript.problem}</h2>
        </div>
      )}

      {/* Solution Section */}
      {frame >= solutionStart && frame < benefitsStart && (
        <div
          style={{
            opacity: fadeIn(solutionStart),
            transform: `translateY(${slideUp(solutionStart)}px)`,
          }}
        >
          <h1 style={titleStyle}>{productData.title}</h1>
          <h2 style={subtitleStyle}>{adScript.solution}</h2>
          {productData.price && (
            <div style={priceStyle}>{productData.price}</div>
          )}
        </div>
      )}

      {/* Benefits Section */}
      {frame >= benefitsStart && frame < ctaStart && (
        <div
          style={{
            opacity: fadeIn(benefitsStart),
            transform: `translateY(${slideUp(benefitsStart)}px)`,
          }}
        >
          <h2 style={{...subtitleStyle, marginBottom: '40px'}}>Why Choose Us?</h2>
          {adScript.benefits.map((benefit, index) => (
            <div
              key={index}
              style={{
                ...benefitStyle,
                opacity: fadeIn(benefitsStart + index * 15),
                transform: `translateY(${slideUp(benefitsStart + index * 15, 20)}px)`,
              }}
            >
              ✓ {benefit}
            </div>
          ))}
        </div>
      )}

      {/* Call to Action Section */}
      {frame >= ctaStart && (
        <div
          style={{
            opacity: fadeIn(ctaStart),
            transform: `translateY(${slideUp(ctaStart)}px) scale(${scale(ctaStart)})`,
          }}
        >
          <div style={ctaStyle}>
            {adScript.callToAction}
          </div>
          {productData.price && (
            <div style={{...priceStyle, marginTop: '20px'}}>
              Only {productData.price}
            </div>
          )}
        </div>
      )}

      {/* Background Animation */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${interpolate(
            frame,
            [0, durationInFrames],
            [20, 80]
          )}% ${interpolate(
            frame,
            [0, durationInFrames],
            [30, 70]
          )}%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          zIndex: -1,
        }}
      />
    </AbsoluteFill>
  );
};
