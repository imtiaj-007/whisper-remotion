import { downloadToTmp } from '@/lib/awsS3'
import fs from 'fs'
import { NextResponse } from 'next/server'

interface ResultResponse {
    text: string
    segments: Array<{
        start: number
        end: number
        text: string
    }>
    language: string
}

export async function GET(
    _: Request,
    { params }: { params: Promise<{ file_key: string }> }
): Promise<NextResponse<ResultResponse | { error: string }>> {
    try {
        const { file_key } = await params
        const key = decodeURIComponent(file_key)
        const resultPath = `/tmp/${key}`

        if (!fs.existsSync(resultPath)) {
            await downloadToTmp(key, resultPath)
        }

        const result = fs.readFileSync(resultPath, 'utf8')
        const parsedResult: ResultResponse = JSON.parse(result)

        return NextResponse.json(parsedResult)
    } catch (error) {
        console.error('Failed to read result:', error)
        return NextResponse.json({ error: 'Failed to read result' }, { status: 500 })
    }
}
