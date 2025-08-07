"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Mail, Github, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-neutral-900 text-white px-6 py-8"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-orange-400">Aman Kumar</h2>
          <p className="text-sm text-gray-400 mt-1">
            MERN Stack Developer & Web Enthusiast
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <Link
            href="mailto:your@email.com"
            className="hover:text-orange-400 transition"
          >
            <Mail size={18} />
          </Link>
          <Link
            href="https://github.com/yourusername"
            target="_blank"
            className="hover:text-orange-400 transition"
          >
            <Github size={18} />
          </Link>
          <Link
            href="https://linkedin.com/in/yourusername"
            target="_blank"
            className="hover:text-orange-400 transition"
          >
            <Linkedin size={18} />
          </Link>
        </div>
      </div>

      <div className="mt-6 text-xs text-center text-gray-500">
        © {new Date().getFullYear()} Aman Kumar. All rights reserved.
      </div>
    </motion.footer>
  )
}
