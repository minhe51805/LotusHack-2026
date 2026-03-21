import { getSchools } from "@/lib/data";

export interface MatchSchoolCertificationInput {
  type: string;
  score: string;
}

export interface MatchedSchoolResult {
  name: string;
  country: string;
  location: string;
  match_percent: number;
  tuition_range: string;
  scholarship: boolean;
  fields: string[];
  gpa_required: string | null;
  certs_required: string;
  website: string;
  image_url: string;
  excerpt: string;
  reasons: string[];
}

export interface MatchSchoolsResult {
  matched: MatchedSchoolResult[];
  total_schools: number;
  criteria_used: {
    countries: string[];
    budget_usd: number | null;
    gpa?: string;
    certifications: string[];
    field_of_study: string | null;
  };
}

const COUNTRY_MAP: Record<string, string[]> = {
  "Úc": ["Australia"],
  "Canada": ["Canada"],
  "Anh": ["UK", "United Kingdom", "England"],
  "Mỹ": ["USA", "United States"],
  "New Zealand": ["New Zealand"],
  "Singapore": ["Singapore"],
  "Nhật Bản": ["Japan"],
  "Châu Âu": [
    "France",
    "Germany",
    "Netherlands",
    "Sweden",
    "Denmark",
    "Finland",
    "Norway",
    "Belgium",
    "Switzerland",
    "Italy",
    "Spain",
  ],
};

export function parseGpa(gpaStr: string): { value: number; scale: number } | null {
  if (!gpaStr) return null;
  const match = gpaStr.match(/^([\d.]+)\s*\/\s*([\d.]+)$/);
  if (!match) return null;
  return { value: parseFloat(match[1]), scale: parseFloat(match[2]) };
}

export function normalizeGpa(
  userGpa: { value: number; scale: number },
  schoolScale: number
): number {
  if (userGpa.scale === schoolScale) return userGpa.value;
  if (userGpa.scale === 10.0 && schoolScale === 4.0) {
    return (userGpa.value / 10.0) * 4.0;
  }
  if (userGpa.scale === 4.0 && schoolScale === 10.0) {
    return (userGpa.value / 4.0) * 10.0;
  }
  return userGpa.value;
}

export async function matchSchoolsForProfile(params: {
  gpa?: string;
  budget_usd?: number;
  countries?: string[];
  certifications?: MatchSchoolCertificationInput[];
  field_of_study?: string;
}): Promise<MatchSchoolsResult> {
  const { gpa, budget_usd, countries, certifications, field_of_study } = params;
  const schools = await getSchools();
  const userGpa = gpa ? parseGpa(gpa) : null;

  const targetCountries = new Set<string>();
  for (const country of countries ?? []) {
    const mapped = COUNTRY_MAP[country] ?? [country];
    for (const value of mapped) {
      targetCountries.add(value.toLowerCase());
    }
  }

  const certMap: Record<string, number> = {};
  for (const cert of certifications ?? []) {
    const score = parseFloat(cert.score);
    if (!Number.isNaN(score)) {
      certMap[cert.type.toUpperCase()] = score;
    }
  }

  const scored: MatchedSchoolResult[] = schools.map((school) => {
    let score = 0;
    let maxScore = 0;
    const reasons: string[] = [];

    if (targetCountries.size > 0) {
      maxScore += 30;
      if (targetCountries.has(school.country.toLowerCase())) {
        score += 30;
        reasons.push(`Đúng quốc gia mục tiêu (${school.country})`);
      }
    }

    const tuitionMin = school.tuition?.min_usd ?? school.cost?.tuition_usd_per_year;
    if (budget_usd && tuitionMin != null) {
      maxScore += 25;
      if (budget_usd >= tuitionMin) {
        score += 25;
        reasons.push("Học phí trong ngân sách");
      } else if (budget_usd >= tuitionMin * 0.8) {
        score += 12;
        reasons.push("Học phí gần ngân sách");
      }
    }

    const schoolGpa = school.gpa_required ?? null;
    if (userGpa && schoolGpa) {
      maxScore += 25;
      const normalized = normalizeGpa(userGpa, schoolGpa.scale);
      if (normalized >= schoolGpa.value) {
        score += 25;
        reasons.push("GPA đạt yêu cầu");
      } else if (normalized >= schoolGpa.value * 0.9) {
        score += 12;
        reasons.push("GPA gần đạt yêu cầu");
      }
    }

    const certsRequired = school.certs_required ?? [];
    if (certsRequired.length > 0 && Object.keys(certMap).length > 0) {
      maxScore += 20;
      const met = certsRequired.filter((requirement) => {
        const userScore = certMap[requirement.name.toUpperCase()];
        return userScore != null && userScore >= requirement.min_score;
      });
      if (met.length > 0) {
        score += 20;
        reasons.push(`Đạt yêu cầu ${met.map((item) => item.name).join(", ")}`);
      }
    } else if (certsRequired.length === 0 && Object.keys(certMap).length > 0) {
      score += 5;
      maxScore += 5;
    }

    if (field_of_study) {
      const query = field_of_study.toLowerCase();
      const fieldMatch =
        (school.fields ?? []).some((field) => field.toLowerCase().includes(query)) ||
        (school.programs ?? []).some((program) => program.toLowerCase().includes(query));

      maxScore += 10;
      if (fieldMatch) {
        score += 10;
        reasons.push(`Ngành ${field_of_study} có sẵn`);
      }
    }

    const matchPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;

    const tuition = school.tuition;
    const tuitionRange = tuition?.min_usd && tuition?.max_usd
      ? `$${tuition.min_usd.toLocaleString()} - $${tuition.max_usd.toLocaleString()}/năm`
      : tuition?.min_usd
        ? `từ $${tuition.min_usd.toLocaleString()}/năm`
        : school.cost?.tuition_usd_per_year
          ? `$${school.cost.tuition_usd_per_year.toLocaleString()}/năm`
          : "Liên hệ";

    const gpaRequired = school.gpa_required
      ? `${school.gpa_required.value}/${school.gpa_required.scale === 4 ? "4.0" : "10"}`
      : school.requirements?.gpa_min ?? null;

    const certsRequiredText = certsRequired.length > 0
      ? certsRequired.map((item) => `${item.name} >= ${item.min_score}`).join(", ")
      : "Không yêu cầu";

    return {
      name: school.name,
      country: school.country,
      location: school.location ?? "",
      match_percent: matchPercent,
      tuition_range: tuitionRange,
      scholarship: school.scholarship?.available ?? false,
      fields: (school.fields ?? school.programs ?? []).slice(0, 4),
      gpa_required: gpaRequired,
      certs_required: certsRequiredText,
      website: school.website ?? "",
      image_url: school.image_url ?? "",
      excerpt: school.excerpt ?? school.overview ?? "",
      reasons,
    };
  });

  scored.sort((a, b) => b.match_percent - a.match_percent);

  return {
    matched: scored.slice(0, 8),
    total_schools: schools.length,
    criteria_used: {
      countries: countries ?? [],
      budget_usd: budget_usd ?? null,
      gpa,
      certifications: Object.entries(certMap).map(([name, score]) => `${name} ${score}`),
      field_of_study: field_of_study ?? null,
    },
  };
}
