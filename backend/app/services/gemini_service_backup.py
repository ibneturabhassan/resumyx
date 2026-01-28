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
    async def tailor_summary(additional_info: str, skills: Skills, experience: List[Experience], job_description: str) -> str:
        """Generate a tailored professional summary based on additional info and job description"""
        prompt = f"""You are an expert resume writer. Create a professional summary (2-3 sentences) tailored for this specific job.

Additional Information About the Candidate:
{additional_info}

Skills: {json.dumps(skills.model_dump())}

Work Experience Summary:
{json.dumps([{'role': exp.role, 'company': exp.company, 'years': f"{exp.startDate} - {exp.endDate}"} for exp in experience])}

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

        try:
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating summary: {error_msg}")
            # Check if it's a quota/rate limit error
            if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                raise Exception("Gemini API rate limit exceeded. Please wait a moment and try again.")
            raise Exception(f"Failed to generate summary: {error_msg}")

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
            error_msg = str(e)
            print(f"Error tailoring experience: {error_msg}")
            if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                raise Exception("Gemini API rate limit exceeded. Please wait a moment and try again.")
            # For JSON parsing errors, return original experience
            if "JSON" in error_msg or "json" in error_msg:
                print(f"JSON parsing error, returning original experience")
                return experience
            raise Exception(f"Failed to tailor experience: {error_msg}")

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
            error_msg = str(e)
            print(f"Error tailoring skills: {error_msg}")
            if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                raise Exception("Gemini API rate limit exceeded. Please wait a moment and try again.")
            if "JSON" in error_msg or "json" in error_msg:
                return skills
            raise Exception(f"Failed to tailor skills: {error_msg}")

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
            error_msg = str(e)
            print(f"Error tailoring projects: {error_msg}")
            if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                raise Exception("Gemini API rate limit exceeded. Please wait a moment and try again.")
            if "JSON" in error_msg or "json" in error_msg:
                return projects
            raise Exception(f"Failed to tailor projects: {error_msg}")

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
            error_msg = str(e)
            print(f"Error calculating ATS score: {error_msg}")
            # Check if it's a quota/rate limit error
            if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                raise Exception("Gemini API rate limit exceeded. Please wait a moment and try again.")
            raise Exception(f"Failed to calculate ATS score: {error_msg}")

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
            error_msg = str(e)
            print(f"Error generating cover letter: {error_msg}")
            if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                raise Exception("Gemini API rate limit exceeded. Please wait a moment and try again.")
            raise Exception(f"Failed to generate cover letter: {error_msg}")

gemini_service = GeminiService()
