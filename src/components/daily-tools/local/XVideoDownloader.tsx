'use client'

import { SiX } from 'react-icons/si'

import { isAllowedXMediaUrl, parseXUrl, safeXFileName } from '@/lib/daily-tools/xvideo'
import SocialVideoDownloader, { type PlatformConfig } from './SocialVideoDownloader'

const CONFIG: PlatformConfig = {
  idPrefix: 'x',
  endpoint: '/api/x-video',
  subject: 'X (Twitter) post',
  placeholder: 'https://x.com/username/status/…',
  brandColor: '#111827',
  Icon: SiX,
  fallbackTitle: 'X video',
  parse: (input) => { const r = parseXUrl(input); return r.ok ? { ok: true, url: r.url } : r },
  isAllowedMediaUrl: isAllowedXMediaUrl,
  fileName: safeXFileName,
  help: <>On X, tap <strong>Share</strong> under the post, choose <strong>Copy link</strong>, and paste it here. Works with public posts that have a video or GIF. x.com and twitter.com links both work.</>,
  note: <>Only download videos you made, or that you have permission to save. X&apos;s terms limit downloading other people&apos;s content, and creators own their videos: do not re-post a video as your own. This tool reads only public posts, never signs in, and the video downloads directly from X to your device. It is not affiliated with X Corp. Posts from private accounts, deleted posts, and posts where the video belongs to a quoted or reposted post cannot be fetched.</>,
}

export default function XVideoDownloader() {
  return <SocialVideoDownloader cfg={CONFIG} />
}
