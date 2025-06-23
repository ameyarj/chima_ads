import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../config/database';
import { ProductData, AdScript, VideoRequest, VideoResponse } from '@shared/types';
import { llmService } from '../config/llm';
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

  async createVideo(request: Omit<VideoRequest, 'id'>): Promise<VideoResponse> {
    const id = uuidv4();
    
    try {
      // Generate ad script using LLM
      console.log('Generating ad script with LLM...');
      const adScript = await llmService.generateAdScript(request.productData);
      
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
    
    // Create a data file for Remotion to use
    const dataPath = path.join(this.videosDir, `${id}-data.json`);
    const videoData = {
      productData,
      adScript,
      aspectRatio,
      template,
    };
    
    await fs.writeFile(dataPath, JSON.stringify(videoData, null, 2));
    
    try {
      // Use Remotion CLI to render the video
      const remotionProjectPath = path.join(process.cwd(), '..', 'video-templates');
      const command = `cd "${remotionProjectPath}" && npx remotion render ProductShowcase "${outputPath}" --props="${dataPath}"`;
      
      console.log('Executing Remotion render command...');
      const { stdout, stderr } = await execAsync(command, { timeout: 300000 }); // 5 minute timeout
      
      if (stderr) {
        console.warn('Remotion stderr:', stderr);
      }
      
      console.log('Remotion stdout:', stdout);
      
      // Verify the video file was created
      await fs.access(outputPath);
      
      // Clean up data file
      await fs.unlink(dataPath);
      
      return outputPath;
    } catch (error) {
      // Clean up data file on error
      try {
        await fs.unlink(dataPath);
      } catch {}
      
      throw error;
    }
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
