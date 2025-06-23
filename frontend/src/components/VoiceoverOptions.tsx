import React from 'react';
import { Mic, Volume2, Settings, Info } from 'lucide-react';

interface VoiceoverOptionsProps {
  onVoiceoverChange: (enabled: boolean, voice: string, speed: number) => void;
  enabled: boolean;
  voice: string;
  speed: number;
}

const VoiceoverOptions: React.FC<VoiceoverOptionsProps> = ({
  onVoiceoverChange,
  enabled,
  voice,
  speed,
}) => {
  const voices = [
    { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced tone', gender: 'Neutral' },
    { id: 'echo', name: 'Echo', description: 'Clear, professional voice', gender: 'Male' },
    { id: 'fable', name: 'Fable', description: 'Warm, storytelling voice', gender: 'Female' },
    { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice', gender: 'Male' },
    { id: 'nova', name: 'Nova', description: 'Friendly, engaging voice', gender: 'Female' },
    { id: 'shimmer', name: 'Shimmer', description: 'Bright, energetic voice', gender: 'Female' },
  ];

  const handleEnabledChange = (newEnabled: boolean) => {
    onVoiceoverChange(newEnabled, voice, speed);
  };

  const handleVoiceChange = (newVoice: string) => {
    onVoiceoverChange(enabled, newVoice, speed);
  };

  const handleSpeedChange = (newSpeed: number) => {
    onVoiceoverChange(enabled, voice, newSpeed);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-white/50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Mic className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">AI Voiceover</h3>
              <p className="text-gray-600">Add professional narration to your video advertisement</p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => handleEnabledChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-600"></div>
          </label>
        </div>

        {enabled && (
          <div className="space-y-8 animate-in slide-in-from-top-2 duration-300">
            {/* Voice Selection */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Volume2 className="w-5 h-5 text-gray-700" />
                <h4 className="text-lg font-semibold text-gray-900">Choose Voice</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {voices.map((voiceOption) => (
                  <label
                    key={voiceOption.id}
                    className={`
                      relative flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg
                      ${voice === voiceOption.id
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="voice"
                      value={voiceOption.id}
                      checked={voice === voiceOption.id}
                      onChange={(e) => handleVoiceChange(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {voiceOption.name}
                      </span>
                      {voice === voiceOption.id && (
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{voiceOption.description}</p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full self-start">
                      {voiceOption.gender}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Speed Control */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="w-5 h-5 text-gray-700" />
                <h4 className="text-lg font-semibold text-gray-900">Speech Speed</h4>
                <span className="text-lg font-bold text-purple-600">{speed}x</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={speed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((speed - 0.5) / 2) * 100}%, #e5e7eb ${((speed - 0.5) / 2) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>1.5x</span>
                  <span>2.0x</span>
                  <span>2.5x</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Slower</span>
                <span>Normal</span>
                <span>Faster</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">AI-Powered Narration</h4>
                  <p className="text-blue-700 leading-relaxed">
                    Our advanced AI will automatically generate natural-sounding voiceover that perfectly matches your product's tone and messaging. The script is crafted to highlight key features and drive conversions.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Natural Speech
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Emotion Recognition
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Multiple Languages
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceoverOptions;