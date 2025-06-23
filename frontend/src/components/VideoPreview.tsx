import React from 'react';
import { VideoResponse } from '@shared/types';

interface VideoPreviewProps {
  video: VideoResponse;
  onDownload: (videoId: string) => void;
  onCreateNew: () => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ video, onDownload, onCreateNew }) => {
  const handleDownload = () => {
    onDownload(video.id);
  };

  if (video.status === 'failed') {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Video Generation Failed</h3>
          <p className="text-gray-600">{video.error || 'An error occurred while generating the video.'}</p>
        </div>
        <button onClick={onCreateNew} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (video.status === 'processing') {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <div className="text-primary-600 mb-4">
          <svg className="animate-spin w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="text-xl font-semibold mb-2">Generating Your Video Ad</h3>
          <p className="text-gray-600">This may take a few minutes. Please wait...</p>
        </div>
        <div className="bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-green-600 mb-2">
          🎉 Your Video Ad is Ready!
        </h3>
        <p className="text-gray-600">Preview your generated video ad below</p>
      </div>

      <div className="bg-black rounded-lg overflow-hidden mb-6">
        {video.videoUrl ? (
          <video
            controls
            className="w-full max-h-96 mx-auto"
            poster="/api/video-thumbnail.jpg"
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="aspect-video flex items-center justify-center text-white">
            <p>Video preview not available</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleDownload}
          className="btn-primary flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Video
        </button>
        
        <button
          onClick={onCreateNew}
          className="btn-secondary flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Another Video
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>Video created on {new Date(video.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default VideoPreview;
