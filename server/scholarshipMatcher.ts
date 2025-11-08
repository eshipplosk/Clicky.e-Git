import type { StudentProfile, Scholarship } from "@shared/schema";

export interface ScholarshipMatch {
  scholarship: Scholarship;
  matchScore: number;
  matchReasons: string[];
  missingRequirements: string[];
}

/**
 * Calculate how well a scholarship matches a student's profile
 * Returns a score from 0-100 and reasons for the match
 */
export function matchScholarship(
  profile: StudentProfile,
  scholarship: Scholarship
): ScholarshipMatch {
  let score = 0;
  const matchReasons: string[] = [];
  const missingRequirements: string[] = [];
  const maxScore = 100;

  // GPA matching (20 points)
  if (scholarship.minGPA) {
    const studentGPA = profile.gpa ? parseFloat(profile.gpa) : 0;
    const minGPA = parseFloat(scholarship.minGPA);
    
    if (studentGPA >= minGPA) {
      score += 20;
      matchReasons.push(`Your GPA (${studentGPA}) meets the requirement (${minGPA})`);
    } else {
      missingRequirements.push(`GPA requirement: ${minGPA} (you have ${studentGPA})`);
    }
  } else {
    score += 10; // Partial credit if no GPA requirement
  }

  // Test scores (15 points total, divided among available tests)
  const testScores = [
    { min: scholarship.minACT, student: profile.actScore, name: 'ACT' },
    { min: scholarship.minSAT, student: profile.satScore, name: 'SAT' },
    { min: scholarship.minLSAT, student: profile.lsatScore, name: 'LSAT' },
    { min: scholarship.minGRE, student: profile.greScore, name: 'GRE' }
  ].filter(test => test.min !== null);

  if (testScores.length > 0) {
    const pointsPerTest = 15 / testScores.length;
    testScores.forEach(test => {
      if (test.student && test.student >= test.min!) {
        score += pointsPerTest;
        matchReasons.push(`${test.name} score meets requirement (${test.student} >= ${test.min})`);
      } else if (test.min) {
        missingRequirements.push(`${test.name} score: ${test.min} required`);
      }
    });
  } else {
    score += 7.5; // Partial credit if no test requirements
  }

  // Major matching (15 points)
  if (scholarship.majorRequirements && scholarship.majorRequirements.length > 0) {
    const majorMatch = profile.major && scholarship.majorRequirements.some(
      req => profile.major?.toLowerCase().includes(req.toLowerCase())
    );
    
    if (majorMatch) {
      score += 15;
      matchReasons.push(`Your major matches scholarship requirements`);
    } else {
      missingRequirements.push(`Major must be one of: ${scholarship.majorRequirements.join(', ')}`);
    }
  } else {
    score += 7.5; // Partial credit if no major requirement
  }

  // Demographic requirements (20 points total)
  let demographicPoints = 0;
  let demographicTotal = 0;

  // Ethnicity
  if (scholarship.ethnicityRequirements && scholarship.ethnicityRequirements.length > 0) {
    demographicTotal += 7;
    if (profile.ethnicity && scholarship.ethnicityRequirements.includes(profile.ethnicity)) {
      demographicPoints += 7;
      matchReasons.push(`Ethnicity requirement met`);
    } else {
      missingRequirements.push(`Ethnicity must be one of: ${scholarship.ethnicityRequirements.join(', ')}`);
    }
  }

  // First generation
  if (scholarship.requiresFirstGen) {
    demographicTotal += 7;
    if (profile.firstGeneration) {
      demographicPoints += 7;
      matchReasons.push(`First-generation student requirement met`);
    } else {
      missingRequirements.push(`Must be a first-generation college student`);
    }
  }

  // Veteran
  if (scholarship.requiresVeteran) {
    demographicTotal += 7;
    if (profile.veteran) {
      demographicPoints += 7;
      matchReasons.push(`Veteran requirement met`);
    } else {
      missingRequirements.push(`Must be a veteran`);
    }
  }

  // Disability
  if (scholarship.requiresDisability) {
    demographicTotal += 7;
    if (profile.disability) {
      demographicPoints += 7;
      matchReasons.push(`Disability requirement met`);
    } else {
      missingRequirements.push(`Must have a documented disability`);
    }
  }

  // Add demographic points (scale to 20 max)
  if (demographicTotal > 0) {
    score += (demographicPoints / demographicTotal) * 20;
  } else {
    score += 10; // Partial credit if no demographic requirements
  }

  // Skills matching (10 points)
  if (scholarship.skillRequirements && scholarship.skillRequirements.length > 0) {
    const matchingSkills = profile.skills?.filter(skill =>
      scholarship.skillRequirements?.some(req => 
        skill.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(skill.toLowerCase())
      )
    ) || [];

    if (matchingSkills.length > 0) {
      const skillRatio = matchingSkills.length / scholarship.skillRequirements.length;
      score += skillRatio * 10;
      matchReasons.push(`${matchingSkills.length} matching skills found`);
    } else {
      missingRequirements.push(`Required skills: ${scholarship.skillRequirements.join(', ')}`);
    }
  } else {
    score += 5; // Partial credit if no skill requirements
  }

  // Volunteer hours (10 points)
  if (scholarship.minVolunteerHours) {
    if (profile.volunteerHours && profile.volunteerHours >= scholarship.minVolunteerHours) {
      score += 10;
      matchReasons.push(`Volunteer hours requirement met (${profile.volunteerHours} >= ${scholarship.minVolunteerHours})`);
    } else {
      missingRequirements.push(`Minimum volunteer hours: ${scholarship.minVolunteerHours}`);
    }
  } else {
    score += 5; // Partial credit if no volunteer requirement
  }

  // Financial need bonus (10 points)
  if (profile.financialNeed === 'high' || profile.financialNeed === 'medium') {
    score += 10;
    matchReasons.push(`Financial need aligns with scholarship goals`);
  }

  return {
    scholarship,
    matchScore: Math.min(Math.round(score), maxScore),
    matchReasons,
    missingRequirements
  };
}

/**
 * Find and rank scholarships for a student profile
 */
export function findMatchingScholarships(
  profile: StudentProfile,
  scholarships: Scholarship[],
  minScore: number = 50
): ScholarshipMatch[] {
  return scholarships
    .map(scholarship => matchScholarship(profile, scholarship))
    .filter(match => match.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore);
}
