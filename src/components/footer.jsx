"use client"

import { motion, useAnimation } from "framer-motion"
import Link from "next/link"
import { Mail, Github, Linkedin, Send } from "lucide-react"
import { useState } from "react"

export default function Footer() {
  const [email, setEmail] = useState("")
  const controls = useAnimation()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add newsletter subscription logic here
    setEmail("")
    controls.start({ scale: [1, 1.1, 1], transition: { duration: 0.3, ease: "easeInOut" } })
  }

  const socialVariants = {
    hover: { scale: 1.2, transition: { duration: 0.2, ease: "easeOut" } },
    initial: { scale: 1 }
  }

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-neutral-800 text-neutral-200 px-6 py-10"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Branding Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-amber-300">Aman Kumar</h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-xs">
            MERN Stack Developer delivering innovative and efficient web solutions.
          </p>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h3 className="text-lg font-medium text-amber-300">Newsletter</h3>
          <p className="text-sm text-neutral-400 mt-1 mb-3">
            Subscribe for updates on web development trends.
          </p>
          <div className="flex w-full max-w-sm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-3 py-2 text-sm text-neutral-900 bg-neutral-100 rounded-l-md focus:outline-none focus:ring-1 focus:ring-amber-300 transition-all duration-200"
            />
            <motion.button
              animate={controls}
              onClick={handleSubmit}
              className="px-4 py-2 bg-amber-300 text-neutral-900 rounded-r-md hover:bg-amber-400 transition-all duration-200"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col items-center md:items-end"
        >
          <h3 className="text-lg font-medium text-amber-300 mb-2">Connect</h3>
          <div className="flex items-center gap-6">
            <motion.div variants={socialVariants} whileHover="hover" initial="initial">
              <Link href="mailto:your@email.com" className="text-neutral-400 hover:text-amber-300 transition-all duration-200">
                <Mail size={20} />
              </Link>
            </motion.div>
            <motion.div variants={socialVariants} whileHover="hover" initial="initial">
              <Link href="https://github.com/yourusername" target="_blank" className="text-neutral-400 hover:text-amber-300 transition-all duration-200">
                <Github size={20} />
              </Link>
            </motion.div>
            <motion.div variants={socialVariants} whileHover="hover" initial="initial">
              <Link href="https://linkedin.com/in/yourusername" target="_blank" className="text-neutral-400 hover:text-amber-300 transition-all duration-200">
                <Linkedin size={20} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-10 text-sm text-center text-neutral-400"
      >
        © {new Date().getFullYear()} Aman Kumar. All Rights Reserved.
      </motion.div>
    </motion.footer>
  )
}