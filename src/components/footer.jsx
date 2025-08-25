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
    controls.start({ scale: [1, 1.05, 1], transition: { duration: 0.3 } })
  }

  const socialVariants = {
    hover: { scale: 1.2, rotate: 10, transition: { duration: 0.3 } },
    initial: { scale: 1, rotate: 0 }
  }

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="bg-gradient-to-b from-neutral-900 to-neutral-800 text-white px-6 py-12 relative overflow-hidden"
    >
      {/* Decorative background element */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.1),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Branding Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-orange-400 tracking-tight">Aman Kumar</h2>
          <p className="text-sm text-gray-300 mt-2 max-w-xs">
            Crafting innovative web solutions with passion and precision as a MERN Stack Developer.
          </p>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-orange-400">Stay Updated</h3>
          <p className="text-sm text-gray-300 mt-1 mb-3">
            Subscribe to my newsletter for the latest tech insights.
          </p>
          <div className="flex w-full max-w-sm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 text-sm text-gray-900 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <motion.button
              animate={controls}
              onClick={handleSubmit}
              className="px-4 py-2 bg-orange-400 text-neutral-900 rounded-r-md hover:bg-orange-500 transition"
            >
              <Send size={18} />
            </motion.button>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col items-center md:items-end"
        >
          <h3 className="text-lg font-semibold text-orange-400 mb-3">Connect</h3>
          <div className="flex items-center gap-6">
            <motion.div variants={socialVariants} whileHover="hover" initial="initial">
              <Link href="mailto:your@email.com" className="text-gray-300 hover:text-orange-400 transition">
                <Mail size={24} />
              </Link>
            </motion.div>
            <motion.div variants={socialVariants} whileHover="hover" initial="initial">
              <Link href="https://github.com/yourusername" target="_blank" className="text-gray-300 hover:text-orange-400 transition">
                <Github size={24} />
              </Link>
            </motion.div>
            <motion.div variants={socialVariants} whileHover="hover" initial="initial">
              <Link href="https://linkedin.com/in/yourusername" target="_blank" className="text-gray-300 hover:text-orange-400 transition">
                <Linkedin size={24} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-10 text-sm text-center text-gray-400"
      >
        © {new Date().getFullYear()} Aman Kumar. All rights reserved.
      </motion.div>
    </motion.footer>
  )
}