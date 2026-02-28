import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?category=business&country=in&apikey=${key}`
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from GNews' }, { status: 500 });
  }
}
