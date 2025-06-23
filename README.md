# Chima AI Video Ad Generator

Transform any product URL into compelling video advertisements using AI. Built with React, Node.js, and Remotion.

## 🚀 Features

- **URL to Video**: Input any product URL and generate professional video ads
- **AI-Powered Scripts**: Uses LLMs to create compelling ad copy
- **Multiple Aspect Ratios**: Support for 16:9 (horizontal) and 9:16 (vertical) videos
- **Easy LLM Switching**: Simple configuration to switch between OpenAI, Anthropic, and other providers
- **Real-time Preview**: Watch your video generation progress
- **Download & Share**: Download generated videos in MP4 format

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: SQLite
- **Video Generation**: Remotion
- **Web Scraping**: Puppeteer + Cheerio
- **AI**: OpenAI API (easily switchable to other providers)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (or other LLM provider)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chima_ads
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install

   # Install video template dependencies
   cd ../video-templates
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cd ../backend
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```env
   # LLM Configuration
   LLM_PROVIDER=openai
   LLM_MODEL=gpt-3.5-turbo
   LLM_API_KEY=your_openai_api_key_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```

## 🚀 Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on http://localhost:5000

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on http://localhost:3000

3. **Test the video templates (optional)**
   ```bash
   cd video-templates
   npm start
   ```
   This opens the Remotion preview at http://localhost:3000

## 📖 Usage

1. **Open the application** at http://localhost:3000
2. **Enter a product URL** (supports Shopify stores, Amazon products, and general e-commerce sites)
3. **Click "Generate Video Ad"** and wait for the AI to process
4. **Preview your video** once generation is complete
5. **Download** the MP4 file or create another video

## 🔄 Switching LLM Providers

The application supports easy switching between LLM providers:

### OpenAI (Default)
```env
LLM_PROVIDER=openai
LLM_MODEL=gpt-3.5-turbo
LLM_API_KEY=your_openai_api_key
```

### Anthropic Claude
```env
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-haiku-20240307
LLM_API_KEY=your_anthropic_api_key
LLM_BASE_URL=https://api.anthropic.com
```

### Custom/Local Models
```env
LLM_PROVIDER=openai
LLM_MODEL=your-model-name
LLM_API_KEY=your_api_key
LLM_BASE_URL=http://localhost:1234/v1
```

## 🎬 Video Templates

The application uses Remotion for video generation. Templates are located in `video-templates/src/templates/`:

- **ProductShowcase**: Main template with animated text, product images, and call-to-action
- Supports both 16:9 and 9:16 aspect ratios
- Customizable animations and styling

## 🏗 Project Structure

```
chima_ads/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── hooks/         # Custom React hooks
├── backend/           # Node.js backend API
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   ├── services/      # Business logic
│   │   ├── config/        # Configuration files
│   │   └── routes/        # API routes
├── video-templates/   # Remotion video templates
│   └── src/templates/     # Video template components
├── shared/           # Shared TypeScript types
└── README.md
```

## 🔧 API Endpoints

- `POST /api/scrape` - Scrape product data from URL
- `POST /api/generate-video` - Generate video from product data
- `GET /api/video/:id` - Get video status
- `GET /api/videos` - Get all videos
- `GET /api/video/:id/file` - Stream video file
- `GET /api/video/:id/download` - Download video file

## 🐛 Troubleshooting

### Common Issues

1. **Video generation fails**
   - Check that all dependencies are installed in `video-templates/`
   - Ensure Remotion can access the internet for external images
   - Check backend logs for detailed error messages

2. **Scraping doesn't work**
   - Some websites block automated scraping
   - Try with different product URLs
   - Check if the website requires authentication

3. **LLM API errors**
   - Verify your API key is correct
   - Check your API quota/billing
   - Ensure the model name is correct

## 📝 Development

### Adding New Video Templates

1. Create a new component in `video-templates/src/templates/`
2. Register it in `video-templates/src/Root.tsx`
3. Update the backend to support the new template

### Adding New LLM Providers

1. Create a new provider class in `backend/src/config/llm.ts`
2. Implement the `LLMProvider` interface
3. Add the provider to the factory method


