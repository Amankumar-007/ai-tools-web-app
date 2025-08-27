// app/page.tsx
"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ProjectCard } from "@/components/project-card";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 space-y-20">
      <Logo />
      {/* Hero Section */}
    <section className="flex flex-col md:flex-row items-center justify-between mb-12">
  <div>
    <h1 className="text-5xl font-extrabold mb-4 leading-tight">
      Hi, I'm <span className="text-blue-600">Aman</span> 👋
    </h1>
    <p className="text-xl text-gray-700 dark:text-gray-300 max-w-xl">
      MERN Stack Developer with a passion for building products that solve
      real problems. I enjoy turning ideas into interactive applications
      and sharing what I learn along the way.
    </p>
  </div>
  <Image
    src="/about.png"
    alt="Profile"
    width={140}
    height={140}
    className="rounded-full border-4 border-blue-500 shadow-lg mt-6 md:mt-0"
  />
</section>

{/* About */}
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
  className="mb-12"
>
  <h2 className="text-3xl font-bold mb-4">About Me</h2>
  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl">
    I'm a curious developer who thrives on solving problems with code. 
    My main focus is the <span className="font-semibold">MERN stack</span>,
    where I build full-stack applications that are fast, reliable, and user-friendly.  
    Beyond coding, I love exploring new tools, contributing to open source, and
    engaging with other developers on platforms like LinkedIn.  
    My goal is to keep growing as a developer while helping others learn along the way.
  </p>
</motion.section>

{/* Education */}
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
  className="mb-12"
>
  <h2 className="text-3xl font-bold mb-6">Education</h2>
  <div className="space-y-6">
    <div className="flex items-start space-x-4">
      <span className="text-2xl">🎓</span>
      <div>
        <h3 className="text-xl font-semibold">
          Bachelors in Computer Science
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Ongoing — Building a strong foundation in algorithms, databases, and software engineering.
        </p>
      </div>
    </div>
    <div className="flex items-start space-x-4">
      <span className="text-2xl">📚</span>
      <div>
        <h3 className="text-xl font-semibold">
          MERN Stack Development — Learn to Earn Program
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Hands-on program focused on modern web technologies like MongoDB, Express, React, and Node.js.
          Developed real-world projects that strengthened my backend and frontend expertise.
        </p>
      </div>
    </div>
  </div>
</motion.section>


      {/* LinkedIn Posts */}
     {/* LinkedIn Section */}
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  <h2 className="text-2xl font-bold mb-4">My LinkedIn</h2>

  <a
    href="https://www.linkedin.com/in/amankumarweb/"
    target="_blank"
    rel="noopener noreferrer"
    className="block"
  >
    <img
      src="/screenshot-of-linkidin.png" // <- save your screenshot in /public folder
      alt="Aman Kumar LinkedIn Profile"
      className="rounded-xl shadow-lg hover:opacity-90 transition"
    />
  </a>
</motion.section>

{/* Skills Section */}
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
  className="mb-10"
>
  <h2 className="text-2xl font-bold mb-6">Skills</h2>
  <div className="flex flex-wrap gap-3">
    {[
      "React",
      "Next.js",
      "Typescript",
      "Node.js",
      "Python",
      "Go",
      "Postgres",
      "Docker",
      "Kubernetes",
      "Java",
      "C++"
    ].map((skill, i) => (
      <span
        key={i}
        className="bg-black text-white px-4 py-2 rounded-lg text-base font-semibold shadow hover:scale-110 transition"
      >
        {skill}
      </span>
    ))}
  </div>
</motion.section>

{/* Projects Intro Section */}
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
  className="text-center py-12 mb-8"
>
  <span className="bg-black text-white px-5 py-2 rounded-lg text-base font-semibold">
    My Projects
  </span>
  <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-3">
    Check out my latest work
  </h2>
  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
    I've worked on a variety of projects, from simple websites to complex web
    applications. Here are a few of my favorites.
  </p>
</motion.section>

      {/* Projects Section (Reworked) */}
      <ProjectsSection />
    </main>
  );
}

// New projects section matching the requested structure
const categories = [
  "All",
  "Web Development",
  "Mobile App",
  "Full Stack",
  "AI Tools",
  "Restaurant",
  "SaaS",
];

const projects = [
  {
    id: "project-5",
    title: "AI Tools Platform",
    description:
      "Explore an innovative AI platform featuring a suite of intelligent tools designed to automate tasks, enhance productivity, and drive smarter decision-making.",
    category: "AI Tools",
    image: "/ai-tools/ai-tools.png",
    video: "/videos/ai-tools.mp4",
    year: "2025",
  },
  {
    id: "project-3",
    title: "Learning Management System (LMS)",
    description:
      "A comprehensive LMS that supports interactive learning, role-based access, detailed assessments, and certifications to empower educators and learners.",
    category: "Full Stack",
    image: "/lms/Screenshot 2025-05-27 131624.png",
    video: "/videos/lms.mp4",
    year: "2023",
  },
  {
    id: "project-2",
    title: "Real Estate Platform",
    description:
      "A feature-rich real estate platform offering seamless property browsing, advanced search filters, and secure transactions for buyers and sellers.",
    category: "Web Development",
    image: "/ss-3.png",
    video: "/videos/real-estate.mp4",
    year: "2023",
  },
  {
    id: "project-6",
    title: "Lenis Restaurant App",
    description:
      "A sleek restaurant application with Lenis smooth scrolling, online ordering, and reservation management for an enhanced dining experience.",
    category: "Restaurant",
    image: "/restro-1/restro-1.png",
    video: "/videos/restro-lenis.mp4",
    year: "2025",
  },
  {
    id: "project-1",
    title: "E-commerce Website",
    description:
      "A robust e-commerce platform featuring product catalogs, secure user authentication, and integrated payment gateways for smooth transactions.",
    category: "Web Development",
    image: "/ss-1.png",
    video: "/videos/ecommerce.mp4",
    year: "2023",
  },
  {
    id: "project-4",
    title: "Employee Management System",
    description:
      "An Uber-like ride-sharing app with real-time tracking, booking capabilities, and seamless payment integration.",
    category: "Mobile App",
    image: "/emp/Screenshot 2025-05-29 122724.png",
    video: "/videos/employee-mgmt.mp4",
    year: "2022",
  },
  {
    id: "project-7",
    title: "Lenis Restaurant Reservation System",
    description:
      "A user-friendly reservation system for restaurants, leveraging Lenis for smooth UI transitions and efficient booking management.",
    category: "Restaurant",
    image: "/restro-2/restro-2.png",
    video: "/videos/restro-reservation.mp4",
    year: "2025",
  },
  {
    id: "project-8",
    title: "Type-riser",
    description:
      "Multi-tenant platform with subscription billing and analytics.",
    category: "SaaS",
    image: "/type-riser/type-riser.png",
    video: "/videos/type-riser.mp4",
    year: "2025",
  },
];

const currentProject =
  projects.find((p) => p.id === "project-8") || projects.find((p) => p.id === "project-3");

function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [showProgress, setShowProgress] = useState(false);

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  return (
      <div className="container max-w-6xl py-20 px-4 md:px-6">
        {/* Currently Working On Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex items-center gap-6 bg-primary/10 rounded-xl p-6 shadow-lg"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex-shrink-0"
          >
            <Rocket className="w-10 h-10 text-primary animate-pulse" />
          </motion.div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">Currently Working On</h2>
            <p className="text-lg text-muted-foreground mb-2">
              {currentProject?.title}: {currentProject?.description}
            </p>
            <Button
              variant="secondary"
              onClick={() => setShowProgress(true)}
              className="mt-2"
            >
              View Work Progress
            </Button>
          </div>
        </motion.div>

        {/* Work Progress Modal (custom) */}
        {showProgress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary animate-bounce" />
                  Work In Progress
                </h3>
                <Button variant="outline" size="sm" onClick={() => setShowProgress(false)}>
                  Close
                </Button>
              </div>
              <p className="mb-4 text-muted-foreground">
                This project is actively being developed. New features, bug fixes, and improvements are being added regularly. Stay tuned for updates!
              </p>
              {/* Progress bar removed as requested */}
              <p className="text-sm text-gray-500">Estimated completion: Q3 2025</p>
              <p className="text-sm text-gray-500 mt-2 font-semibold">
                SaaS Project: Multi-tenant platform with subscription billing and analytics.
              </p>
            </motion.div>
          </div>
        )}

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className="transition-all duration-300"
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              dates={project.year}
              tags={[project.category]}
              image={project.image}
              video={project.video}
            />
          ))}
        </motion.div>
      </div>
  );
}
