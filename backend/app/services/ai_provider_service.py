import json
from typing import Any, Dict, List, Optional

import google.generativeai as genai
from openai import OpenAI

from app.core.config import settings
from app.models.resume import ResumeData, Skills, Experience, Education, Project

DEFAULT_GEMINI_MODEL = "gemini-2.0-flash-exp"
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"
DEFAULT_OPENROUTER_MODEL = "anthropic/claude-3.5-sonnet"


def _strip_code_fences(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    return cleaned.strip()


class AIProviderService:
    def _resolve_provider(self, config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        if not config:
            return {
                "provider": "gemini",
                "api_key": settings.GEMINI_API_KEY,
                "model": DEFAULT_GEMINI_MODEL
            }

        provider = config.get("provider", "gemini")
        model = config.get("model") or (
            DEFAULT_OPENAI_MODEL if provider == "openai" else
            DEFAULT_OPENROUTER_MODEL if provider == "openrouter" else
            DEFAULT_GEMINI_MODEL
        )
        return {
            "provider": provider,
            "api_key": config.get("api_key"),
            "model": model,
            "site_url": config.get("site_url"),
            "app_name": config.get("app_name")
        }

    def _generate_text(self, prompt: str, config: Optional[Dict[str, Any]]) -> str:
        resolved = self._resolve_provider(config)
        provider = resolved["provider"]
        api_key = resolved.get("api_key")
        model = resolved["model"]

        if provider == "gemini":
            genai.configure(api_key=api_key or settings.GEMINI_API_KEY)
            model_client = genai.GenerativeModel(model)
            response = model_client.generate_content(prompt)
            return response.text.strip()

        if not api_key:
            raise Exception("API key is required for the selected provider.")

        base_url = None
        default_headers = None
        if provider == "openrouter":
            base_url = "https://openrouter.ai/api/v1"
            default_headers = {}
            if resolved.get("site_url"):
                default_headers["HTTP-Referer"] = resolved["site_url"]
            if resolved.get("app_name"):
                default_headers["X-Title"] = resolved["app_name"]

        client = OpenAI(api_key=api_key, base_url=base_url, default_headers=default_headers)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        return response.choices[0].message.content.strip()

    async def generate_summary(self, experience: str, config: Optional[Dict[str, Any]]) -> str:
        prompt = f"""Based on the following work experience, generate a compelling 2-3 sentence professional summary for a resume. Focus on key achievements and skills.

Experience:
{experience}

Return only the summary text, no additional formatting or labels."""

        return self._generate_text(prompt, config)

    async def tailor_summary(self, additional_info: str, skills: Skills, experience: List[Experience], job_description: str, config: Optional[Dict[str, Any]]) -> str:
        prompt = f"""You are an expert resume writer. Create a professional summary (2-3 sentences) tailored for this specific job.

Additional Information About the Candidate:
{additional_info}

Skills: {json.dumps(skills.model_dump())}

Work Experience Summary:
{json.dumps([{'role': exp.role, 'company': exp.company, 'years': f\"{exp.startDate} - {exp.endDate}\"} for exp in experience])}

Target Job Description:
{job_description}

Instructions:
1. Create a compelling 2-3 sentence professional summary
2. Highlight the most relevant skills and experiences for THIS specific job
3. Use keywords from the job description naturally
4. Make it impactful and tailored to the role requirements
5. Base the summary on the candidate's additional information and experience
6. Return ONLY the professional summary text, no extra commentary

Professional Summary:"""

        return self._generate_text(prompt, config)

    async def tailor_experience(self, experience: List[Experience], job_description: str, config: Optional[Dict[str, Any]]) -> List[Experience]:
        prompt = f"""You are an expert resume writer. Optimize these work experiences for the target job description.

Current Experiences:
{json.dumps([exp.model_dump() for exp in experience], indent=2)}

Target Job Description:
{job_description}

Instructions:
1. Rewrite bullet points to emphasize relevant skills and achievements
2. Use action verbs and quantify results where possible
3. Incorporate keywords from the job description naturally
4. Maintain truthfulness - don't add false information
5. Keep the same structure (company, role, dates, location)
6. Return valid JSON array matching the exact input structure

Return only the JSON array, no markdown or additional text:"""

        text = _strip_code_fences(self._generate_text(prompt, config))
        experiences_data = json.loads(text)
        return [Experience(**exp) for exp in experiences_data]

    async def tailor_skills(self, skills: Skills, job_description: str, config: Optional[Dict[str, Any]]) -> Skills:
        prompt = f"""You are an expert resume writer. Optimize this skills section for the target job.

Current Skills:
{json.dumps(skills.model_dump(), indent=2)}

Target Job Description:
{job_description}

Instructions:
1. Prioritize skills mentioned in the job description
2. Keep all truthful skills but reorder by relevance
3. Group similar technologies together
4. Return valid JSON matching the exact structure: {{"languages": [], "databases": [], "cloud": [], "tools": []}}

Return only the JSON object, no markdown or additional text:"""

        text = _strip_code_fences(self._generate_text(prompt, config))
        skills_data = json.loads(text)
        return Skills(**skills_data)

    async def tailor_projects(self, projects: List[Project], job_description: str, config: Optional[Dict[str, Any]]) -> List[Project]:
        if not projects:
            return []

        prompt = f"""You are an expert resume writer. Optimize these projects for the target job.

Current Projects:
{json.dumps([proj.model_dump() for proj in projects], indent=2)}

Target Job Description:
{job_description}

Instructions:
1. Rewrite project descriptions to highlight relevant technologies and outcomes
2. Emphasize aspects that match the job requirements
3. Keep descriptions concise and impactful
4. Return valid JSON array matching the input structure

Return only the JSON array, no markdown or additional text:"""

        text = _strip_code_fences(self._generate_text(prompt, config))
        projects_data = json.loads(text)
        return [Project(**proj) for proj in projects_data]

    async def tailor_education(self, education: List[Education], job_description: str) -> List[Education]:
        return education

    async def calculate_ats_score(self, resume_data: ResumeData, job_description: str, config: Optional[Dict[str, Any]]) -> dict:
        prompt = f"""You are an ATS (Applicant Tracking System) expert. Analyze this resume against the job description and provide an ATS compatibility score.

Resume Data:
{json.dumps(resume_data.model_dump(), indent=2)}

Job Description:
{job_description}

Analyze:
1. Keyword matching
2. Skills alignment
3. Experience relevance
4. Format compatibility

Provide a score from 0-100 and brief feedback. Return valid JSON:
{{\"score\": 85, \"feedback\": \"Strong match with relevant keywords...\"}}

Return only the JSON object:"""

        text = _strip_code_fences(self._generate_text(prompt, config))
        return json.loads(text)

    async def generate_cover_letter(self, resume_data: ResumeData, job_description: str, instructions: str, config: Optional[Dict[str, Any]]) -> str:
        prompt = f"""You are an expert cover letter writer. Create a compelling, personalized cover letter.

Candidate Information:
Name: {resume_data.personalInfo.fullName}
Summary: {getattr(resume_data, "summary", "")}
Experience: {json.dumps([exp.model_dump() for exp in resume_data.experience], indent=2)}
Skills: {json.dumps(resume_data.skills.model_dump())}

Job Description:
{job_description}

Additional Instructions:
{instructions if instructions else "None"}

Create a professional cover letter that:
1. Addresses the company and position
2. Highlights relevant experience and skills
3. Shows enthusiasm and cultural fit
4. Is concise (3-4 paragraphs)
5. Uses a professional yet personable tone

Return only the cover letter text, properly formatted with paragraphs:"""

        return self._generate_text(prompt, config)


ai_provider_service = AIProviderService()
