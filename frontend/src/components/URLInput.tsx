import React, { useState } from 'react';
import { Link, Sparkles, ArrowRight } from 'lucide-react';

interface URLInputProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
}

const URLInput: React.FC<URLInputProps> = ({ onSubmit, loading = false }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateURL(url)) {
      setError('Please enter a valid URL');
      return;
    }

    onSubmit(url.trim());
  };

  const exampleUrls = [
    'https://www.apple.com/iphone-15-pro/',
    'https://www.nike.com/t/air-max-270-mens-shoes',
    'https://www.amazon.com/dp/B08N5WRWNW'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-white/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-4">
            <Link className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Step 1: Enter Product URL</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Paste Your Product URL
          </h2>
          <p className="text-gray-600 text-lg">
            Our AI will analyze your product page and create a compelling video advertisement
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Link className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/your-product"
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
              disabled={loading}
            />
            {error && (
              <div className="absolute -bottom-6 left-0 flex items-center space-x-1 text-red-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing Product...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Generate Video Ad</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Example URLs */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-4 text-center">Try these example URLs:</p>
          <div className="grid gap-3">
            {exampleUrls.map((exampleUrl, index) => (
              <button
                key={index}
                onClick={() => setUrl(exampleUrl)}
                className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200 text-sm text-gray-600 hover:text-gray-800"
              >
                {exampleUrl}
              </button>
            ))}
          </div>
        </div>

        {/* Supported Platforms */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-4">Supported Platforms</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">Shopify</span>
              </div>
              <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-orange-700 font-medium">Amazon</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700 font-medium">WooCommerce</span>
              </div>
              <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-purple-700 font-medium">General E-commerce</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default URLInput;