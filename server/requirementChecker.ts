import type { Scholarship, StudentProfile } from "@shared/schema";

export type RequirementStatus = 'met' | 'missing' | 'not_eligible';

export interface RequirementCheck {
  requirement: string;
  status: RequirementStatus;
  studentValue?: string | number | boolean | null;
  requiredValue?: string | number | boolean | null;
  details?: string;
}

export function compareRequirements(
  scholarship: Scholarship,
  profile: StudentProfile | null
): RequirementCheck[] {
  const checks: RequirementCheck[] = [];

  // If no profile, everything is missing
  if (!profile) {
    return [
      {
        requirement: 'Complete Profile',
        status: 'missing',
        details: 'Please complete your student profile to see eligibility details'
      }
    ];
  }

  // GPA Requirement
  if (scholarship.minGPA) {
    const profileGPA = profile.gpa ? Number(profile.gpa) : null;
    const requiredGPA = Number(scholarship.minGPA);
    
    if (profileGPA === null) {
      checks.push({
        requirement: 'Minimum GPA',
        status: 'missing',
        requiredValue: requiredGPA,
        details: `Requires ${requiredGPA} GPA - please add your GPA to your profile`
      });
    } else if (profileGPA >= requiredGPA) {
      checks.push({
        requirement: 'Minimum GPA',
        status: 'met',
        studentValue: profileGPA,
        requiredValue: requiredGPA,
        details: `Your GPA (${profileGPA}) meets the minimum requirement of ${requiredGPA}`
      });
    } else {
      checks.push({
        requirement: 'Minimum GPA',
        status: 'not_eligible',
        studentValue: profileGPA,
        requiredValue: requiredGPA,
        details: `Your GPA (${profileGPA}) does not meet the minimum requirement of ${requiredGPA}`
      });
    }
  }

  // Test Score Requirements
  if (scholarship.minACT || scholarship.minSAT || scholarship.minLSAT || scholarship.minGRE) {
    const hasAnyScore = profile.actScore || profile.satScore || profile.lsatScore || profile.greScore;
    
    if (scholarship.minACT) {
      if (!profile.actScore) {
        checks.push({
          requirement: 'ACT Score',
          status: 'missing',
          requiredValue: scholarship.minACT,
          details: `Requires ACT score of ${scholarship.minACT} or higher`
        });
      } else if (profile.actScore >= scholarship.minACT) {
        checks.push({
          requirement: 'ACT Score',
          status: 'met',
          studentValue: profile.actScore,
          requiredValue: scholarship.minACT,
          details: `Your ACT score (${profile.actScore}) meets the minimum requirement of ${scholarship.minACT}`
        });
      } else {
        checks.push({
          requirement: 'ACT Score',
          status: 'not_eligible',
          studentValue: profile.actScore,
          requiredValue: scholarship.minACT,
          details: `Your ACT score (${profile.actScore}) does not meet the minimum requirement of ${scholarship.minACT}`
        });
      }
    }

    if (scholarship.minSAT) {
      if (!profile.satScore) {
        checks.push({
          requirement: 'SAT Score',
          status: 'missing',
          requiredValue: scholarship.minSAT,
          details: `Requires SAT score of ${scholarship.minSAT} or higher`
        });
      } else if (profile.satScore >= scholarship.minSAT) {
        checks.push({
          requirement: 'SAT Score',
          status: 'met',
          studentValue: profile.satScore,
          requiredValue: scholarship.minSAT,
          details: `Your SAT score (${profile.satScore}) meets the minimum requirement of ${scholarship.minSAT}`
        });
      } else {
        checks.push({
          requirement: 'SAT Score',
          status: 'not_eligible',
          studentValue: profile.satScore,
          requiredValue: scholarship.minSAT,
          details: `Your SAT score (${profile.satScore}) does not meet the minimum requirement of ${scholarship.minSAT}`
        });
      }
    }

    if (scholarship.minLSAT) {
      if (!profile.lsatScore) {
        checks.push({
          requirement: 'LSAT Score',
          status: 'missing',
          requiredValue: scholarship.minLSAT,
          details: `Requires LSAT score of ${scholarship.minLSAT} or higher`
        });
      } else if (profile.lsatScore >= scholarship.minLSAT) {
        checks.push({
          requirement: 'LSAT Score',
          status: 'met',
          studentValue: profile.lsatScore,
          requiredValue: scholarship.minLSAT,
          details: `Your LSAT score (${profile.lsatScore}) meets the minimum requirement of ${scholarship.minLSAT}`
        });
      } else {
        checks.push({
          requirement: 'LSAT Score',
          status: 'not_eligible',
          studentValue: profile.lsatScore,
          requiredValue: scholarship.minLSAT,
          details: `Your LSAT score (${profile.lsatScore}) does not meet the minimum requirement of ${scholarship.minLSAT}`
        });
      }
    }

    if (scholarship.minGRE) {
      if (!profile.greScore) {
        checks.push({
          requirement: 'GRE Score',
          status: 'missing',
          requiredValue: scholarship.minGRE,
          details: `Requires GRE score of ${scholarship.minGRE} or higher`
        });
      } else if (profile.greScore >= scholarship.minGRE) {
        checks.push({
          requirement: 'GRE Score',
          status: 'met',
          studentValue: profile.greScore,
          requiredValue: scholarship.minGRE,
          details: `Your GRE score (${profile.greScore}) meets the minimum requirement of ${scholarship.minGRE}`
        });
      } else {
        checks.push({
          requirement: 'GRE Score',
          status: 'not_eligible',
          studentValue: profile.greScore,
          requiredValue: scholarship.minGRE,
          details: `Your GRE score (${profile.greScore}) does not meet the minimum requirement of ${scholarship.minGRE}`
        });
      }
    }
  }

  // Major Requirements
  if (scholarship.majorRequirements && scholarship.majorRequirements.length > 0) {
    if (!profile.major) {
      checks.push({
        requirement: 'Major',
        status: 'missing',
        requiredValue: scholarship.majorRequirements.join(', '),
        details: `Requires one of the following majors: ${scholarship.majorRequirements.join(', ')}`
      });
    } else if (scholarship.majorRequirements.includes(profile.major)) {
      checks.push({
        requirement: 'Major',
        status: 'met',
        studentValue: profile.major,
        requiredValue: scholarship.majorRequirements.join(', '),
        details: `Your major (${profile.major}) is eligible`
      });
    } else {
      checks.push({
        requirement: 'Major',
        status: 'not_eligible',
        studentValue: profile.major,
        requiredValue: scholarship.majorRequirements.join(', '),
        details: `Your major (${profile.major}) does not match required majors: ${scholarship.majorRequirements.join(', ')}`
      });
    }
  }

  // Ethnicity Requirements
  if (scholarship.ethnicityRequirements && scholarship.ethnicityRequirements.length > 0) {
    if (!profile.ethnicity) {
      checks.push({
        requirement: 'Ethnicity',
        status: 'missing',
        requiredValue: scholarship.ethnicityRequirements.join(', '),
        details: `Requires ethnicity: ${scholarship.ethnicityRequirements.join(' or ')}`
      });
    } else if (scholarship.ethnicityRequirements.includes(profile.ethnicity)) {
      checks.push({
        requirement: 'Ethnicity',
        status: 'met',
        studentValue: profile.ethnicity,
        requiredValue: scholarship.ethnicityRequirements.join(', '),
        details: `Your ethnicity (${profile.ethnicity}) is eligible`
      });
    } else {
      checks.push({
        requirement: 'Ethnicity',
        status: 'not_eligible',
        studentValue: profile.ethnicity,
        requiredValue: scholarship.ethnicityRequirements.join(', '),
        details: `Your ethnicity (${profile.ethnicity}) does not match required: ${scholarship.ethnicityRequirements.join(' or ')}`
      });
    }
  }

  // First Generation Requirement
  if (scholarship.requiresFirstGen) {
    if (profile.firstGeneration) {
      checks.push({
        requirement: 'First Generation Student',
        status: 'met',
        studentValue: true,
        requiredValue: true,
        details: 'You are a first-generation college student'
      });
    } else {
      checks.push({
        requirement: 'First Generation Student',
        status: 'not_eligible',
        studentValue: false,
        requiredValue: true,
        details: 'This scholarship is only for first-generation college students'
      });
    }
  }

  // Veteran Requirement
  if (scholarship.requiresVeteran) {
    if (profile.veteran) {
      checks.push({
        requirement: 'Veteran Status',
        status: 'met',
        studentValue: true,
        requiredValue: true,
        details: 'You are a veteran or active military member'
      });
    } else {
      checks.push({
        requirement: 'Veteran Status',
        status: 'not_eligible',
        studentValue: false,
        requiredValue: true,
        details: 'This scholarship is only for veterans or active military members'
      });
    }
  }

  // Disability Requirement
  if (scholarship.requiresDisability) {
    if (profile.disability) {
      checks.push({
        requirement: 'Disability Status',
        status: 'met',
        studentValue: true,
        requiredValue: true,
        details: 'You have a documented disability'
      });
    } else {
      checks.push({
        requirement: 'Disability Status',
        status: 'not_eligible',
        studentValue: false,
        requiredValue: true,
        details: 'This scholarship is only for students with documented disabilities'
      });
    }
  }

  // Skill Requirements
  if (scholarship.skillRequirements && scholarship.skillRequirements.length > 0) {
    const profileSkills = profile.skills || [];
    const matchingSkills = scholarship.skillRequirements.filter(skill => 
      profileSkills.includes(skill)
    );
    
    if (profileSkills.length === 0) {
      checks.push({
        requirement: 'Required Skills',
        status: 'missing',
        requiredValue: scholarship.skillRequirements.join(', '),
        details: `Requires at least one of: ${scholarship.skillRequirements.join(', ')}`
      });
    } else if (matchingSkills.length > 0) {
      checks.push({
        requirement: 'Required Skills',
        status: 'met',
        studentValue: matchingSkills.join(', '),
        requiredValue: scholarship.skillRequirements.join(', '),
        details: `You have matching skills: ${matchingSkills.join(', ')}`
      });
    } else {
      checks.push({
        requirement: 'Required Skills',
        status: 'not_eligible',
        studentValue: profileSkills.join(', '),
        requiredValue: scholarship.skillRequirements.join(', '),
        details: `Your skills (${profileSkills.join(', ')}) do not match required: ${scholarship.skillRequirements.join(', ')}`
      });
    }
  }

  // Volunteer Hours Requirement
  if (scholarship.minVolunteerHours) {
    const profileHours = profile.volunteerHours || 0;
    
    if (!profile.volunteerHours) {
      checks.push({
        requirement: 'Volunteer Hours',
        status: 'missing',
        requiredValue: scholarship.minVolunteerHours,
        details: `Requires at least ${scholarship.minVolunteerHours} volunteer hours`
      });
    } else if (profileHours >= scholarship.minVolunteerHours) {
      checks.push({
        requirement: 'Volunteer Hours',
        status: 'met',
        studentValue: profileHours,
        requiredValue: scholarship.minVolunteerHours,
        details: `Your volunteer hours (${profileHours}) meet the minimum requirement of ${scholarship.minVolunteerHours}`
      });
    } else {
      checks.push({
        requirement: 'Volunteer Hours',
        status: 'not_eligible',
        studentValue: profileHours,
        requiredValue: scholarship.minVolunteerHours,
        details: `Your volunteer hours (${profileHours}) do not meet the minimum requirement of ${scholarship.minVolunteerHours}`
      });
    }
  }

  return checks;
}
