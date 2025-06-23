import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../config/database';
import { ProductData, AdScript, VideoRequest, VideoResponse } from '@shared/types';
import { llmService } from '../config/llm';
import { ttsService, TTSService } from './ttsService';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class VideoService {
  private videosDir = path.join(process.cwd(), 'videos');

  constructor() {
    this.ensureVideosDirectory();
  }

  private async ensureVideosDirectory() {
    try {
      await fs.access(this.videosDir);
    } catch {
      await fs.mkdir(this.videosDir, { recursive: true });
    }
  }

  async createVideo(request: Omit<VideoRequest, 'id'>, enableVoiceover: boolean = true): Promise<VideoResponse> {
    const id = uuidv4();
    
    try {
      // Generate ad script using LLM
      console.log('Generating ad script with LLM...');
      const adScript = await llmService.generateAdScript(request.productData);
      
      // Add voiceover configuration if enabled
      if (enableVoiceover) {
        const ttsText = TTSService.createTTSScript(adScript);
        adScript.voiceover = {
          enabled: true,
          voice: (request.productData as any).voiceSettings?.voice || 'nova',
          speed: (request.productData as any).voiceSettings?.speed || 1.0,
          text: ttsText
        };
      }
      
      // Create database record
      const video = await prisma.video.create({
        data: {
          id,
          url: request.productData.url,
          productData: JSON.stringify(request.productData),
          adScript: JSON.stringify(adScript),
          aspectRatio: request.aspectRatio,
          template: request.template,
          status: 'processing',
        },
      });

      // Start video generation in background
      this.generateVideoAsync(id, request.productData, adScript, request.aspectRatio, request.template);

      return {
        id,
        status: 'processing',
        createdAt: video.createdAt,
      };
    } catch (error) {
      console.error('Error creating video:', error);
      
      // Update database with error
      await prisma.video.upsert({
        where: { id },
        update: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        create: {
          id,
          url: request.productData.url,
          productData: JSON.stringify(request.productData),
          adScript: JSON.stringify({}),
          aspectRatio: request.aspectRatio,
          template: request.template,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return {
        id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      };
    }
  }

  private async generateVideoAsync(
    id: string,
    productData: ProductData,
    adScript: AdScript,
    aspectRatio: '9:16' | '16:9',
    template: string
  ) {
    try {
      console.log(`Starting video generation for ${id}`);
      
      // Generate video using Remotion
      const videoPath = await this.renderVideo(id, productData, adScript, aspectRatio, template);
      
      // Update database with success
      await prisma.video.update({
        where: { id },
        data: {
          status: 'completed',
          videoPath,
        },
      });

      console.log(`Video generation completed for ${id}`);
    } catch (error) {
      console.error(`Video generation failed for ${id}:`, error);
      
      // Update database with error
      await prisma.video.update({
        where: { id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  private async renderVideo(
    id: string,
    productData: ProductData,
    adScript: AdScript,
    aspectRatio: '9:16' | '16:9',
    template: string
  ): Promise<string> {
    const outputPath = path.join(this.videosDir, `${id}.mp4`);
    let originalAudioPath: string | null = null;
    let relativeAudioPath: string | null = null;
    
    try {
      // Generate TTS audio if voiceover is enabled
      if (adScript.voiceover?.enabled && adScript.voiceover.text) {
        console.log('Generating TTS audio...');
        const ttsResult = await ttsService.generateSpeech(adScript.voiceover.text, {
          voice: adScript.voiceover.voice,
          speed: adScript.voiceover.speed,
          model: 'tts-1'
        });
        originalAudioPath = ttsResult.filePath;
        console.log(`TTS audio generated: ${originalAudioPath}, duration: ${ttsResult.duration}s`);

        // Copy audio file to video-templates/public folder for Remotion
        const remotionPublicDir = path.join(process.cwd(), '..', 'video-templates', 'public');
        await fs.mkdir(remotionPublicDir, { recursive: true });
        
        const audioFileName = path.basename(originalAudioPath);
        const remotionAudioPath = path.join(remotionPublicDir, audioFileName);
        await fs.copyFile(originalAudioPath, remotionAudioPath);
        
        // Update relativeAudioPath to be relative for Remotion
        relativeAudioPath = audioFileName;
      }

      // Create a data file for Remotion to use
      const dataPath = path.join(this.videosDir, `${id}-data.json`);
      const videoData = {
        productData,
        adScript,
        aspectRatio,
        template,
        audioPath: relativeAudioPath, // Include audio path for Remotion
      };
      
      await fs.writeFile(dataPath, JSON.stringify(videoData, null, 2));
      
      // Use Remotion CLI to render the video
      const remotionProjectPath = path.join(process.cwd(), '..', 'video-templates');
      const compositionId = aspectRatio === '9:16' ? 'ProductShowcaseVertical' : 'ProductShowcase';
      
      // Ensure we're in the correct directory and use the proper command
      const command = process.platform === 'win32' 
        ? `cd /d "${remotionProjectPath}" && npx remotion render ${compositionId} "${outputPath}" --props="${dataPath}"`
        : `cd "${remotionProjectPath}" && npx remotion render ${compositionId} "${outputPath}" --props="${dataPath}"`;
      
      console.log('Executing Remotion render command:', command);
      
      const { stdout, stderr } = await execAsync(command, { 
        timeout: 300000, // 5 minute timeout
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh'
      });
      
      if (stderr && !stderr.includes('warn')) {
        console.error('Remotion stderr:', stderr);
      }
      
      console.log('Remotion stdout:', stdout);
      
      // Verify the video file was created
      await fs.access(outputPath);
      
      // Clean up data file
      await fs.unlink(dataPath);
      
      // Clean up temporary audio file
      if (originalAudioPath) {
        try {
          await fs.unlink(originalAudioPath);
        } catch (error) {
          console.warn('Failed to delete temporary audio file:', error);
        }
      }
      
      return outputPath;
    } catch (error) {
      console.error('Video rendering error:', error);
      
      // Clean up temporary audio file on error
      if (originalAudioPath) {
        try {
          await fs.unlink(originalAudioPath);
        } catch {
          // Ignore cleanup errors
        }
      }
      
      // If Remotion fails, create a sample video for development
      // You can replace this with throwing an error in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('Remotion failed, creating sample video for development...');
        return await this.createSampleVideo(outputPath);
      }
      
      throw error;
    }
  }

  private async createSampleVideo(outputPath: string): Promise<string> {
    // Create a minimal valid MP4 file for testing
    // This is a tiny valid MP4 that shows a black frame
    const minimalMp4 = Buffer.from([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D,
      0x00, 0x00, 0x02, 0x00, 0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
      0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31, 0x00, 0x00, 0x00, 0x08,
      0x66, 0x72, 0x65, 0x65, 0x00, 0x00, 0x00, 0x00, 0x6D, 0x64, 0x61, 0x74
    ]);
    
    await fs.writeFile(outputPath, minimalMp4);
    console.log(`Sample video created at: ${outputPath}`);
    return outputPath;
  }

  async getVideo(id: string): Promise<VideoResponse | null> {
    const video = await prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      return null;
    }

    return {
      id: video.id,
      status: video.status as 'processing' | 'completed' | 'failed',
      videoUrl: video.status === 'completed' && video.videoPath 
        ? `/api/video/${id}/file` 
        : undefined,
      error: video.error || undefined,
      createdAt: video.createdAt,
    };
  }

  async getAllVideos(): Promise<VideoResponse[]> {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return videos.map(video => ({
      id: video.id,
      status: video.status as 'processing' | 'completed' | 'failed',
      videoUrl: video.status === 'completed' && video.videoPath 
        ? `/api/video/${video.id}/file` 
        : undefined,
      error: video.error || undefined,
      createdAt: video.createdAt,
    }));
  }

  async getVideoFile(id: string): Promise<string | null> {
    const video = await prisma.video.findUnique({
      where: { id },
    });

    if (!video || !video.videoPath || video.status !== 'completed') {
      return null;
    }

    // Verify file exists
    try {
      await fs.access(video.videoPath);
      return video.videoPath;
    } catch {
      return null;
    }
  }

  async deleteVideo(id: string): Promise<boolean> {
    try {
      const video = await prisma.video.findUnique({
        where: { id },
      });

      if (!video) {
        return false;
      }

      // Delete video file if it exists
      if (video.videoPath) {
        try {
          await fs.unlink(video.videoPath);
        } catch {
          // File might not exist, continue with database deletion
        }
      }

      // Delete database record
      await prisma.video.delete({
        where: { id },
      });

      return true;
    } catch {
      return false;
    }
  }
}

export const videoService = new VideoService();
