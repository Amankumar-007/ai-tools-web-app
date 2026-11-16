import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ALL_CATEGORIES, getCategoryBySlug } from '@/lib/categories';
import { getFallbackTools } from '@/services/aiToolsDb';
import { getToolsForCategory } from '@/lib/categoryTools';
import CategoryDetailClient from './CategoryDetailClient';
import { createPageMetadata } from '@/metadata-utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) {
    return {
      title: 'Category Not Found | Tomato AI',
    };
  }

  return createPageMetadata({
    title: `${category.name} AI Tools - Best Tools Directory`,
    description: `Discover and compare top ${category.name} AI tools. ${category.description}`,
    keywords: [category.name, `${category.name} AI`, 'best AI tools', ...category.keywords],
    path: `/ai-tools/category/${category.slug}`,
  });
}

export async function generateStaticParams() {
  return ALL_CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const baseTools = getFallbackTools();
  const { tools } = getToolsForCategory(slug, baseTools);

  // Get 6 related categories
  const relatedCategories = ALL_CATEGORIES.filter((c) => c.slug !== slug).slice(0, 6);

  return (
    <CategoryDetailClient
      category={category}
      tools={tools}
      relatedCategories={relatedCategories}
    />
  );
}
