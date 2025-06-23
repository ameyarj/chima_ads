import { Router } from 'express';
import { videoController } from '../controllers/videoController';

const router = Router();

// Scrape product data from URL
router.post('/scrape', videoController.scrapeProduct.bind(videoController));

// Generate video from product data
router.post('/generate-video', videoController.generateVideo.bind(videoController));

// Get video status
router.get('/video/:id', videoController.getVideo.bind(videoController));

// Get all videos
router.get('/videos', videoController.getAllVideos.bind(videoController));

// Download video file
router.get('/video/:id/download', videoController.downloadVideo.bind(videoController));

// Stream video file (for preview)
router.get('/video/:id/file', videoController.streamVideo.bind(videoController));

// Delete video
router.delete('/video/:id', videoController.deleteVideo.bind(videoController));

export default router;
