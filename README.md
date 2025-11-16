# Whisper Remotion

A modern web application for automatic video captioning using OpenAI's Whisper speech recognition model, integrated with Remotion for real-time caption rendering and styling.

## Project Summary

Whisper Remotion is a full-stack video captioning platform that enables users to:

- **Upload videos** to AWS S3 with secure presigned URLs
- **Extract audio** from video files using FFmpeg
- **Generate captions** using Whisper.cpp (OpenAI's Whisper model)
- **Render captions** with Remotion player in real-time
- **Customize caption styles** with multiple presets (bottom-centered, top-bar, karaoke)
- **Preview videos** with synchronized captions before export

The application provides a seamless workflow from video upload to caption generation and preview, all within a modern React-based interface.

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible component primitives
- **Remotion** - Video rendering and caption display
  - `@remotion/player` - Video player component
  - `@remotion/captions` - Caption utilities
  - `@remotion/rounded-text-box` - Styled caption boxes
  - `@remotion/google-fonts` - Font loading
- **Sonner** - Toast notifications
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **AWS SDK v3** - S3 integration for file storage
- **Whisper.cpp** - Speech-to-text transcription
- **FFmpeg** - Video/audio processing

### Infrastructure
- **Docker** - Containerization
- **Alpine Linux** - Lightweight base images
- **AWS S3** - Object storage

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## Getting Started

### Prerequisites

- Node.js 22+ and npm
- Docker and Docker Compose (for containerized setup)
- AWS account with S3 bucket configured
- FFmpeg installed (if running locally without Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whisper-remotion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # AWS Configuration
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_BUCKET_NAME=whisper-remotion

   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

   # Model Configuration
   MODEL_PATH=/app/models/ggml-base.bin
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Setup

**Development Environment:**
```bash
docker-compose -f docker-compose.dev.yaml up --build
```

**Production Environment:**
```bash
docker-compose up --build
```

The Docker setup includes:
- Whisper.cpp built from source
- FFmpeg for audio extraction
- Pre-configured Whisper model (ggml-base.bin)
- Optimized multi-stage builds for minimal image size

### Environment Variables

#### Required (Server-side)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_BUCKET_NAME` - S3 bucket name
- `AWS_REGION` - AWS region (default: `ap-south-1`)

#### Optional
- `MODEL_PATH` - Path to Whisper model (default: `/app/models/ggml-base.bin`)
- `NEXT_PUBLIC_API_BASE_URL` - API base URL for client (default: `http://localhost:3000/api`)

## Project Structure

```
whisper-remotion/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── health/               # Health check endpoint
│   │   ├── upload-url/           # Generate S3 presigned URLs
│   │   └── video/                # Video processing endpoints
│   │       └── [file_key]/
│   │           ├── audio/        # Extract audio from video
│   │           ├── transcription/# Generate captions
│   │           └── signed-url/   # Get video playback URL
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   │   ├── alert.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── video/                    # Video-related components
│       ├── video-component.tsx   # Remotion video component
│       ├── caption-renderer.tsx  # Caption rendering logic
│       ├── unified-video-player.tsx
│       ├── remotion-player.tsx
│       └── ...
│
├── config/                       # Configuration files
│   └── settings.ts               # Environment settings
│
├── context/                      # React context providers
│   └── video-context.tsx         # Video state management
│
├── lib/                          # Utility libraries
│   ├── awsS3.ts                  # AWS S3 operations
│   ├── axios.ts                  # HTTP client configuration
│   └── utils.ts                  # General utilities
│
├── types/                        # TypeScript type definitions
│   ├── app.d.ts                  # Application types
│   └── caption-styles.ts         # Caption style types
│
├── utils/                        # Utility functions
│   ├── caption-converter.ts     # Whisper to Remotion format
│   ├── ffmpeg.ts                 # FFmpeg operations
│   └── whisper.ts                # Whisper CLI wrapper
│
├── Dockerfile                    # Production Docker image
├── Dockerfile.dev                # Development Docker image
├── docker-compose.yaml           # Production compose config
├── docker-compose.dev.yaml       # Development compose config
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Features

### Video Processing
- Secure video upload via AWS S3 presigned URLs
- Automatic audio extraction from video files
- Support for multiple video formats (MP4, etc.)

### Caption Generation
- Automatic speech-to-text using Whisper.cpp
- Timestamp synchronization
- Support for multiple languages
- Configurable model size (base, small, medium, large)

### Caption Rendering
- Real-time caption preview with Remotion player
- Multiple caption style presets:
  - **Bottom Centered** - Standard subtitle style
  - **Top Bar** - News-style top banner
  - **Karaoke** - Word-by-word highlighting
- Customizable styling (colors, fonts, positioning)
- Responsive text fitting and multi-line support

### User Experience
- Drag-and-drop video upload
- Real-time processing status
- Error handling and notifications
- Dark mode support (via next-themes)

## API Endpoints

### `GET /api/upload-url`
Generate a presigned URL for video upload.

**Response:**
```json
{
  "uploadUrl": "https://...",
  "fileKey": "uploads/videos/uuid.mp4"
}
```

### `POST /api/video/[file_key]/audio`
Extract audio from uploaded video.

**Response:**
```json
{
  "audioPath": "/tmp/audio-uuid.wav"
}
```

### `POST /api/video/[file_key]/transcription`
Generate captions from audio file.

**Request:**
```json
{
  "audioPath": "/tmp/audio-uuid.wav"
}
```

**Response:**
```json
{
  "transcript": { ... },
  "transcriptKey": "transcripts/uuid.json"
}
```

### `GET /api/video/[file_key]/signed-url`
Get presigned URL for video playback.

**Response:**
```json
{
  "url": "https://..."
}
```

### `GET /api/health`
Health check endpoint.

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run type-check   # Type check without emitting
npm run lint:check   # Check linting errors
npm run lint:fix     # Fix linting errors
npm run format:check # Check code formatting
npm run format:fix   # Format code
```

### Code Style

The project uses:
- **ESLint** for linting (Next.js config)
- **Prettier** for code formatting
- **TypeScript** strict mode

Run `npm run lint:fix` and `npm run format:fix` before committing.

## Deployment

### Docker Deployment

1. Build the production image:
   ```bash
   docker build -t whisper-remotion .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 \
     -e AWS_ACCESS_KEY_ID=your_key \
     -e AWS_SECRET_ACCESS_KEY=your_secret \
     -e AWS_BUCKET_NAME=your_bucket \
     whisper-remotion
   ```

### Environment Setup

Ensure all required environment variables are set in your deployment environment. For production, use secure secret management (AWS Secrets Manager, Vercel Environment Variables, etc.).

### Model Download

The Dockerfile automatically downloads the Whisper model during build. For custom models, mount a volume or modify the `MODEL_PATH` environment variable.

## Troubleshooting

### Common Issues

**Whisper model not found:**
- Ensure `MODEL_PATH` points to a valid model file
- Check that the model was downloaded during Docker build
- Verify file permissions

**AWS S3 errors:**
- Verify AWS credentials are correct
- Check bucket permissions and region
- Ensure bucket exists and is accessible

**FFmpeg errors:**
- Verify FFmpeg is installed in the container
- Check video file format compatibility
- Review file size limits

**Caption rendering issues:**
- Check browser console for errors
- Verify Remotion dependencies are installed
- Ensure video URL is accessible (CORS)

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes** thoroughly
   ```bash
   npm run type-check
   npm run lint:check
   npm run build
   ```

4. **Commit your changes** with clear, descriptive messages
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork** and open a Pull Request

### Contribution Guidelines

- Follow the existing code style and conventions
- Write clear commit messages (conventional commits)
- Add tests for new features when applicable
- Update documentation for API changes
- Ensure all checks pass before submitting PR

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenAI Whisper](https://github.com/openai/whisper) - Speech recognition model
- [Whisper.cpp](https://github.com/ggerganov/whisper.cpp) - C++ implementation
- [Remotion](https://www.remotion.dev/) - Video rendering framework
- [Next.js](https://nextjs.org/) - React framework
- [Radix UI](https://www.radix-ui.com/) - UI component primitives

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues and discussions
- Review the documentation

---

**Built with ❤️ using Next.js, Remotion, and Whisper**
