import { readJsonLimited } from '@/lib/security/body';
import { requireAdmin } from '@/lib/adminAuth';
import { getAdminDb } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAiToolsFromDb, upsertToolToDb, deleteToolFromDb } from '@/services/aiToolsDb';

export async function GET(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let tools = await getAiToolsFromDb();

    if (category && category !== 'all') {
      tools = tools.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      tools = tools.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, count: tools.length, tools });
  } catch {
    return NextResponse.json({ success: false, error: 'Request failed.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const parsed = await readJsonLimited<Record<string, unknown>>(request, 64 * 1024);
    if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.error }, { status: parsed.status });
    const body = parsed.data;
    const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
    const name = text(body.name, 120);
    const website = text(body.website, 500);
    let websiteOk = false;
    try { websiteOk = ['http:', 'https:'].includes(new URL(website).protocol); } catch { /* invalid */ }
    if (!name || !websiteOk) {
      return NextResponse.json(
        { success: false, error: 'A name and a valid http(s) website URL are required.' },
        { status: 400 }
      );
    }
    // Only these fields are accepted, each bounded; anything else in the body is ignored.
    const clean = {
      name,
      website,
      slug: text(body.slug, 120) || undefined,
      category: text(body.category, 80) || undefined,
      description: text(body.description, 2000) || undefined,
      logo: text(body.logo, 500).startsWith('https://') ? text(body.logo, 500) : undefined,
      pricing: (['Free', 'Freemium', 'Paid'] as const).find((option) => option === body.pricing),
    };

    const { data, error } = await upsertToolToDb(clean, getAdminDb());
    if (error) {
      return NextResponse.json({ success: false, error: 'Request failed.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Tool added/updated successfully', tool: data });
  } catch {
    return NextResponse.json({ success: false, error: 'Request failed.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (!slug && !id) {
      return NextResponse.json({ success: false, error: 'Tool id or slug required' }, { status: 400 });
    }

    const numericId = id ? Number.parseInt(id, 10) : NaN;
    if (id && !Number.isSafeInteger(numericId)) {
      return NextResponse.json({ success: false, error: 'Invalid tool id' }, { status: 400 });
    }
    const identifier = id ? numericId : slug!.slice(0, 120);
    const { success, error } = await deleteToolFromDb(identifier, getAdminDb());

    if (!success && error) {
      return NextResponse.json({ success: false, error: 'Request failed.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Tool deleted successfully' });
  } catch {
    return NextResponse.json({ success: false, error: 'Request failed.' }, { status: 500 });
  }
}
