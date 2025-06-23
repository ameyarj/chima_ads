import { Request, Response } from 'express';
import { scrapingService } from '../services/scrapingService';
import { videoService } from '../services/videoService';

export class VideoController {
  async scrapeProduct(req: Request, res: Response) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      console.log(`Scraping product from: ${url}`);
      const result = await scrapingService.scrapeProduct(url);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json(result.data);
    } catch (error) {
      console.error('Error in scrapeProduct:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  async generateVideo(req: Request, res: Response) {
    try {
      const { productData, adScript, aspectRatio, template, voiceoverEnabled = true } = req.body;

      if (!productData) {
        return res.status(400).json({ error: 'Product data is required' });
      }

      console.log(`Generating video for product: ${productData.title}`);
      
      const videoResponse = await videoService.createVideo({
        productData,
        adScript: adScript || {
          hook: '',
          problem: '',
          solution: '',
          benefits: [],
          callToAction: '',
          duration: 30
        },
        aspectRatio: aspectRatio || '16:9',
        template: template || 'default'
      }, voiceoverEnabled);

      res.json(videoResponse);
    } catch (error) {
      console.error('Error in generateVideo:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  async getVideo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const video = await videoService.getVideo(id);

      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      res.json(video);
    } catch (error) {
      console.error('Error in getVideo:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  async getAllVideos(req: Request, res: Response) {
    try {
      const videos = await videoService.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error('Error in getAllVideos:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  async downloadVideo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const videoPath = await videoService.getVideoFile(id);

      if (!videoPath) {
        return res.status(404).json({ error: 'Video file not found' });
      }

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="video-${id}.mp4"`);
      
      const fs = require('fs');
      const stream = fs.createReadStream(videoPath);
      stream.pipe(res);
    } catch (error) {
      console.error('Error in downloadVideo:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  async streamVideo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const videoPath = await videoService.getVideoFile(id);

      if (!videoPath) {
        return res.status(404).json({ error: 'Video file not found' });
      }

      const fs = require('fs');
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (error) {
      console.error('Error in streamVideo:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  async deleteVideo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const success = await videoService.deleteVideo(id);

      if (!success) {
        return res.status(404).json({ error: 'Video not found' });
      }

      res.json({ message: 'Video deleted successfully' });
    } catch (error) {
      console.error('Error in deleteVideo:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }
}

export const videoController = new VideoController();
