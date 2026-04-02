import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const companySlug = (formData.get('companySlug') as string) ?? 'general';

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type.' }, { status: 400 });
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 5 MB).' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', companySlug);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const bytes = await file.arrayBuffer();
  fs.writeFileSync(path.join(uploadDir, safeName), Buffer.from(bytes));

  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = req.headers.get('host');
  const finalHost = forwardedHost || host || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || (finalHost.includes('localhost') ? 'http' : 'https');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${finalHost}`;

  return NextResponse.json({ url: `${baseUrl}/uploads/${companySlug}/${safeName}` });
}
