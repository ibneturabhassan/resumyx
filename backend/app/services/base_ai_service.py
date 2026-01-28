from abc import ABC, abstractmethod
from typing import List
from app.models.resume import ResumeData, Skills, Experience, Education, Project

class BaseAIService(ABC):
    """Base class for all AI service providers"""

    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model

    @abstractmethod
    async def generate_summary(self, experience: str) -> str:
        """Generate professional summary from experience"""
        pass

    @abstractmethod
    async def tailor_summary(
        self,
        additional_info: str,
        skills: Skills,
        experience: List[Experience],
        job_description: str
    ) -> str:
        """Generate tailored professional summary"""
        pass

    @abstractmethod
    async def tailor_experience(
        self,
        experience: List[Experience],
        job_description: str
    ) -> List[Experience]:
        """Tailor experience descriptions"""
        pass

    @abstractmethod
    async def tailor_skills(
        self,
        skills: Skills,
        job_description: str
    ) -> Skills:
        """Tailor skills section"""
        pass

    @abstractmethod
    async def tailor_projects(
        self,
        projects: List[Project],
        job_description: str
    ) -> List[Project]:
        """Tailor project descriptions"""
        pass

    @abstractmethod
    async def tailor_education(
        self,
        education: List[Education],
        job_description: str
    ) -> List[Education]:
        """Tailor education section"""
        pass

    @abstractmethod
    async def calculate_ats_score(
        self,
        resume_data: ResumeData,
        job_description: str
    ) -> dict:
        """Calculate ATS compatibility score"""
        pass

    @abstractmethod
    async def generate_cover_letter(
        self,
        profile_data: ResumeData,
        job_description: str,
        instructions: str = ""
    ) -> str:
        """Generate personalized cover letter"""
        pass

    def _clean_cover_letter(self, content: str, candidate_name: str = "") -> str:
        """
        Clean cover letter content by removing common salutations, closings, and signatures.
        Returns only the body paragraphs of the cover letter.
        """
        import re

        # Remove common salutations at the beginning
        salutations = [
            r'^Dear\s+(?:Hiring\s+Manager|Sir\/Madam|.*?Team|.*?Committee)[,:]?\s*\n*',
            r'^To\s+Whom\s+It\s+May\s+Concern[,:]?\s*\n*',
            r'^Hello[,:]?\s*\n*',
            r'^Greetings[,:]?\s*\n*',
        ]

        for salutation in salutations:
            content = re.sub(salutation, '', content, flags=re.IGNORECASE | re.MULTILINE)

        # Remove common closings and signatures at the end
        closings = [
            r'\n*\s*Sincerely[,]?\s*\n*.*$',
            r'\n*\s*Best\s+regards[,]?\s*\n*.*$',
            r'\n*\s*Kind\s+regards[,]?\s*\n*.*$',
            r'\n*\s*Warm\s+regards[,]?\s*\n*.*$',
            r'\n*\s*Respectfully[,]?\s*\n*.*$',
            r'\n*\s*Thank\s+you[,]?\s*\n*.*$',
            r'\n*\s*Yours\s+(?:truly|sincerely|faithfully)[,]?\s*\n*.*$',
        ]

        for closing in closings:
            content = re.sub(closing, '', content, flags=re.IGNORECASE | re.MULTILINE)

        # Remove standalone name at the end if provided
        if candidate_name:
            content = re.sub(rf'\n*\s*{re.escape(candidate_name)}\s*$', '', content, flags=re.IGNORECASE | re.MULTILINE)

        # Clean up extra whitespace
        content = content.strip()

        # Remove multiple consecutive newlines (more than 2)
        content = re.sub(r'\n{3,}', '\n\n', content)

        return content

    def _handle_rate_limit_error(self, error_msg: str):
        """Check if error is a rate limit error and raise appropriate exception"""
        if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            raise Exception(f"{self.__class__.__name__} API rate limit exceeded. Please wait a moment and try again.")
