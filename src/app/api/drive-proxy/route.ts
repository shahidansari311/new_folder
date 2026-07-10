import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return new NextResponse('Missing Google Drive ID', { status: 400 });

  // Use the undocumented export endpoint
  const driveUrl = `https://drive.google.com/uc?export=download&id=${id}`;

  try {
    const fetchHeaders: HeadersInit = {};
    const range = request.headers.get('range');
    if (range) {
      fetchHeaders['range'] = range;
    }

    const response = await fetch(driveUrl, {
      headers: fetchHeaders,
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error('Drive fetch failed:', response.status, response.statusText);
      return new NextResponse('Error fetching from Google Drive', { status: response.status });
    }

    // Pass along headers but strip out CORP and CSP which block embedding
    const headers = new Headers(response.headers);
    headers.delete('cross-origin-resource-policy');
    headers.delete('cross-origin-opener-policy');
    headers.delete('content-security-policy');
    headers.delete('x-content-security-policy');
    headers.set('access-control-allow-origin', '*');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
