# # STAGE 1: Build whisper.cpp from source
# FROM debian:bookworm-slim AS whisper-builder

# WORKDIR /whisper-build

# RUN apt-get update && apt-get install -y --no-install-recommends \
#     git \
#     build-essential \
#     cmake \
#     ca-certificates \
#     && rm -rf /var/lib/apt/lists/* \
#     && update-ca-certificates

# # Clone and build whisper.cpp
# RUN git clone https://github.com/ggml-org/whisper.cpp.git . && \
#     git checkout master
# RUN cmake -B build
# RUN cmake --build build --config Release

# STAGE 1: Extract whisper.cpp binaries from official image
FROM ghcr.io/ggml-org/whisper.cpp:main AS whisper


# STAGE 2: Build Next.js app
FROM node:20-slim AS deps

WORKDIR /app

# Install required OS utils
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm install --production=false


# STAGE 3: Build Next.js (App Router)
FROM node:20-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# STAGE 4: Production Runtime
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install ffmpeg for audio conversion
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy whisper binaries and libraries from builder
COPY --from=whisper /app/build/bin/whisper-cli /usr/local/bin/whisper-cli
COPY --from=whisper /app/build/src/libwhisper.so* /usr/local/lib/
COPY --from=whisper /app/build/ggml/src/libggml*.so* /usr/local/lib/


# Ensure loader can find libs
RUN ldconfig
RUN chmod +x /usr/local/bin/whisper-cli

# Download whisper model if it doesn't exist
RUN mkdir -p /app/models && \
    if [ ! -f /app/models/ggml-base.bin ]; then \
        curl -L -o /app/models/ggml-base.bin \
        https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin; \
    fi


# Copy built Next.js app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

CMD ["npm", "start"]
    