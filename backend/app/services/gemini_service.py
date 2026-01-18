import google.generativeai as genai
from app.core.config import settings
from app.models.resume import ResumeData, Skills, Experience, Education, Project
from typing import List
import json

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-exp')

class GeminiService:
    @staticmethod
    async def generate_summary(experience: str) -> str:
        """Generate professional summary from experience"""
        prompt = f"""Based on the following work experience, generate a compelling 2-3 sentence professional summary for a resume. Focus on key achievements and skills.

Experience:
{experience}

Return only the summary text, no additional formatting or labels."""

        try:
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating summary: {e}")
            return ""

    @staticmethod
    async def tailor_summary(summary: str, skills: Skills, job_description: str) -> str:
        """Tailor summary for specific job"""
        prompt = f"""You are an expert resume writer. Tailor this professional summary to match the job description while keeping it authentic.

Current Summary: {summary}

Skills: {json.dumps(skills.model_dump())}

Target Job Description:
{job_description}

Instructions:
1. Maintain the candidate's core experience and achievements
2. Emphasize skills and experiences most relevant to the job
3. Use keywords from the job description naturally
4. Keep it 2-3 sentences, professional and impactful
5. Return ONLY the tailored summary text

Tailored Summary:"""

        try:
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error tailoring summary: {e}")
            return summary

    @staticmethod
    async def tailor_experience(experience: List[Experience], job_description: str) -> List[Experience]:
        """Tailor experience descriptions for job"""
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

        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            # Remove markdown code blocks if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            experiences_data = json.loads(text)
            return [Experience(**exp) for exp in experiences_data]
        except Exception as e:
            print(f"Error tailoring experience: {e}")
            return experience

    @staticmethod
    async def tailor_skills(skills: Skills, job_description: str) -> Skills:
        """Tailor skills for job"""
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

        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            skills_data = json.loads(text)
            return Skills(**skills_data)
        except Exception as e:
            print(f"Error tailoring skills: {e}")
            return skills

    @staticmethod
    async def tailor_projects(projects: List[Project], job_description: str) -> List[Project]:
        """Tailor projects for job"""
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

        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            projects_data = json.loads(text)
            return [Project(**proj) for proj in projects_data]
        except Exception as e:
            print(f"Error tailoring projects: {e}")
            return projects

    @staticmethod
    async def tailor_education(education: List[Education], job_description: str) -> List[Education]:
        """Education typically doesn't need tailoring, return as-is"""
        return education

    @staticmethod
    async def calculate_ats_score(resume_data: ResumeData, job_description: str) -> dict:
        """Calculate ATS compatibility score"""
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
{{"score": 85, "feedback": "Strong match with relevant keywords..."}}

Return only the JSON object:"""

        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            return json.loads(text)
        except Exception as e:
            print(f"Error calculating ATS score: {e}")
            return {"score": 0, "feedback": "Error calculating score"}

    @staticmethod
    async def generate_cover_letter(
        resume_data: ResumeData,
        job_description: str,
        instructions: str = ""
    ) -> str:
        """Generate personalized cover letter"""
        prompt = f"""You are an expert cover letter writer. Create a compelling, personalized cover letter.

Candidate Information:
Name: {resume_data.personalInfo.fullName}
Summary: {resume_data.summary}
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

        try:
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating cover letter: {e}")
            return ""

gemini_service = GeminiService()
