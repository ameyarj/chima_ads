import { LLMConfig } from '@shared/types';
import OpenAI from 'openai';

export interface LLMProvider {
  generateAdScript(productData: any): Promise<any>;
}

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor(config: LLMConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async generateAdScript(productData: any) {
    const prompt = `
Create a compelling 30-second video ad script for this product:

Product: ${productData.title}
Description: ${productData.description}
Price: ${productData.price || 'Not specified'}
Features: ${productData.features.join(', ')}

Generate a JSON response with the following structure:
{
  "hook": "Attention-grabbing opening line (6-10 words)",
  "problem": "Problem this product solves (12-18 words)",
  "solution": "How the product solves it (15-25 words)",
  "benefits": ["benefit 1 (5-8 words)", "benefit 2 (5-8 words)", "benefit 3 (5-8 words)"],
  "callToAction": "Strong call to action (8-12 words)",
  "duration": 30
}

IMPORTANT: Create a script that will last approximately 25-30 seconds when spoken. Total word count should be 70-90 words.
Make it engaging and conversational while maintaining energy throughout.
`;

    const response = await this.client.chat.completions.create({
      model: process.env.LLM_MODEL || 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content: 'You are an expert copywriter specializing in video advertisements. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }
  }
}

export class AnthropicProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com';
  }

  async generateAdScript(productData: any) {
    
    throw new Error('Anthropic provider not implemented yet');
  }
}

export class LLMService {
  private provider: LLMProvider;

  constructor() {
    const config = this.getConfig();
    this.provider = this.createProvider(config);
  }

  private getConfig(): LLMConfig {
    const provider = (process.env.LLM_PROVIDER as 'openai' | 'anthropic') || 'openai';
    const model = process.env.LLM_MODEL || 'gpt-4.1';
    const apiKey = process.env.LLM_API_KEY;
    const baseUrl = process.env.LLM_BASE_URL;

    if (!apiKey) {
      throw new Error('LLM_API_KEY environment variable is required');
    }

    return {
      provider,
      model,
      apiKey,
      baseUrl,
    };
  }

  private createProvider(config: LLMConfig): LLMProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }

  async generateAdScript(productData: any) {
    return this.provider.generateAdScript(productData);
  }

  switchProvider(newConfig: LLMConfig) {
    this.provider = this.createProvider(newConfig);
  }
}

export const llmService = new LLMService();
