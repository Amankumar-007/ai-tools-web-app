import React from "react"
import { motion } from "framer-motion"
import styles from './FlipLink.module.css'

const DURATION = 0.25
const STAGGER = 0.025

interface FlipLinkProps {
  children: string
  href: string
  className?: string
}

const FlipLink: React.FC<FlipLinkProps> = ({ children, href, className }) => {
  const [disableFlip, setDisableFlip] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mqHoverNone = window.matchMedia('(hover: none)')
    const mqMobile = window.matchMedia('(max-width: 640px)')

    const update = () => {
      setDisableFlip(mqHoverNone.matches || mqMobile.matches)
    }

    update()
    mqHoverNone.addEventListener('change', update)
    mqMobile.addEventListener('change', update)
    return () => {
      mqHoverNone.removeEventListener('change', update)
      mqMobile.removeEventListener('change', update)
    }
  }, [])

  if (disableFlip) {
    return (
      <a
        target="_blank"
        href={href}
        className={`
        ${styles.link}
        relative 
        block 
        overflow-hidden 
        whitespace-nowrap 
        text-2xl       /* Mobile base size */
        font-semibold 
        uppercase 
        sm:text-4xl    /* Tablet size */
        md:text-6xl    /* Desktop size */
        lg:text-7xl    /* Large desktop size */
        tracking-tight
        py-1
        px-2
        touch-manipulation
        ${className ?? ''}
      `}
        style={{
          lineHeight: 1,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {children}
      </a>
    )
  }

  return (
    <motion.a
      initial="initial"
      whileHover="hovered"
      target="_blank"
      href={href}
      className={`
        ${styles.link} 
        relative 
        block 
        overflow-hidden 
        whitespace-nowrap 
        text-2xl       /* Mobile base size */
        font-semibold 
        uppercase 
        sm:text-4xl    /* Tablet size */
        md:text-6xl    /* Desktop size */
        lg:text-7xl    /* Large desktop size */
        tracking-tight
        py-1
        px-2
        touch-manipulation
        ${className ?? ''}
      `}
      style={{
        lineHeight: 1,    // Adjusted line height for better mobile spacing
        WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
      }}
    >
      <div className="transform-gpu"> {/* Added for better performance */}
        {children.split("").map((l, i) => (
          <motion.span
            variants={{
              initial: {
                y: 0,
              },
              hovered: {
                y: "-100%",
              },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
            className="inline-block"
            key={i}
          >
            {l === " " ? "\u00A0" : l} {/* Handle spaces properly */}
          </motion.span>
        ))}
      </div>
      <div className="absolute inset-0 transform-gpu"> {/* Added for better performance */}
        {children.split("").map((l, i) => (
          <motion.span
            variants={{
              initial: {
                y: "100%",
              },
              hovered: {
                y: 0,
              },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
            className={`${styles.bottomLayer} inline-block`}
            key={i}
          >
            {l === " " ? "\u00A0" : l} {/* Handle spaces properly */}
          </motion.span>
        ))}
      </div>
    </motion.a>
  )
}

export default FlipLink