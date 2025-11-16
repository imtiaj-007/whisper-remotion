# STAGE 1: Build whisper.cpp from source on Alpine
FROM alpine:3.19 AS whisper-builder

WORKDIR /whisper-build

RUN apk add --no-cache \
    git \
    build-base \
    cmake \
    ca-certificates

# Clone and build whisper.cpp
RUN git clone https://github.com/ggml-org/whisper.cpp.git . && \
    git checkout master
RUN cmake -B build
RUN cmake --build build --config Release


# STAGE 2: Build Next.js app
FROM node:22-alpine AS deps

WORKDIR /app

# Install required OS utils
RUN apk add --no-cache \
    python3 \
    build-base \
    ffmpeg

# Install dependencies only when needed
COPY package.json package-lock.json* ./
RUN npm ci --only=production && \
    cp -R node_modules /prod_node_modules && \
    npm ci


# STAGE 3: Build Next.js (App Router)
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables (dummy values for build time validation)
ENV NEXT_TELEMETRY_DISABLED=1 \
    AWS_ACCESS_KEY_ID=dummy-build-key \
    AWS_SECRET_ACCESS_KEY=dummy-build-secret

# Build Next.js application
RUN npm run build


# STAGE 4: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Install runtime dependencies
RUN apk add --no-cache \
    ffmpeg \
    curl \
    ca-certificates \
    libstdc++ \
    libgomp

# Copy whisper binaries and libraries from builder
COPY --from=whisper-builder /whisper-build/build/bin/whisper-cli /usr/local/bin/whisper-cli
COPY --from=whisper-builder /whisper-build/build/src/libwhisper.so* /usr/local/lib/
COPY --from=whisper-builder /whisper-build/build/ggml/src/libggml*.so* /usr/local/lib/

# Set library path and permissions
ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
RUN chmod +x /usr/local/bin/whisper-cli

# Download whisper model
RUN mkdir -p /app/models && \
    curl -L -o /app/models/ggml-base.bin \
    https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]