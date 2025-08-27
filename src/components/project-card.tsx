import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly string[];
  link?: string;
  image?: string;
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  link,
  image,
  video,
  links,
  className,
}: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!cardRef.current) return;
    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    observer.observe(cardRef.current);
    return () => {
      observer && observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (inView && video && !videoSrc) {
      // set actual src only when in view
      setVideoSrc(video);
    }
  }, [inView, video, videoSrc]);
  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden border bg-gradient-to-b from-background to-background/70",
        "hover:border-primary/40 hover:shadow-xl transition-all duration-300 ease-out",
        className
      )}
    >
      <div className="relative" ref={cardRef}>
        <Link href={href || "#"} className="block cursor-pointer">
          <div className="relative overflow-hidden">
            {video && (
              <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                poster={image}
                className="pointer-events-none mx-auto h-44 w-full object-cover object-top rounded-b-none"
              />
            )}
            {image && (
              <Image
                src={image}
                alt={title}
                width={800}
                height={450}
                className="h-44 w-full object-cover object-top rounded-b-none"
                loading="lazy"
                priority={false}
              />
            )}
            {/* subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {/* year badge */}
            {dates && (
              <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                {dates}
              </span>
            )}
          </div>
        </Link>
      </div>
      <CardHeader className="px-3 pt-3">
        <div className="space-y-2">
          <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <div className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground/90 dark:prose-invert line-clamp-3">
            <Markdown>{description}</Markdown>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col px-3 pb-3">
        {tags && tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {tags?.map((tag) => (
              <Badge
                className="px-2 py-[2px] text-[10px] bg-primary/10 text-primary border border-primary/20"
                variant="secondary"
                key={tag}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-3 pb-3">
        {links && links.length > 0 && (
          <div className="flex flex-row flex-wrap items-start gap-2">
            {links?.map((link, idx) => (
              <Link href={link?.href} key={idx} target="_blank" className="focus:outline-none focus:ring-2 focus:ring-primary/40 rounded">
                <Badge key={idx} className="flex gap-2 px-2.5 py-1 text-[10px] bg-secondary hover:bg-secondary/80 transition-colors">
                  {link.icon}
                  {link.type}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardFooter>
      {/* glow ring on hover */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-xl opacity-0 blur-xl transition group-hover:opacity-40 bg-[radial-gradient(200px_120px_at_var(--x,50%)_0%,theme(colors.primary/25),transparent)]" />
    </Card>
  );
}
