// lib/searchImages.ts

export async function searchThumbnails(query: string) {
  const res = await fetch(
    `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query)}&api_key=${process.env.SERP_API_KEY}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch thumbnails");
  }

  const data = await res.json();
  const images = data?.images_results || [];

  return images.map((img: any) => ({
    thumbnail: img.thumbnail,
    link: img.original,
    title: img.title,
  }));
}
