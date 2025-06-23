import { Router } from 'express';
import { videoController } from '../controllers/videoController';

const router = Router();

router.post('/scrape', videoController.scrapeProduct.bind(videoController));

router.post('/generate-video', videoController.generateVideo.bind(videoController));

router.get('/video/:id', videoController.getVideo.bind(videoController));

router.get('/videos', videoController.getAllVideos.bind(videoController));

router.get('/video/:id/download', videoController.downloadVideo.bind(videoController));

router.get('/video/:id/file', videoController.streamVideo.bind(videoController));

router.delete('/video/:id', videoController.deleteVideo.bind(videoController));

export default router;
