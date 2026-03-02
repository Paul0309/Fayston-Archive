export function normalizeEmail(value?: string | null) {
  return value?.trim().toLowerCase() || null;
}

export function normalizeUsername(value?: string | null) {
  return value?.trim().toLowerCase() || null;
}

export function normalizePhoneNumber(value?: string | null) {
  const raw = value?.trim() || "";
  if (!raw) {
    return null;
  }

  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  return `${hasPlus ? "+" : ""}${digits}`;
}

export function combineDisplayName(koreanName: string, englishName: string) {
  return `${koreanName} / ${englishName}`;
}

export function getCurrentGraduationBaseYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 8 ? year + 1 : year;
}

export function deriveGradeLevelFromGraduationYear(graduationYear?: string | null, date = new Date()) {
  const parsed = Number.parseInt((graduationYear ?? "").trim(), 10);
  if (!Number.isFinite(parsed)) {
    return "";
  }

  const baseYear = getCurrentGraduationBaseYear(date);
  const grade = 12 - (parsed - baseYear);

  if (grade < 9) {
    return "Graduate";
  }

  if (grade > 12) {
    return "Pre-High School";
  }

  return `Grade ${grade}`;
}

export function getGraduationYearOptions(date = new Date(), count = 8) {
  const start = getCurrentGraduationBaseYear(date);
  return Array.from({ length: count }, (_, index) => String(start + index));
}
