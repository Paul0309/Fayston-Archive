import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

interface RegisterBody {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
}

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const name = clean(body.name);
  const username = clean(body.username)?.toLowerCase();
  const email = clean(body.email)?.toLowerCase();
  const phone = clean(body.phone)?.toLowerCase();
  const password = body.password ?? "";

  if (!name || !username || !email || !phone || password.length < 8) {
    return NextResponse.json(
      { error: "name, username, email, phone, and password(8+) are required" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }, { phone }],
    },
    select: {
      username: true,
      email: true,
      phone: true,
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "username, email, or phone already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      phone,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
