import axios from 'axios';
import { ProductData, VideoResponse, VideoRequest } from '@shared/types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const apiService = {
  // Scrape product data from URL
  scrapeProduct: async (url: string): Promise<ProductData> => {
    const response = await api.post('/scrape', { url });
    return response.data;
  },

  // Generate video from product data
  generateVideo: async (request: Omit<VideoRequest, 'id'>): Promise<VideoResponse> => {
    const response = await api.post('/generate-video', request);
    return response.data;
  },

  // Get video status
  getVideoStatus: async (videoId: string): Promise<VideoResponse> => {
    const response = await api.get(`/video/${videoId}`);
    return response.data;
  },

  // Download video
  downloadVideo: async (videoId: string): Promise<Blob> => {
    const response = await api.get(`/video/${videoId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get all videos
  getVideos: async (): Promise<VideoResponse[]> => {
    const response = await api.get('/videos');
    return response.data;
  },
};

export default apiService;
