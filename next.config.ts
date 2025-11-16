import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
    output: 'standalone',
    turbopack: {
        root: path.resolve(__dirname),
        resolveAlias: {
            '@/src': path.resolve(__dirname, 'src'),
        },
    },
    watchOptions: {
        pollIntervalMs: 1000,
    },
}

export default nextConfig
