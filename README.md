# Chima AI Video Ad Generator

Transform any product URL into compelling 30-second video advertisements with AI-generated scripts and professional voiceovers.

## 🚀 Features

- **URL to Video**: Input any product URL and generate professional video ads automatically
- **AI-Powered Scripts**: Uses LLMs to create compelling ad copy optimized for 30-second videos  
- **Professional Voiceovers**: 6 AI voice options (Alloy, Echo, Fable, Onyx, Nova, Shimmer) with speed control
- **Background Music**: Integrated background music with proper audio mixing
- **Multiple Aspect Ratios**: Support for 16:9 (horizontal) and 9:16 (vertical) videos
- **Real-time Progress**: Watch your video generation progress with live updates
- **Download & Share**: Download generated videos in MP4 format

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript + Prisma + SQLite
- **Video Generation**: Remotion with professional templates
- **Web Scraping**: Puppeteer + Cheerio (supports Amazon, Shopify)
- **AI Services**: OpenAI API for script generation and text-to-speech
- **Audio Processing**: AI voiceovers with background music mixing

## 📋 Prerequisites

- Node.js 18+
- OpenAI API key

## 🔧 Quick Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/ameyarj/chima_ads
   cd chima_ads
   
   # Install all dependencies
   cd frontend && npm install
   cd ../backend && npm install  
   cd ../video-templates && npm install
   ```

2. **Configure environment**
   ```bash
   cd backend
   ```
   
   Edit `.env`:
   ```env
   LLM_PROVIDER=openai
   LLM_MODEL=gpt-4.1
   LLM_API_KEY=your_openai_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

3. **Setup database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Add background music (optional)**
   ```bash
   # Add your background music file to:
   cd ../video-templates/public/
   # Place your background-music.mp3 file here
   ```

## 🚀 Running the App

**Start backend:**
```bash
cd backend && npm run dev
```

**Start frontend:**
```bash
cd frontend && npm run dev
```

Visit http://localhost:3000 to use the application.

## 📖 How to Use

1. **Enter Product URL** - Paste any product page URL (Amazon, Shopify, etc.)
2. **Configure Voiceover** - Choose AI voice (Nova, Alloy, etc.) and speech speed
3. **Generate Video** - AI analyzes product and creates 30-second video ad
4. **Preview & Download** - Watch your video and download MP4 file

## 🎛 Voiceover Options

Choose from 6 professional AI voices:
- **Alloy**: Neutral, balanced tone
- **Echo**: Clear, professional voice  
- **Fable**: Warm, storytelling voice
- **Onyx**: Deep, authoritative voice
- **Nova**: Friendly, engaging voice ⭐ (default)
- **Shimmer**: Bright, energetic voice

Speed control: 0.5x to 2.5x (1.0x = normal speed)

## 🎵 Audio Features

- **Background Music**: Automatically mixed at 25% volume
- **Professional Voiceover**: AI-generated speech at 85% volume  
- **Perfect Sync**: Scripts optimized for exactly 30-second duration
- **Quality Audio**: MP3 format with proper audio mixing

## 🏗 Project Structure

```
chima_ads/
├── frontend/              # React app with beautiful UI
│   ├── src/components/    # URLInput, VideoPreview, VoiceoverOptions
│   └── src/services/      # API integration layer
├── backend/               # Node.js API server  
│   ├── src/services/      # Video generation, TTS, scraping
│   └── videos/            # Generated video files
├── video-templates/       # Remotion video templates
│   ├── src/templates/     # ProductShowcase template
│   └── public/            # Audio files (TTS + background music)
└── shared/               # TypeScript types
```

## 🔧 API Endpoints

- `POST /api/scrape` - Extract product data from URL
- `POST /api/generate-video` - Create video with AI script and voiceover
- `GET /api/video/:id` - Check video generation status
- `GET /api/video/:id/file` - Stream/preview video
- `GET /api/video/:id/download` - Download video file

## 🐛 Troubleshooting

**Video generation issues:**
- Ensure all npm packages are installed in all 3 directories
- Check OpenAI API key and quota
- Verify internet connection for image scraping

**Audio not working:**
- Check that TTS is enabled in voiceover options
- Verify OpenAI API key has TTS access
- Ensure background music file is in `video-templates/public/`

**Scraping fails:**
- Try different product URLs
- Some sites block automated scraping
- Check if URL is publicly accessible

## 🎬 Supported Platforms

✅ **Amazon products** 
✅ **Shopify stores**  
 

## 🔄 Switching LLM Providers

Update `.env` to use different AI providers:

**Anthropic Claude:**
```env
LLM_PROVIDER=anthropic
LLM_API_KEY=your_anthropic_key
```

**Local models:**
```env
LLM_BASE_URL=http://localhost:1234/v1
