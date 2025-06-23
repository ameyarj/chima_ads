import React, { useState } from 'react';
import URLInput from './components/URLInput';
import VideoPreview from './components/VideoPreview';
import { apiService } from './services/api';
import { ProductData, VideoResponse } from '@shared/types';

type AppState = 'input' | 'processing' | 'preview';

function App() {
  const [state, setState] = useState<AppState>('input');
  const [currentVideo, setCurrentVideo] = useState<VideoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleURLSubmit = async (url: string) => {
    setLoading(true);
    setError(null);
    setState('processing');

    try {
      // Step 1: Scrape product data
      console.log('Scraping product data...');
      const productData: ProductData = await apiService.scrapeProduct(url);
      
      // Step 2: Generate video
      console.log('Generating video...');
      const videoResponse: VideoResponse = await apiService.generateVideo({
        productData,
        adScript: {
          hook: '',
          problem: '',
          solution: '',
          benefits: [],
          callToAction: '',
          duration: 30
        },
        aspectRatio: '16:9',
        template: 'default'
      });

      setCurrentVideo(videoResponse);
      
      // Step 3: Poll for completion if processing
      if (videoResponse.status === 'processing') {
        pollVideoStatus(videoResponse.id);
      } else {
        setState('preview');
      }
    } catch (err) {
      console.error('Error generating video:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating the video');
      setState('input');
    } finally {
      setLoading(false);
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const video = await apiService.getVideoStatus(videoId);
        setCurrentVideo(video);

        if (video.status === 'completed') {
          setState('preview');
          return;
        }

        if (video.status === 'failed') {
          setError(video.error || 'Video generation failed');
          setState('input');
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          setError('Video generation timed out');
          setState('input');
        }
      } catch (err) {
        console.error('Error polling video status:', err);
        setError('Error checking video status');
        setState('input');
      }
    };

    poll();
  };

  const handleDownload = async (videoId: string) => {
    try {
      const blob = await apiService.downloadVideo(videoId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-ad-${videoId}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading video:', err);
      alert('Error downloading video. Please try again.');
    }
  };

  const handleCreateNew = () => {
    setState('input');
    setCurrentVideo(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              🎬 Chima AI Video Generator
            </h1>
            <div className="text-sm text-gray-500">
              Transform URLs into Video Ads
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {state === 'input' && (
          <URLInput onSubmit={handleURLSubmit} loading={loading} />
        )}

        {state === 'processing' && currentVideo && (
          <VideoPreview
            video={currentVideo}
            onDownload={handleDownload}
            onCreateNew={handleCreateNew}
          />
        )}

        {state === 'preview' && currentVideo && (
          <VideoPreview
            video={currentVideo}
            onDownload={handleDownload}
            onCreateNew={handleCreateNew}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Powered by AI • Built with React & Remotion</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
