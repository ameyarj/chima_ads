import React, { useState } from 'react';

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

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        Transform Your Product URL into a Video Ad
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Product URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/product"
            className="input-field"
            disabled={loading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Generate Video Ad'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium mb-2">Supported platforms:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Shopify stores</li>
          <li>Amazon product pages</li>
          <li>General e-commerce sites</li>
        </ul>
      </div>
    </div>
  );
};

export default URLInput;
