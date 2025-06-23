export interface ProductData {
  url: string;
  title: string;
  description: string;
  price?: string;
  images: string[];
  features: string[];
  category?: string;
}

export interface AdScript {
  hook: string;
  problem: string;
  solution: string;
  benefits: string[];
  callToAction: string;
  duration: number; // in seconds
  voiceover?: {
    enabled: boolean;
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    speed: number; // 0.25 to 4.0
    text: string; // Combined script text for TTS
  };
}

export interface VideoRequest {
  id: string;
  productData: ProductData;
  adScript: AdScript;
  aspectRatio: '9:16' | '16:9';
  template: string;
}

export interface VideoResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  createdAt: Date;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  apiKey: string;
  baseUrl?: string;
}

export interface ScrapingResult {
  success: boolean;
  data?: ProductData;
  error?: string;
}
