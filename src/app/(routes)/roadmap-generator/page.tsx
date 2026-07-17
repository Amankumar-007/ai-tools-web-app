import { redirect } from 'next/navigation'

// This route was never built out (no real page content ever shipped here).
// Redirect any bookmarked/previously-crawled links to the working equivalent.
export default function RoadmapGeneratorRedirect() {
  redirect('/roadmap')
}
