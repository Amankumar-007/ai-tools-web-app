import { NextResponse } from 'next/server';
import { getAiToolsFromDb, upsertToolToDb, deleteToolFromDb } from '@/services/aiToolsDb';

export async function GET(request: Request) {
  try {
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.website) {
      return NextResponse.json(
        { success: false, error: 'Name and Website URL are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await upsertToolToDb(body);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Tool added/updated successfully', tool: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (!slug && !id) {
      return NextResponse.json({ success: false, error: 'Tool id or slug required' }, { status: 400 });
    }

    const identifier = id ? parseInt(id, 10) : slug!;
    const { success, error } = await deleteToolFromDb(identifier);

    if (!success && error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Tool deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
