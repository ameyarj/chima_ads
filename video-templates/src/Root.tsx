import React from 'react';
import {Composition} from 'remotion';
import {ProductShowcase} from './templates/ProductShowcase';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProductShowcase"
        component={ProductShowcase as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={900} 
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          productData: {
            url: 'https://example.com',
            title: 'Amazing Product',
            description: 'This is an amazing product that will change your life.',
            price: '$99.99',
            images: ['https://via.placeholder.com/800x600'],
            features: ['Feature 1', 'Feature 2', 'Feature 3'],
            category: 'demo'
          },
          adScript: {
            hook: 'Transform Your Life Today!',
            problem: 'Tired of the same old routine?',
            solution: 'Our amazing product is the solution you need.',
            benefits: ['Save time', 'Increase productivity', 'Feel amazing'],
            callToAction: 'Order Now!',
            duration: 30
          },
          aspectRatio: '16:9' as const,
          template: 'default'
        }}
      />

      <Composition
        id="ProductShowcaseVertical"
        component={ProductShowcase as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={900} 
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          productData: {
            url: 'https://example.com',
            title: 'Amazing Product',
            description: 'This is an amazing product that will change your life.',
            price: '$99.99',
            images: ['https://via.placeholder.com/800x600'],
            features: ['Feature 1', 'Feature 2', 'Feature 3'],
            category: 'demo'
          },
          adScript: {
            hook: 'Transform Your Life Today!',
            problem: 'Tired of the same old routine?',
            solution: 'Our amazing product is the solution you need.',
            benefits: ['Save time', 'Increase productivity', 'Feel amazing'],
            callToAction: 'Order Now!',
            duration: 30
          },
          aspectRatio: '9:16' as const,
          template: 'default'
        }}
      />
    </>
  );
};
