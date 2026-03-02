import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resolveUserRole } from "@/lib/roles";
import {
  combineDisplayName,
  deriveGradeLevelFromGraduationYear,
  normalizeEmail,
  normalizePhoneNumber,
  normalizeUsername,
} from "@/lib/studentProfile";

interface RegisterBody {
  koreanName?: string;
  englishName?: string;
  username?: string;
  email?: string;
  phone?: string;
  graduationYear?: string;
  password?: string;
  confirmPassword?: string;
}

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const koreanName = clean(body.koreanName);
  const englishName = clean(body.englishName);
  const username = normalizeUsername(clean(body.username));
  const email = normalizeEmail(clean(body.email));
  const phone = normalizePhoneNumber(body.phone);
  const graduationYear = clean(body.graduationYear);
  const password = body.password ?? "";
  const confirmPassword = body.confirmPassword ?? "";
  const displayName =
    koreanName && englishName ? combineDisplayName(koreanName, englishName) : undefined;

  if (!koreanName || !englishName || !username || !email || !phone || !graduationYear || password.length < 8) {
    return NextResponse.json(
      { error: "Korean name, English name, username, email, phone, graduating year, and password(8+) are required" },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
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
  const role = resolveUserRole({ email, username });

  const user = await prisma.user.create({
    data: {
      name: displayName,
      username,
      email,
      phone,
      role,
      passwordHash,
      personalPage: {
        create: {
          graduationYear,
          gradeLevel: deriveGradeLevelFromGraduationYear(graduationYear) || null,
        },
      },
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
