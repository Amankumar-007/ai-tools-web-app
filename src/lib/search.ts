// lib/search.ts

export async function searchQuery(query: string) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY as string,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Search API error ${res.status}: ${text}`)
  }

  return res.json()
}
