import React, { useState, useEffect } from 'react';
import { Download, RotateCcw, Share2 } from 'lucide-react';
import { VideoResponse } from '../types';
import { apiService } from '../services/api';

interface VideoPreviewProps {
  video: VideoResponse;
  onDownload: (videoId: string) => void;
  onCreateNew: () => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ video, onDownload, onCreateNew }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (video.status === 'processing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 15;
        });
      }, 2000);
      return () => clearInterval(interval);
    } else if (video.status === 'completed') {
      setProgress(100);
    }
  }, [video.status]);

  const handleDownload = () => {
    onDownload(video.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out my AI-generated video ad!',
        text: 'I just created this amazing video ad using AI',
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (video.status === 'failed') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/50 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Video Generation Failed</h3>
          <p className="text-gray-600 text-lg mb-8">{video.error || 'An error occurred while generating the video.'}</p>
          <button 
            onClick={onCreateNew} 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (video.status === 'processing') {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/50">
          <div className="text-center mb-12">
            <div className="relative inline-flex mb-8">
              <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 animate-spin opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Creating Your Video Masterpiece
            </h3>
            <p className="text-gray-600 text-xl mb-12">Our AI is crafting a compelling video ad just for you...</p>
            
            <div className="max-w-lg mx-auto mb-12">
              <div className="relative overflow-hidden bg-gray-200 rounded-full h-4 shadow-inner">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-lg font-semibold text-gray-700 mt-4">{Math.round(progress)}% Complete</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                <div className="text-4xl mb-3">🔍</div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Analyzing Product</h4>
                <p className="text-blue-700 text-sm">Extracting key features and benefits</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                <div className="text-4xl mb-3">✨</div>
                <h4 className="text-lg font-semibold text-purple-900 mb-2">Generating Script</h4>
                <p className="text-purple-700 text-sm">Creating compelling copy and voiceover</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                <div className="text-4xl mb-3">🎬</div>
                <h4 className="text-lg font-semibold text-green-900 mb-2">Rendering Video</h4>
                <p className="text-green-700 text-sm">Assembling final video with effects</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-white/50">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              🎉 Your Video Ad is Ready!
            </span>
          </h3>
          <p className="text-gray-600 text-xl">Preview your AI-generated video advertisement below</p>
        </div>

        {/* Video Player */}
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl mb-8">
          {video.videoUrl ? (
            <div className="relative aspect-video">
              <video
                className="w-full h-full object-cover"
                poster="https://via.placeholder.com/1280x720/1f2937/ffffff?text=Video+Preview"
                controls
              >
                <source src={apiService.getVideoStreamUrl(video.id)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center text-white">
              <div className="text-center">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 text-lg">Video preview not available</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Download className="w-6 h-6" />
            <span>Download Video</span>
          </button>
          
          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Share2 className="w-6 h-6" />
            <span>Share Video</span>
          </button>
          
          <button
            onClick={onCreateNew}
            className="inline-flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <RotateCcw className="w-6 h-6" />
            <span>Create Another</span>
          </button>
        </div>

        {/* Video Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">30s</div>
            <p className="text-blue-800 font-medium">Duration</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">1080p</div>
            <p className="text-green-800 font-medium">Quality</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">MP4</div>
            <p className="text-purple-800 font-medium">Format</p>
          </div>
        </div>

        {/* Creation Info */}
        <div className="text-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <p className="text-gray-600 flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Video created on {new Date(video.createdAt).toLocaleString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
