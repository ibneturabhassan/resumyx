
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, Experience, Project, Education } from "../types";

export type LogCallback = (message: string) => void;

const cleanJsonResponse = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned.trim();
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const MODEL_NAME = "gemini-3-flash-preview";

/** Agent 1: Summary Strategy Agent */
export const generateTailoredSummary = async (
  currentSummary: string,
  skills: any,
  jobDescription: string,
  onLog?: LogCallback
): Promise<string> => {
  onLog?.("Agent [Executive Summary] refining hook...");
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `
      ROLE: Expert Executive Resume Writer
      JD: ${jobDescription}
      PROFILE DATA: ${JSON.stringify({ currentSummary, skills })}
      
      TASK: Create a punchy, 3-sentence summary that highlights the candidate's mastery of the JD's primary requirements.
      RULES:
      - Use strong action verbs.
      - Mention at least 3 critical technologies from the JD.
      - Focus on senior-level business value.
      - Output ONLY the raw text summary.
    `,
    config: { 
      temperature: 0.8,
      thinkingConfig: { thinkingBudget: 512 }
    }
  });
  return response.text?.trim() || currentSummary;
};

/** Agent 2: Experience Optimization Agent */
export const generateTailoredExperience = async (
  experiences: Experience[],
  jobDescription: string,
  onLog?: LogCallback
): Promise<Experience[]> => {
  onLog?.("Agent [Experience Curator] auditing career metrics...");
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `
      ROLE: Senior Technical Recruiter
      JD: ${jobDescription}
      WORK HISTORY: ${JSON.stringify(experiences)}
      
      TASK: Tailor the work history to align with the JD requirements.
      RULES:
      - Select the most relevant 2-3 positions.
      - Rewrite bullets to focus on outcomes and quantified metrics.
      - Mirror JD terminology.
      - Output a valid JSON array of Experience objects.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            company: { type: Type.STRING },
            role: { type: Type.STRING },
            location: { type: Type.STRING },
            startDate: { type: Type.STRING },
            endDate: { type: Type.STRING },
            description: { type: Type.ARRAY, items: { type: Type.STRING } },
          }
        }
      },
      thinkingConfig: { thinkingBudget: 1024 }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || '[]'));
};

/** Agent 3: Skills Architecture Agent */
export const generateTailoredSkills = async (
  skills: any,
  jobDescription: string,
  onLog?: LogCallback
): Promise<any> => {
  onLog?.("Agent [Skills Architect] mapping tech stack...");
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `
      JD: ${jobDescription}
      CANDIDATE SKILLS: ${JSON.stringify(skills)}
      TASK: Categorize and filter skills to match the JD.
      Output a valid JSON object with: languages, databases, cloud, tools.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          languages: { type: Type.ARRAY, items: { type: Type.STRING } },
          databases: { type: Type.ARRAY, items: { type: Type.STRING } },
          cloud: { type: Type.ARRAY, items: { type: Type.STRING } },
          tools: { type: Type.ARRAY, items: { type: Type.STRING } },
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || '{}'));
};

/** Agent 4: Project Relevance Agent */
export const generateTailoredProjects = async (
  projects: Project[],
  jobDescription: string,
  onLog?: LogCallback
): Promise<Project[]> => {
  onLog?.("Agent [Project Scouter] selecting evidence...");
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `
      JD: ${jobDescription}
      PROJECTS: ${JSON.stringify(projects)}
      TASK: Refine projects to highlight technical challenges relevant to the JD.
      Output a JSON array of Project objects.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.ARRAY, items: { type: Type.STRING } },
          }
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || '[]'));
};

/** Agent 5: Education & Credentials Agent */
export const generateTailoredEducation = async (
  education: Education[],
  jobDescription: string,
  onLog?: LogCallback
): Promise<Education[]> => {
  onLog?.("Agent [Academic Registrar] finalizing credentials...");
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `
      JD: ${jobDescription}
      EDUCATION: ${JSON.stringify(education)}
      TASK: Standardize education format.
      Output a JSON array of Education objects.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            institution: { type: Type.STRING },
            degree: { type: Type.STRING },
            location: { type: Type.STRING },
            graduationDate: { type: Type.STRING },
          }
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || '[]'));
};

/** Agent 6: Scoring Agent */
export const calculateATSScore = async (
  resume: ResumeData,
  jobDescription: string,
  onLog?: LogCallback
): Promise<{ score: number; reasoning: string[] }> => {
  onLog?.("Agent [Quality Assurance] calculating ATS compatibility score...");
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `
      JD: ${jobDescription}
      TAILORED RESUME: ${JSON.stringify(resume)}
      
      TASK: Evaluate the resume's match for the JD on a scale of 0-100.
      Output a JSON object with 'score' (number) and 'reasoning' (array of 3 short strings).
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          reasoning: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['score', 'reasoning']
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text || '{"score": 0, "reasoning": []}'));
};

/** Cover Letter Agent */
export const generateCoverLetter = async (
  resume: ResumeData,
  jobDescription: string,
  instructions: string,
  onLog?: LogCallback
): Promise<string> => {
  onLog?.("Agent [Linguistic Architect] drafting ultra-concise cover letter...");
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `
      ROLE: Elite Career Strategist & Technical Writer
      CANDIDATE_RESUME: ${JSON.stringify(resume)}
      TARGET_JD: ${jobDescription}
      USER_SPECIFIC_INSTRUCTIONS: ${instructions}
      
      TASK: Draft a high-impact, professional cover letter that is GUARANTEED to fit on a single A4 page.
      
      CRITICAL CONSTRAINTS:
      - TOTAL LENGTH: Maximum 220 words.
      - STRUCTURE: Header, Greeting, 3 short body paragraphs, Sign-off.
      - THEME: Bridging Data Engineering technical depth with target business goals.
      - BREVITY: Avoid fluff. Every sentence must provide technical or professional proof.
      - SINGLE PAGE: The content must be brief enough to leave room for the header and signature on one page.

      FORMAT: 
      - Output ONLY the text of the letter. 
      - Use [Recipient Name], [Company Name], and [Date] as standard placeholders.
    `,
    config: {
      temperature: 0.6,
      thinkingConfig: { thinkingBudget: 1536 }
    }
  });
  return response.text || "Failed to generate cover letter.";
};

export const testApiConnection = async (onLog?: LogCallback): Promise<boolean> => {
  const log = onLog || (() => {});
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "Respond with 'Connected'.",
    });
    log(`Success: Received response: ${response.text}`);
    return true;
  } catch (err: any) {
    log(`FATAL: ${err.message}`);
    return false;
  }
};

export const generateSummary = async (input: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Summary for: ${input}`,
  });
  return response.text || '';
};

export const generateResumeContent = async (type: any, prompt: string): Promise<any> => {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Extract Resume JSON from: ${prompt}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonResponse(response.text || '{}'));
};
