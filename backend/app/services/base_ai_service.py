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

    @abstractmethod
    async def generate_proposal(
        self,
        profile_data: ResumeData,
        job_description: str
    ) -> dict:
        """Generate freelance job proposal with suggested experience and projects"""
        pass

    def _clean_cover_letter(self, content: str, candidate_name: str = "") -> str:
        """
        AGGRESSIVELY clean cover letter to extract ONLY body paragraphs.
        Removes greetings, closings, signatures - everything except substantive content.
        """
        import re

        print(f"\n{'='*60}")
        print("DEBUG: Original AI response:")
        print(content)
        print(f"{'='*60}\n")

        # STEP 1: Split into paragraphs
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]

        if not paragraphs:
            return content

        print(f"DEBUG: Found {len(paragraphs)} paragraphs")

        # STEP 2: Remove greeting paragraph (first paragraph with Dear/Hello/etc)
        greeting_patterns = [
            r'dear\s+', r'to\s+whom', r'hello', r'greetings', r'hi\s+'
        ]

        if paragraphs:
            first_para_lower = paragraphs[0].lower()
            if any(re.search(pattern, first_para_lower) for pattern in greeting_patterns):
                print(f"DEBUG: Removing greeting paragraph: {paragraphs[0][:50]}...")
                paragraphs.pop(0)

        # STEP 3: Remove closing paragraphs from the END
        # These are ANY paragraphs containing closing keywords
        closing_keywords = [
            'sincerely', 'best regards', 'kind regards', 'warm regards',
            'thank you for your consideration', 'thank you for considering',
            'thank you', 'thanks', 'regards', 'best',
            'yours truly', 'yours sincerely', 'yours faithfully',
            'respectfully', 'cordially', 'gratefully',
            'i look forward to', 'please feel free to contact',
            'i would welcome the opportunity', 'looking forward'
        ]

        # Remove paragraphs from the end that contain closing keywords
        while paragraphs:
            last_para_lower = paragraphs[-1].lower()

            # Check if last paragraph contains any closing keyword
            contains_closing = any(keyword in last_para_lower for keyword in closing_keywords)

            # Also remove if it's the candidate's name or very short
            is_name = False
            if candidate_name:
                name_lower = candidate_name.lower()
                is_name = name_lower in last_para_lower or len(paragraphs[-1]) < 30

            if contains_closing or is_name:
                print(f"DEBUG: Removing closing paragraph: {paragraphs[-1][:80]}...")
                paragraphs.pop()
            else:
                break

        # STEP 4: Remove any remaining single-line signatures at the end
        if paragraphs:
            # Check if last paragraph is suspiciously short (might be a signature line we missed)
            while paragraphs and len(paragraphs[-1]) < 50:
                print(f"DEBUG: Removing short trailing line: {paragraphs[-1]}")
                paragraphs.pop()

        # STEP 5: Rejoin and clean up
        content = '\n\n'.join(paragraphs)
        content = content.strip()

        # Remove multiple consecutive newlines
        content = re.sub(r'\n{3,}', '\n\n', content)

        print(f"\n{'='*60}")
        print("DEBUG: Cleaned response:")
        print(content)
        print(f"{'='*60}\n")
        print(f"DEBUG: Final paragraph count: {len(paragraphs)}")

        return content

    def _handle_rate_limit_error(self, error_msg: str):
        """Check if error is a rate limit error and raise appropriate exception"""
        if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            raise Exception(f"{self.__class__.__name__} API rate limit exceeded. Please wait a moment and try again.")
