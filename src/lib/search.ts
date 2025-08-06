// lib/search.ts
import axios from 'axios'

export async function searchQuery(query: string) {
  const res = await axios.post(
    'https://google.serper.dev/search',
    { q: query },
    {
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY!,
        'Content-Type': 'application/json',
      },
    }
  )
  return res.data
}
