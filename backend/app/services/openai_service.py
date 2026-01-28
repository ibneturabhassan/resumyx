from openai import AsyncOpenAI
from app.services.base_ai_service import BaseAIService
from app.models.resume import ResumeData, Skills, Experience, Education, Project
from typing import List
import json

class OpenAIService(BaseAIService):
    """OpenAI provider implementation"""

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        super().__init__(api_key, model)
        self.client = AsyncOpenAI(api_key=api_key)

    async def _generate_completion(self, prompt: str, response_format: str = "text") -> str:
        """Helper method to generate completion"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert resume writer and career advisor."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            error_msg = str(e)
            print(f"OpenAI API error: {error_msg}")
            self._handle_rate_limit_error(error_msg)
            raise Exception(f"OpenAI API error: {error_msg}")

    async def generate_summary(self, experience: str) -> str:
        prompt = f"""Based on the following work experience, generate a compelling 2-3 sentence professional summary for a resume. Focus on key achievements and skills.

Experience:
{experience}

Return only the summary text, no additional formatting or labels."""

        return await self._generate_completion(prompt)

    async def tailor_summary(
        self,
        additional_info: str,
        skills: Skills,
        experience: List[Experience],
        job_description: str
    ) -> str:
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

        return await self._generate_completion(prompt)

    async def tailor_experience(
        self,
        experience: List[Experience],
        job_description: str
    ) -> List[Experience]:
        prompt = f"""You are an expert resume writer. Optimize these work experiences for the target job description.

Current Experiences:
{json.dumps([exp.model_dump() for exp in experience], indent=2)}

Target Job Description:
{job_description}

Instructions:
1. SELECT and prioritize the 4-6 most relevant bullet points per role that match the job requirements
2. Rewrite bullets to emphasize achievements that align with the job description
3. Use strong action verbs and quantify results wherever possible (percentages, numbers, scale)
4. Incorporate exact keywords and phrases from the job description naturally
5. Remove or deprioritize bullets that are not relevant to this specific job
6. Focus on accomplishments that demonstrate skills mentioned in the job posting
7. Maintain truthfulness - do NOT add false information or fabricate achievements
8. Keep the same structure (company, role, dates, location) - only modify description bullets
9. Return valid JSON array matching the exact input structure

Return only the JSON array, no markdown or additional text:"""

        try:
            text = await self._generate_completion(prompt)
            # Remove markdown code blocks if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            experiences_data = json.loads(text)
            return [Experience(**exp) for exp in experiences_data]
        except json.JSONDecodeError:
            print(f"JSON parsing error, returning original experience")
            return experience
        except Exception as e:
            error_msg = str(e)
            self._handle_rate_limit_error(error_msg)
            if "JSON" in error_msg or "json" in error_msg:
                return experience
            raise

    async def tailor_skills(
        self,
        skills: Skills,
        job_description: str
    ) -> Skills:
        prompt = f"""You are an expert resume writer. Optimize this skills section for the target job.

Current Skills:
{json.dumps(skills.model_dump(), indent=2)}

Target Job Description:
{job_description}

Instructions:
1. SELECT only the most relevant skills (5-8 per category) from the original list that match the job requirements
2. Remove skills that are NOT mentioned or relevant to the job description
3. Prioritize skills that appear in the job description
4. If a category has no relevant skills, you may return an empty array for that category
5. Do NOT add new skills - only select from the existing list
6. Return valid JSON object matching the exact input structure

Return only the JSON object, no markdown or additional text:"""

        try:
            text = await self._generate_completion(prompt)
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            skills_data = json.loads(text)
            return Skills(**skills_data)
        except json.JSONDecodeError:
            return skills
        except Exception as e:
            error_msg = str(e)
            self._handle_rate_limit_error(error_msg)
            if "JSON" in error_msg or "json" in error_msg:
                return skills
            raise

    async def tailor_projects(
        self,
        projects: List[Project],
        job_description: str
    ) -> List[Project]:
        if not projects:
            return projects

        prompt = f"""You are an expert resume writer. Optimize these projects for the target job.

Current Projects:
{json.dumps([proj.model_dump() for proj in projects], indent=2)}

Target Job Description:
{job_description}

Instructions:
1. Rewrite project descriptions to emphasize relevant technologies and achievements
2. Incorporate keywords from the job description
3. Keep the same structure
4. Return valid JSON array matching the exact input structure

Return only the JSON array, no markdown or additional text:"""

        try:
            text = await self._generate_completion(prompt)
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            projects_data = json.loads(text)
            return [Project(**proj) for proj in projects_data]
        except json.JSONDecodeError:
            return projects
        except Exception as e:
            error_msg = str(e)
            self._handle_rate_limit_error(error_msg)
            if "JSON" in error_msg or "json" in error_msg:
                return projects
            raise

    async def tailor_education(
        self,
        education: List[Education],
        job_description: str
    ) -> List[Education]:
        # Education typically doesn't need AI tailoring
        return education

    async def calculate_ats_score(
        self,
        resume_data: ResumeData,
        job_description: str
    ) -> dict:
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
            text = await self._generate_completion(prompt)
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            return json.loads(text)
        except Exception as e:
            error_msg = str(e)
            self._handle_rate_limit_error(error_msg)
            raise

    async def generate_cover_letter(
        self,
        profile_data: ResumeData,
        job_description: str,
        instructions: str = ""
    ) -> str:
        prompt = f"""You are a professional cover letter writer. Your task is to write ONLY the body paragraphs of a cover letter.

STRICT OUTPUT FORMAT RULE:
You MUST output ONLY the main body paragraphs. DO NOT include any greeting, salutation, closing, or signature.

Candidate Information:
{json.dumps(profile_data.model_dump(), indent=2)}

Job Description:
{job_description}

Additional Instructions:
{instructions if instructions else "None"}

EXAMPLE OF CORRECT OUTPUT FORMAT:
(Start your response exactly like this - notice NO greeting at the start and NO closing at the end)

I am excited to apply for this position as my background in software engineering aligns perfectly with your requirements. With over 5 years of experience in full-stack development, I have consistently delivered scalable solutions that drive business growth.

In my previous role at TechCorp, I led a team of 4 developers to build a microservices architecture that reduced system latency by 40%. I also implemented CI/CD pipelines that accelerated deployment cycles by 60%, directly supporting the company's agile transformation goals.

I am particularly drawn to your company's innovative approach to cloud computing and would welcome the opportunity to contribute my expertise in distributed systems and DevOps practices to your team.

(Notice the output ENDS with the last sentence - no "Sincerely", no name, nothing after)

WHAT YOU MUST NOT INCLUDE:
- NO "Dear" or any greeting at the start
- NO "Sincerely" or any closing at the end
- NO candidate name
- NO signature

Write 3-4 paragraphs of body content ONLY. Start with the first word of paragraph 1. End with the last word of the final paragraph. Nothing before, nothing after.

Body paragraphs:"""

        raw_content = await self._generate_completion(prompt)

        # Clean the response to remove any salutations/closings that might still be included
        candidate_name = profile_data.personalInfo.fullName if profile_data.personalInfo else ""
        cleaned_content = self._clean_cover_letter(raw_content, candidate_name)

        return cleaned_content
