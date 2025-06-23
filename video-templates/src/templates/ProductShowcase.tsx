import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Audio,
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
  audioPath?: string;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  productData,
  adScript,
  aspectRatio,
  audioPath,
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

  // Dynamic background animation
  const bgRotation = interpolate(frame, [0, durationInFrames], [0, 360]);
  const bgScale = interpolate(frame, [0, durationInFrames], [1, 1.5]);

  // Responsive styles based on aspect ratio
  const isVertical = aspectRatio === '9:16';
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isVertical ? '60px 30px' : '80px 60px',
    textAlign: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isVertical ? '52px' : '80px',
    fontWeight: '900',
    marginBottom: '20px',
    textShadow: '0 4px 20px rgba(0,0,0,0.4)',
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: isVertical ? '26px' : '40px',
    marginBottom: '30px',
    opacity: 0.95,
    lineHeight: 1.3,
    fontWeight: '300',
    letterSpacing: '0.01em',
  };

  const imageStyle: React.CSSProperties = {
    width: isVertical ? '340px' : '450px',
    height: isVertical ? '340px' : '450px',
    objectFit: 'cover',
    borderRadius: '30px',
    boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
    margin: '30px 0',
    border: '3px solid rgba(255,255,255,0.1)',
  };

  const priceStyle: React.CSSProperties = {
    fontSize: isVertical ? '42px' : '56px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: 'none',
    margin: '20px 0',
  };

  const benefitStyle: React.CSSProperties = {
    fontSize: isVertical ? '22px' : '32px',
    margin: '12px 0',
    padding: '15px 30px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '40px',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)',
    fontWeight: '500',
  };

  const ctaStyle: React.CSSProperties = {
    fontSize: isVertical ? '36px' : '52px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #FF6B6B, #FFE66D)',
    padding: '25px 50px',
    borderRadius: '60px',
    border: 'none',
    color: '#1a1a1a',
    boxShadow: '0 15px 40px rgba(255,107,107,0.4)',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  return (
    <AbsoluteFill style={containerStyle}>
      {/* Add background music (optional) */}
      {/* Note: Add background-music.mp3 to public folder for background music */}

      {/* Add voiceover audio track if available */}
      {audioPath && (
        <Audio
          src={staticFile(audioPath)}
          startFrom={0}
          endAt={durationInFrames}
          volume={0.9}
        />
      )}

      {/* Animated gradient background */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          right: '-50%',
          bottom: '-50%',
          background: `
            radial-gradient(circle at 20% 80%, #FF006E, transparent 50%),
            radial-gradient(circle at 80% 20%, #8338EC, transparent 50%),
            radial-gradient(circle at 40% 40%, #3A86FF, transparent 50%),
            linear-gradient(180deg, #06FFA5, #FB5607)
          `,
          transform: `rotate(${bgRotation}deg) scale(${bgScale})`,
          opacity: 0.9,
        }}
      />

      {/* Dark overlay for better text contrast */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
        }}
      />

      {/* Floating particles effect */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`,
            left: `${20 + i * 15}%`,
            top: `${interpolate(
              frame,
              [0, durationInFrames],
              [100 + i * 20, -20 - i * 10]
            )}%`,
            transform: `scale(${interpolate(
              frame,
              [0, durationInFrames / 2, durationInFrames],
              [0.5, 1.2, 0.5]
            )})`,
          }}
        />
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
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
                style={{
                  ...imageStyle,
                  transform: `scale(${scale(hookStart + 15, 45)}) rotate(${interpolate(
                    frame,
                    [hookStart, problemStart],
                    [0, 5],
                    { extrapolateRight: 'clamp' }
                  )}deg)`,
                }}
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
            <h2 style={{...subtitleStyle, fontSize: isVertical ? '32px' : '48px'}}>
              {adScript.problem}
            </h2>
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
            <h1 style={{...titleStyle, marginBottom: '30px'}}>{productData.title}</h1>
            <h2 style={subtitleStyle}>{adScript.solution}</h2>
            {productData.price && (
              <div style={priceStyle}>
                {productData.price}
              </div>
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
            <h2 style={{...subtitleStyle, marginBottom: '40px', fontWeight: '600'}}>
              Why Choose Us?
            </h2>
            {adScript.benefits.map((benefit, index) => (
              <div
                key={index}
                style={{
                  ...benefitStyle,
                  opacity: fadeIn(benefitsStart + index * 20),
                  transform: `translateY(${slideUp(benefitsStart + index * 20, 25)}px) scale(${scale(
                    benefitsStart + index * 20,
                    25
                  )})`,
                }}
              >
                <span style={{ marginRight: '10px', fontSize: '1.2em' }}>✨</span>
                {benefit}
              </div>
            ))}
          </div>
        )}

        {/* Call to Action Section */}
        {frame >= ctaStart && (
          <div
            style={{
              opacity: fadeIn(ctaStart),
              transform: `translateY(${slideUp(ctaStart)}px) scale(${scale(ctaStart, 40)})`,
            }}
          >
            <div style={{
              ...ctaStyle,
              transform: `scale(${interpolate(
                frame,
                [ctaStart, ctaStart + 30, ctaStart + 60],
                [1, 1.05, 1],
                { extrapolateRight: 'extend' }
              )})`,
            }}>
              {adScript.callToAction}
            </div>
            {productData.price && (
              <div style={{...priceStyle, marginTop: '30px', fontSize: isVertical ? '36px' : '48px'}}>
                Only {productData.price}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Animated light rays */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '200%',
          height: '200%',
          transform: `translate(-50%, -50%) rotate(${frame * 0.5}deg)`,
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(255,255,255,0.1) 20deg,
            transparent 40deg,
            transparent 180deg,
            rgba(255,255,255,0.1) 200deg,
            transparent 220deg,
            transparent 360deg
          )`,
          zIndex: 5,
        }}
      />
    </AbsoluteFill>
  );
};
