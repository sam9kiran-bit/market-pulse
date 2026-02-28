"use server"

export async function fetchNewsServer(apiKey: string) {
  try {
    const res = await fetch(`https://gnews.io/api/v4/top-headlines?category=business&country=in&apikey=${apiKey}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to fetch news data");
    return await res.json();
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function fetchGeminiServer(prompt: string, apiKey: string) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
        cache: 'no-store'
      }
    );
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch (error: any) {
    return { error: error.message };
  }
}
