// src/app/(routes)/about/page.tsx
"use client";

import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, memo } from "react";
import styles from "./page.module.scss";
import Logo from '../../../components/Logo';

// Use string paths for public images with next/image
const Pic1 = "/images/1.jpeg";
const Pic2 = "/images/2.jpeg";
const Pic3 = "/images/3.jpeg";
const Pic4 = "/images/4.jpeg";
const Pic5 = "/images/5.jpeg";
const Pic6 = "/images/6.jpeg";
const Pic7 = "/images/7.jpeg";
const Pic8 = "/images/8.jpeg";

// Memoized gallery card for performance
const GalleryCard = memo(function GalleryCard({ src, alt, idx }: { src: string; alt: string; idx: number }) {
  return (
    <article className={styles.cardSnap}>
      <div className={styles.cardMedia}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 25vw, 80vw"
          loading="lazy"
        />
      </div>
      <div className={styles.cardBody}>
        <h5>AI Tool {idx + 1}</h5>
        <p>
          Discover innovative AI tools for text, images, code, productivity, and automation. 
          Boost your workflow with the latest in artificial intelligence.
        </p>
      </div>
    </article>
  );
});

export default function About() {
  // Global scroll progress bar
  const { scrollYProgress: pageY } = useScroll();
  const progress = useSpring(pageY, { stiffness: 120, damping: 24, mass: 0.2 });

  // Scene 1 — Sticky zoom
  const s1Ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: s1P } = useScroll({
    target: s1Ref,
    offset: ["start start", "end end"],
  });
  const s1Scale = useSpring(useTransform(s1P, [0, 1], [1, 4]), {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
  });
  const s1Overlay = useTransform(s1P, [0, 1], [0, 0.25]);
  const s1TitleOpacity = useTransform(s1P, [0, 0.4, 0.8, 1], [1, 0.8, 0.3, 0]);
  const s1Radius = useTransform(s1P, [0, 0.7, 1], [20, 10, 0]);

  // Scene 2 — Split images slide-in + scale
  const s2Ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: s2P } = useScroll({
    target: s2Ref,
    offset: ["start start", "end end"],
  });
  const s2LeftX = useTransform(s2P, [0, 1], ["-40vw", "0vw"]);
  const s2RightX = useTransform(s2P, [0, 1], ["40vw", "0vw"]);
  const s2Scale = useSpring(useTransform(s2P, [0, 1], [0.9, 1.2]), {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
  });
  const s2Rotate = useTransform(s2P, [0, 1], [-3, 0]);
  const s2TitleOpacity = useTransform(s2P, [0, 0.35, 1], [1, 1, 0]);

  // Scene 3 — Crossfade between two full-bleed images
  const s3Ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: s3P } = useScroll({
    target: s3Ref,
    offset: ["start start", "end end"],
  });
  const s3AOpacity = useTransform(s3P, [0, 0.5, 1], [1, 0.35, 0]);
  const s3BOpacity = useTransform(s3P, [0, 0.5, 1], [0, 0.5, 1]);
  const s3AScale = useTransform(s3P, [0, 1], [1.08, 1]);
  const s3BScale = useTransform(s3P, [0, 1], [1.18, 1.02]);
  const s3TitleY = useTransform(s3P, [0, 1], [0, -40]);
  const s3TitleOpacity = useTransform(s3P, [0, 0.6, 1], [1, 1, 0]);

  // Scene 4 — Parallax collage (3 layers)
  const s4Ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: s4P } = useScroll({
    target: s4Ref,
    offset: ["start end", "end start"],
  });
  const s4Y1 = useTransform(s4P, [0, 1], [0, -140]);
  const s4Y2 = useTransform(s4P, [0, 1], [0, -80]);
  const s4Y3 = useTransform(s4P, [0, 1], [0, -200]);

  // Images array for gallery
  const galleryImages = [
    { src: Pic1, alt: "AI Chatbot" },
    { src: Pic2, alt: "Image Generator" },
    { src: Pic3, alt: "Text Summarizer" },
    { src: Pic4, alt: "Voice Assistant" },
    { src: Pic5, alt: "Code Generator" },
    { src: Pic6, alt: "Data Analyzer" },
    { src: Pic7, alt: "Content Creator" },
    { src: Pic8, alt: "Productivity Booster" },
  ];

  return (
    <>
    <Logo/>
    
    <main className={styles.page} style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <style>{`
        ::-webkit-scrollbar { display: none; }
        html, body { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
      {/* Progress bar */}
      <motion.div className={styles.progress} style={{ scaleX: progress }} />

      {/* Intro */}
      <section className={styles.intro}>
        <div className={styles.introInner}>
          <p className={styles.kicker}>AI Tools Platform</p>
          <h1 className={styles.headline}>
            Supercharge Your Workflow with <span>AI Tools</span>
          </h1>
          <p className={styles.subhead}>
            Discover, compare, and use the latest AI tools for text, images, code, productivity, and automation. 
            Our platform brings together the best artificial intelligence solutions to help you create, innovate, and save time.
          </p>
        </div>
      </section>

      {/* Scene 1 — Sticky zoom */}
      <div ref={s1Ref} className={`${styles.scene} ${styles.sceneZoom}`}>
        <div className={styles.sticky}>
          <motion.div style={{ scale: s1Scale }} className={styles.el}>
            <div className={styles.imageContainer} style={{ borderRadius: s1Radius as never }}>
              <Image
                src={Pic1}
                alt="AI Chatbot"
                fill
                priority
                sizes="(min-width: 1024px) 25vw, 80vw"
              />
            </div>
            <motion.div className={styles.overlay} style={{ opacity: s1Overlay }} />
            <motion.h2 className={styles.zoomTitle} style={{ opacity: s1TitleOpacity }}>
              AI That Empowers You
            </motion.h2>
          </motion.div>
        </div>
      </div>

      {/* Scene 2 — Split slide-in */}
      <div ref={s2Ref} className={`${styles.scene} ${styles.sceneSplit}`}>
        <div className={styles.sticky}>
          <motion.div className={styles.el} style={{ scale: s2Scale, rotate: s2Rotate }}>
            <motion.div className={`${styles.split} ${styles.left}`} style={{ x: s2LeftX }}>
              <Image src={Pic2} alt="Image Generator" fill />
            </motion.div>
            <motion.div className={`${styles.split} ${styles.right}`} style={{ x: s2RightX }}>
              <Image src={Pic3} alt="Text Summarizer" fill />
            </motion.div>
            <motion.div className={styles.centerBadge} style={{ opacity: s2TitleOpacity }}>
              Tools for Every AI Need
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scene 3 — Crossfade full-bleed */}
      <div ref={s3Ref} className={`${styles.scene} ${styles.sceneCrossfade}`}>
        <div className={styles.sticky}>
          <div className={styles.full}>
            <motion.div className={styles.fullImage} style={{ opacity: s3AOpacity, scale: s3AScale }}>
              <Image src={Pic4} alt="Voice Assistant" fill />
            </motion.div>
            <motion.div className={styles.fullImage} style={{ opacity: s3BOpacity, scale: s3BScale }}>
              <Image src={Pic5} alt="Code Generator" fill />
            </motion.div>
            <motion.h3 className={styles.crossTitle} style={{ y: s3TitleY, opacity: s3TitleOpacity }}>
              From Content Creation to Automation
            </motion.h3>
          </div>
        </div>
      </div>

      {/* Scene 4 — Parallax collage */}
      <section ref={s4Ref} className={styles.parallax}>
        <div className={styles.parallaxInner}>
          <motion.div className={`${styles.card} ${styles.cardTall}`} style={{ y: s4Y1 }}>
            <Image src={Pic6} alt="Data Analyzer" fill />
            <div className={styles.cardLabel}>Data Analysis</div>
          </motion.div>
          <motion.div className={`${styles.card} ${styles.cardWide}`} style={{ y: s4Y2 }}>
            <Image src={Pic7} alt="Content Creator" fill />
            <div className={styles.cardLabel}>Content Creation</div>
          </motion.div>
          <motion.div className={`${styles.card} ${styles.cardSquare}`} style={{ y: s4Y3 }}>
            <Image src={Pic8} alt="Productivity Booster" fill />
            <div className={styles.cardLabel}>Productivity</div>
          </motion.div>
        </div>
      </section>

      {/* Horizontal gallery with snap */}
      <section className={styles.scroller}>
        <div className={styles.scrollerHeader}>
          <h4>Featured AI Projects</h4>
          <span>Swipe/scroll horizontally</span>
        </div>
        <div className={styles.rail}>
          {galleryImages.map((img, i) => (
            <GalleryCard key={i} src={img.src} alt={img.alt} idx={i} />
          ))}
        </div>
      </section>

      {/* Outro */}
      <section className={styles.outro}>
        <div className={styles.outroInner}>
          <motion.h3
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Why Use Our AI Tools?
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          >
            Our AI platform helps you automate tasks, generate content, analyze data, and boost productivity. 
            Experience seamless integration, easy-to-use interfaces, and the latest advancements in artificial intelligence—all in one place.
          </motion.p>
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <span style={{ fontWeight: 600, color: "#ff6600", fontSize: 18 }}>
              Built by Aman Kumar
            </span>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}