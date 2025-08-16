'use client';
import Link from 'next/link';

const categories = [
  { name: 'AI Image Tools', count: 303 },
  { name: 'AI Video Tools', count: 173 },
  { name: 'AI Audio Generators', count: 145 },
  { name: 'AI Business Tools', count: 1527 },
  { name: 'Misc AI Tools', count: 592 },
  { name: 'AI Code Tools', count: 167 },
  { name: 'Automation Tools', count: 455 },
  { name: 'AI Productivity Tools', count: 607 },
  { name: 'AI Art Generators', count: 118 },
  { name: 'AI Text Generators', count: 302 },
];

export default function Categories() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold text-center mb-6">AI Tool Categories</h2>
      <p className="text-center  mb-8">We&apos;ve categorized 2461 AI tools into 10 categories.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/ai-tools?category=${encodeURIComponent(category.name.split(' ')[0])}`}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
            <p className="text-gray-600">{category.count} Tools</p>
          </Link>
        ))}
      </div>
    </div>
  );
}