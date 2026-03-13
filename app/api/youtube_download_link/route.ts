import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const formData = new FormData();
        formData.append('url', url);

        const response = await fetch('https://app.ytdown.to/proxy.php', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Proxy request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.api && data.api.status === 'ok') {
            return NextResponse.json({ 
                previewUrl: data.api.previewUrl,
                thumbnail: data.api.imagePreviewUrl,
                title: data.api.title
            });
        } else {
            return NextResponse.json({ error: data.api?.message || 'Failed to process YouTube link' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error in youtube_download_link API:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
