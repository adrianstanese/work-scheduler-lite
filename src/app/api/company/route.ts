import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

// GET — Load company by id (requires PIN in query)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const pin = searchParams.get("pin");
  const member = searchParams.get("member");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const rows = await sql`SELECT * FROM companies WHERE id = ${id}`;
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const company = rows[0];

    // Member access — no PIN needed, returns read-only data
    if (member) {
      const data = company.data;
      return NextResponse.json({ 
        ok: true, 
        company: { ...data, pin: undefined },
        role: "member",
        memberId: member,
      });
    }

    // Admin access — PIN required
    if (!pin || company.pin !== pin) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, company: company.data, role: "admin" });
  } catch (e) {
    console.error("GET company error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — Create new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pin, ...data } = body;

    if (!id || !pin) return NextResponse.json({ error: "Missing id or pin" }, { status: 400 });

    await sql`
      INSERT INTO companies (id, pin, data, created_at, updated_at)
      VALUES (${id}, ${pin}, ${JSON.stringify(data)}, NOW(), NOW())
    `;

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("POST company error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT — Update company data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pin, ...data } = body;

    if (!id || !pin) return NextResponse.json({ error: "Missing id or pin" }, { status: 400 });

    // Verify PIN
    const rows = await sql`SELECT pin FROM companies WHERE id = ${id}`;
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rows[0].pin !== pin) return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });

    await sql`
      UPDATE companies SET data = ${JSON.stringify(data)}, updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT company error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
