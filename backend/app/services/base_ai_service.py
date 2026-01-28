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

        print(f"\n{'='*60}")
        print("DEBUG: Original AI response:")
        print(content)
        print(f"{'='*60}\n")

        original_content = content

        # Remove common salutations at the beginning
        salutations = [
            r'^Dear\s+(?:Hiring\s+Manager|Sir\/Madam|.*?Team|.*?Committee)[,:]?\s*\n*',
            r'^To\s+Whom\s+It\s+May\s+Concern[,:]?\s*\n*',
            r'^Hello[,:]?\s*\n*',
            r'^Greetings[,:]?\s*\n*',
        ]

        for salutation in salutations:
            content = re.sub(salutation, '', content, flags=re.IGNORECASE | re.MULTILINE)

        # ULTRA AGGRESSIVE: Remove everything from "Sincerely" onwards (case insensitive, multiline)
        # This will match "Sincerely" or "Sincerely," and everything after it
        content = re.sub(r'(?i)\n*\s*sincerely\s*,?\s*.*$', '', content, flags=re.DOTALL)

        # Also catch other common closings with DOTALL to get everything after
        closing_phrases = [
            'best regards', 'kind regards', 'warm regards', 'warmest regards',
            'respectfully', 'respectfully yours', 'thank you for your consideration',
            'thank you', 'thanks', 'yours truly', 'yours sincerely', 'yours faithfully',
            'best', 'regards', 'cordially', 'with appreciation', 'gratefully'
        ]

        for phrase in closing_phrases:
            # Match the phrase (case insensitive) and everything after it
            pattern = rf'(?i)\n*\s*{re.escape(phrase)}\s*,?\s*.*$'
            content = re.sub(pattern, '', content, flags=re.DOTALL)

        # Remove standalone name at the end if provided
        if candidate_name:
            # Remove the full name (case insensitive)
            content = re.sub(rf'(?i)\n*\s*{re.escape(candidate_name)}\s*$', '', content, flags=re.MULTILINE)

            # Also try to remove just first and last name variations
            name_parts = candidate_name.split()
            if len(name_parts) >= 2:
                first_name = name_parts[0]
                last_name = name_parts[-1]
                content = re.sub(rf'(?i)\n*\s*{re.escape(first_name)}\s+{re.escape(last_name)}\s*$', '', content, flags=re.MULTILINE)
                # Also try just first name or just last name at the end
                content = re.sub(rf'(?i)\n*\s*{re.escape(first_name)}\s*$', '', content, flags=re.MULTILINE)
                content = re.sub(rf'(?i)\n*\s*{re.escape(last_name)}\s*$', '', content, flags=re.MULTILINE)

        # Split into paragraphs and filter out non-substantive ones
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]

        # Keep only paragraphs that:
        # 1. Have more than 20 characters (substantive)
        # 2. Don't contain common closing phrases
        # 3. End with proper punctuation
        substantive_paragraphs = []
        closing_keywords = ['sincerely', 'regards', 'thank you', 'thanks', 'best', 'yours',
                           'respectfully', 'cordially', 'gratefully', 'appreciation']

        for para in paragraphs:
            para_lower = para.lower()
            # Skip if it's too short or contains closing keywords
            if len(para) < 20:
                continue
            if any(keyword in para_lower for keyword in closing_keywords):
                # But allow if it's a substantial paragraph (more than 100 chars)
                if len(para) < 100:
                    continue
            substantive_paragraphs.append(para)

        # Rejoin paragraphs
        content = '\n\n'.join(substantive_paragraphs)

        # Remove any trailing lines that look like signatures
        lines = content.split('\n')
        while lines and len(lines[-1].strip()) > 0:
            last_line = lines[-1].strip()
            # Remove if: short (<=5 words) AND doesn't end with sentence punctuation
            if len(last_line.split()) <= 5 and not last_line.endswith(('.', '!', '?')):
                lines.pop()
            else:
                break

        content = '\n'.join(lines)

        # Clean up extra whitespace
        content = content.strip()

        # Remove multiple consecutive newlines (more than 2)
        content = re.sub(r'\n{3,}', '\n\n', content)

        print(f"\n{'='*60}")
        print("DEBUG: Cleaned response:")
        print(content)
        print(f"{'='*60}\n")

        return content

    def _handle_rate_limit_error(self, error_msg: str):
        """Check if error is a rate limit error and raise appropriate exception"""
        if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            raise Exception(f"{self.__class__.__name__} API rate limit exceeded. Please wait a moment and try again.")
