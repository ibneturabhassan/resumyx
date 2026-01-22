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

    def _handle_rate_limit_error(self, error_msg: str):
        """Check if error is a rate limit error and raise appropriate exception"""
        if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            raise Exception(f"{self.__class__.__name__} API rate limit exceeded. Please wait a moment and try again.")
