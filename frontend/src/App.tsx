import React, { useState } from 'react';
import { Sparkles, Video, Wand2, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import URLInput from './components/URLInput';
import VoiceoverOptions from './components/VoiceoverOptions';
import VideoPreview from './components/VideoPreview';
import { VideoResponse } from './types';
import { apiService } from './services/api';

type AppState = 'input' | 'processing' | 'completed' | 'error';

interface VideoSettings {
  voiceoverEnabled: boolean;
  voice: string;
  speed: number;
  aspectRatio: '9:16' | '16:9';
  template: string;
}

function App() {
  const [currentState, setCurrentState] = useState<AppState>('input');
  const [currentVideo, setCurrentVideo] = useState<VideoResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    voiceoverEnabled: true,
    voice: 'nova',
    speed: 1.0,
    aspectRatio: '16:9',
    template: 'default'
  });

  const handleURLSubmit = async (url: string) => {
    setCurrentState('processing');
    setError('');
    
    try {
      const videoResponse = await apiService.generateVideo({
        url,
        voiceoverEnabled: videoSettings.voiceoverEnabled,
        voice: videoSettings.voice,
        speed: videoSettings.speed,
        aspectRatio: videoSettings.aspectRatio,
        template: videoSettings.template
      });

      setCurrentVideo(videoResponse);
      
      // Poll for video completion
      const pollVideo = async (videoId: string) => {
        const maxAttempts = 60; // 5 minutes with 5-second intervals
        let attempts = 0;
        
        const poll = async () => {
          try {
            const updatedVideo = await apiService.getVideo(videoId);
            setCurrentVideo(updatedVideo);
            
            if (updatedVideo.status === 'completed') {
              setCurrentState('completed');
              return;
            } else if (updatedVideo.status === 'failed') {
              setError(updatedVideo.error || 'Video generation failed');
              setCurrentState('error');
              return;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(poll, 5000); // Poll every 5 seconds
            } else {
              setError('Video generation timed out');
              setCurrentState('error');
            }
          } catch (error) {
            console.error('Error polling video status:', error);
            setError(error instanceof Error ? error.message : 'Unknown error occurred');
            setCurrentState('error');
          }
        };
        
        poll();
      };
      
      if (videoResponse.status === 'processing') {
        pollVideo(videoResponse.id);
      } else if (videoResponse.status === 'completed') {
        setCurrentState('completed');
      } else if (videoResponse.status === 'failed') {
        setError(videoResponse.error || 'Video generation failed');
        setCurrentState('error');
      }
      
    } catch (error) {
      console.error('Error generating video:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setCurrentState('error');
    }
  };

  const handleVoiceoverChange = (enabled: boolean, voice: string, speed: number) => {
    setVideoSettings(prev => ({ 
      ...prev, 
      voiceoverEnabled: enabled, 
      voice, 
      speed 
    }));
  };


  const handleDownload = async (videoId: string) => {
    try {
      await apiService.downloadVideo(videoId);
    } catch (error) {
      console.error('Error downloading video:', error);
      setError(error instanceof Error ? error.message : 'Failed to download video');
    }
  };

  const handleCreateNew = () => {
    setCurrentState('input');
    setCurrentVideo(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  AI Video Ad Generator
                </h1>
                <p className="text-sm text-gray-600">Transform URLs into compelling video advertisements</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>30s Generation</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center space-x-2 ${currentState === 'input' ? 'text-blue-600' : currentState === 'processing' || currentState === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentState === 'input' ? 'bg-blue-100 border-2 border-blue-600' : currentState === 'processing' || currentState === 'completed' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                {currentState === 'processing' || currentState === 'completed' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-semibold">1</span>
                )}
              </div>
              <span className="font-medium">Input URL</span>
            </div>
            
            <div className={`w-16 h-0.5 ${currentState === 'processing' || currentState === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center space-x-2 ${currentState === 'processing' ? 'text-blue-600' : currentState === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentState === 'processing' ? 'bg-blue-100 border-2 border-blue-600' : currentState === 'completed' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                {currentState === 'completed' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : currentState === 'processing' ? (
                  <Wand2 className="w-4 h-4 animate-pulse" />
                ) : (
                  <span className="text-sm font-semibold">2</span>
                )}
              </div>
              <span className="font-medium">AI Processing</span>
            </div>
            
            <div className={`w-16 h-0.5 ${currentState === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center space-x-2 ${currentState === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentState === 'completed' ? 'bg-green-100 border-2 border-green-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
                {currentState === 'completed' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-semibold">3</span>
                )}
              </div>
              <span className="font-medium">Video Ready</span>
            </div>
          </div>
        </div>

        {/* Content based on current state */}
        {currentState === 'input' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Powered by Advanced AI</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Create Stunning Video Ads in
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Seconds</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Simply paste your product URL and watch our AI transform it into a professional video advertisement with compelling visuals and persuasive copy.
              </p>
            </div>

            <URLInput onSubmit={handleURLSubmit} loading={false} />
            
            <VoiceoverOptions
              onVoiceoverChange={handleVoiceoverChange}
              enabled={videoSettings.voiceoverEnabled}
              voice={videoSettings.voice}
              speed={videoSettings.speed}
            />

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600">Our AI analyzes your product page to extract key features, benefits, and selling points automatically.</p>
              </div>
              
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Videos</h3>
                <p className="text-gray-600">Generate high-quality video ads with smooth animations, compelling visuals, and professional voiceovers.</p>
              </div>
              
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Get your video ad ready in under 30 seconds. No more waiting hours or days for video production.</p>
              </div>
            </div>
          </div>
        )}

        {(currentState === 'processing' || currentState === 'completed') && currentVideo && (
          <VideoPreview
            video={currentVideo}
            onDownload={handleDownload}
            onCreateNew={handleCreateNew}
          />
        )}

        {currentState === 'error' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h3>
              <p className="text-gray-600 mb-6">{error || 'We encountered an error while processing your request. Please try again.'}</p>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 AI Video Ad Generator. Powered by advanced artificial intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
