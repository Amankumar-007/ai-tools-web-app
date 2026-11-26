'use client'

import { SiLinkedin } from 'react-icons/si'

import { isAllowedMediaUrl, parseLinkedInUrl, safeFileName } from '@/lib/daily-tools/linkedin'
import SocialVideoDownloader, { type PlatformConfig } from './SocialVideoDownloader'

const CONFIG: PlatformConfig = {
  idPrefix: 'li',
  endpoint: '/api/linkedin-video',
  subject: 'LinkedIn post',
  placeholder: 'https://www.linkedin.com/posts/…',
  brandColor: '#0A66C2',
  Icon: SiLinkedin,
  fallbackTitle: 'LinkedIn video',
  parse: parseLinkedInUrl,
  isAllowedMediaUrl,
  fileName: (title, label) => safeFileName(title, label),
  help: <>On LinkedIn, tap the three dots (⋯) on the post, choose <strong>Copy link to post</strong>, and paste it here. Works with public posts that have an uploaded video.</>,
  note: <>Only download videos you made, or that you have permission to save. LinkedIn&apos;s terms limit downloading other people&apos;s content, and creators own their videos: do not re-post a video as your own. This tool reads only public posts, never signs in, and the video downloads directly from LinkedIn to your device. It is not affiliated with LinkedIn. If a post is private, is an image or document, or LinkedIn blocks the request, it cannot be fetched.</>,
}

export default function LinkedInDownloader() {
  return <SocialVideoDownloader cfg={CONFIG} />
}
