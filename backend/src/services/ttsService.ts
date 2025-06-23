import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface TTSOptions {
  voice: TTSVoice;
  speed: number; // 0.25 to 4.0
  model: 'tts-1' | 'tts-1-hd';
}

export class TTSService {
  private client: OpenAI;
  private audioDir: string;

  constructor() {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required for TTS service');
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    });

    this.audioDir = path.join(process.cwd(), 'audio');
    this.ensureAudioDirectory();
  }

  private async ensureAudioDirectory() {
    try {
      await fs.access(this.audioDir);
    } catch {
      await fs.mkdir(this.audioDir, { recursive: true });
    }
  }

  async generateSpeech(
    text: string,
    options: TTSOptions = {
      voice: 'nova',
      speed: 1.0,
      model: 'tts-1'
    }
  ): Promise<{ filePath: string; duration: number }> {
    try {
      console.log('Generating TTS audio with options:', options);
      console.log('Text length:', text.length);

      // Validate text length (OpenAI TTS has a 4096 character limit)
      if (text.length > 4000) {
        text = text.substring(0, 4000) + '...';
        console.warn('Text truncated to fit TTS limits');
      }

      // Generate speech using OpenAI TTS
      const response = await this.client.audio.speech.create({
        model: options.model,
        voice: options.voice,
        input: text,
        speed: options.speed,
        response_format: 'mp3',
      });

      // Generate unique filename
      const filename = `tts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mp3`;
      const filepath = path.join(this.audioDir, filename);

      // Convert response to buffer and save
      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(filepath, buffer);

      // Estimate duration based on text length and speed
      const estimatedDuration = TTSService.estimateDuration(text, options.speed);
      
      console.log(`TTS audio generated: ${filepath}`);
      console.log(`Estimated duration: ${estimatedDuration} seconds`);
      
      return {
        filePath: filepath,
        duration: estimatedDuration
      };

    } catch (error) {
      console.error('TTS generation error:', error);
      throw new Error(`Failed to generate TTS audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAudioFile(filepath: string): Promise<Buffer | null> {
    try {
      await fs.access(filepath);
      return await fs.readFile(filepath);
    } catch {
      return null;
    }
  }

  async deleteAudioFile(filepath: string): Promise<boolean> {
    try {
      await fs.unlink(filepath);
      return true;
    } catch {
      return false;
    }
  }

  // Helper method to create a script suitable for TTS (optimized for 30 seconds)
  static createTTSScript(adScript: any): string {
    const parts = [];

    // Start with hook (5-8 words max)
    if (adScript.hook) {
      parts.push(adScript.hook);
    }

    // Quick problem statement (10-15 words max)
    if (adScript.problem) {
      const shortProblem = adScript.problem.split('.')[0]; // Take first sentence only
      parts.push(shortProblem);
    }

    // Concise solution (15-20 words max)
    if (adScript.solution) {
      const shortSolution = adScript.solution.split('.')[0]; // Take first sentence only
      parts.push(shortSolution);
    }

    // Top 2 benefits only (10-15 words max)
    if (adScript.benefits && adScript.benefits.length > 0) {
      const topBenefits = adScript.benefits.slice(0, 2); // Only use first 2 benefits
      parts.push(`${topBenefits.join(' and ')}`);
    }

    // Strong call to action (5-8 words max)
    if (adScript.callToAction) {
      parts.push(adScript.callToAction);
    }

    // Join with brief pauses for natural speech
    return parts.join('. ');
  }

  // Helper method to estimate speech duration
  static estimateDuration(text: string, speed: number = 1.0): number {
    // Average speaking rate is about 150 words per minute
    const wordsPerMinute = 150 * speed;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil((wordCount / wordsPerMinute) * 60);
  }
}

export const ttsService = new TTSService();
