import OpenAI from 'openai';
import type { StudentProfile, Scholarship } from '@shared/schema';
import { findMatchingScholarships, type ScholarshipMatch } from './scholarshipMatcher';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Generate a system prompt with student profile and scholarship context
 */
function generateSystemPrompt(
  profile: StudentProfile | null,
  matches: ScholarshipMatch[]
): string {
  let prompt = `You are a helpful scholarship advisor assistant. Your role is to help students find and understand scholarship opportunities that match their profile.

Current date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Guidelines:
- Be encouraging and supportive
- Provide specific, actionable advice
- Explain eligibility requirements clearly
- Suggest ways students can improve their applications
- Always mention deadlines when discussing specific scholarships
- If students ask about their profile, reference their actual data
`;

  if (profile) {
    prompt += `\n\nSTUDENT PROFILE:
- Name: ${profile.firstName} ${profile.lastName}
- Major: ${profile.major || 'Not specified'}
- GPA: ${profile.gpa || 'Not specified'}
- Academic Year: ${profile.academicYear || 'Not specified'}`;

    if (profile.actScore) prompt += `\n- ACT Score: ${profile.actScore}`;
    if (profile.satScore) prompt += `\n- SAT Score: ${profile.satScore}`;
    if (profile.lsatScore) prompt += `\n- LSAT Score: ${profile.lsatScore}`;
    if (profile.greScore) prompt += `\n- GRE Score: ${profile.greScore}`;
    
    if (profile.ethnicity) prompt += `\n- Ethnicity: ${profile.ethnicity}`;
    if (profile.firstGeneration) prompt += `\n- First-generation college student: Yes`;
    if (profile.veteran) prompt += `\n- Veteran: Yes`;
    if (profile.disability) prompt += `\n- Has disability: Yes`;
    
    if (profile.skills && profile.skills.length > 0) {
      prompt += `\n- Skills: ${profile.skills.join(', ')}`;
    }
    
    if (profile.extracurriculars && profile.extracurriculars.length > 0) {
      prompt += `\n- Extracurriculars: ${profile.extracurriculars.join(', ')}`;
    }
    
    if (profile.volunteerHours) {
      prompt += `\n- Volunteer Hours: ${profile.volunteerHours}`;
    }
    
    if (profile.financialNeed) {
      prompt += `\n- Financial Need: ${profile.financialNeed}`;
    }
  }

  if (matches.length > 0) {
    prompt += `\n\nAVAILABLE SCHOLARSHIPS (sorted by match score):`;
    
    matches.forEach((match, index) => {
      const s = match.scholarship;
      const deadline = new Date(s.deadline).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      prompt += `\n\n${index + 1}. ${s.title} (${match.matchScore}% match)
   - Award Amount: $${s.amount.toLocaleString()}
   - Deadline: ${deadline}
   - Category: ${s.category}
   - Description: ${s.description}
   - Eligibility: ${s.eligibility}`;
      
      if (match.matchReasons.length > 0) {
        prompt += `\n   - Why it matches: ${match.matchReasons.join('; ')}`;
      }
      
      if (match.missingRequirements.length > 0) {
        prompt += `\n   - Missing requirements: ${match.missingRequirements.join('; ')}`;
      }
    });
  } else {
    prompt += `\n\nNo scholarships are currently available in the database. Encourage the student to check back later or complete their profile for better matching.`;
  }

  return prompt;
}

/**
 * Get AI completion with scholarship context
 */
export async function getScholarshipAssistantResponse(
  messages: ChatMessage[],
  profile: StudentProfile | null,
  scholarships: Scholarship[]
): Promise<string> {
  try {
    // Find matching scholarships if profile exists
    const matches = profile 
      ? findMatchingScholarships(profile, scholarships, 30) // Lower threshold for more options
      : [];

    const systemPrompt = generateSystemPrompt(profile, matches);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error(`AI Assistant error: ${error.message || 'Unknown error occurred'}`);
  }
}
