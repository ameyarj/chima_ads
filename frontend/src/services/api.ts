import { ProductData, VideoResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export interface VideoGenerationRequest {
  url: string;
  voiceoverEnabled?: boolean;
  voice?: string;
  speed?: number;
  aspectRatio?: '9:16' | '16:9';
  template?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async scrapeProduct(url: string): Promise<ProductData> {
    const result = await this.request<ProductData>('/scrape', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    return result;
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoResponse> {
    const productData = await this.scrapeProduct(request.url);
    
    if (request.voiceoverEnabled && (request.voice || request.speed)) {
      (productData as ProductData & { voiceSettings?: { voice: string; speed: number } }).voiceSettings = {
        voice: request.voice || 'nova',
        speed: request.speed || 1.0
      };
    }
    
    const videoRequest = {
      productData,
      adScript: undefined, 
      aspectRatio: request.aspectRatio || '16:9',
      template: request.template || 'default',
      voiceoverEnabled: request.voiceoverEnabled ?? true,
    };

    const result = await this.request<VideoResponse>('/generate-video', {
      method: 'POST',
      body: JSON.stringify(videoRequest),
    });
    
    return result;
  }

  async getVideo(id: string): Promise<VideoResponse> {
    return this.request<VideoResponse>(`/video/${id}`);
  }

  async getAllVideos(): Promise<VideoResponse[]> {
    return this.request<VideoResponse[]>('/videos');
  }

  async downloadVideo(id: string): Promise<void> {
    const url = `${API_BASE_URL}/video/${id}/download`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to download video');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `video-${id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  async deleteVideo(id: string): Promise<void> {
    await this.request(`/video/${id}`, {
      method: 'DELETE',
    });
  }

  getVideoStreamUrl(id: string): string {
    return `${API_BASE_URL}/video/${id}/file`;
  }
}

export const apiService = new ApiService();
