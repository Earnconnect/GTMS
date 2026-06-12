import type { CareerLevel } from "@/generated/prisma";

export interface CareerRequirement {
  tasksCompleted: number;
  accuracyScore: number;
  trustScore: number;
  label: string;
  description: string;
}

export const CAREER_REQUIREMENTS: Record<CareerLevel, CareerRequirement> = {
  DIGITAL_ASSOCIATE: {
    tasksCompleted: 0,
    accuracyScore: 0,
    trustScore: 0,
    label: "Digital Associate",
    description: "Entry-level workforce member",
  },
  CERTIFIED_REVIEWER: {
    tasksCompleted: 50,
    accuracyScore: 70,
    trustScore: 60,
    label: "Certified Reviewer",
    description: "Verified quality reviewer",
  },
  SENIOR_VERIFIER: {
    tasksCompleted: 200,
    accuracyScore: 80,
    trustScore: 72,
    label: "Senior Verifier",
    description: "Experienced verification specialist",
  },
  VERIFICATION_SPECIALIST: {
    tasksCompleted: 500,
    accuracyScore: 88,
    trustScore: 82,
    label: "Verification Specialist",
    description: "Expert-level verifier",
  },
  TEAM_SUPERVISOR: {
    tasksCompleted: 1000,
    accuracyScore: 92,
    trustScore: 90,
    label: "Team Supervisor",
    description: "Senior workforce leader",
  },
};

const LEVEL_ORDER: CareerLevel[] = [
  "DIGITAL_ASSOCIATE",
  "CERTIFIED_REVIEWER",
  "SENIOR_VERIFIER",
  "VERIFICATION_SPECIALIST",
  "TEAM_SUPERVISOR",
];

export function levelOrdinal(level: CareerLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

export function nextLevel(level: CareerLevel): CareerLevel | null {
  const idx = LEVEL_ORDER.indexOf(level);
  return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
}
