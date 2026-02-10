import Image from 'next/image';

export default function AgentManagerSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24  rounded-3xl overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">

        {/* Left Side: Image/UI Preview */}
        <div className="w-full md:w-2/3 relative">
          <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <Image
              src="/side2.png" // Replace with your actual image path
              alt="Tomato AI UI Preview"
              width={1000}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Subtle background glow effect (optional) */}
          <div className="absolute -top-10 -left-10 w-64 h-64  blur-3xl rounded-full -z-10" />
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-1/3 space-y-6">
          <h2 className="text-2xl font-semibold ">
            Tomato AI
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Your intelligent assistant for managing multiple agents in parallel,
            across multiple workspaces.
          </p>
          <ul className="space-y-3 text-lg text-gray-600">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Manage multiple AI agents simultaneously</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Seamless workspace integration</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Real-time collaboration tools</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Advanced task automation</span>
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
}