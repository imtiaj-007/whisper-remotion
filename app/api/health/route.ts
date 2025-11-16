import { NextResponse } from 'next/server'

interface HealthResponse {
    status: 'ok' | 'error'
    timestamp: string
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
    const healthData: HealthResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
    }

    return NextResponse.json(healthData, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    })
}
