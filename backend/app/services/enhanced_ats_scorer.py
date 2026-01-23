"""Enhanced ATS Scoring with detailed breakdown and analysis"""
from app.models.resume import ResumeData, ATSScoreBreakdown
from typing import List, Dict
import re
from collections import Counter

class EnhancedATSScorer:
    """Provides detailed ATS scoring with multiple factors"""

    @staticmethod
    def extract_keywords(text: str) -> List[str]:
        """Extract meaningful keywords from text"""
        # Convert to lowercase and split into words
        words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#./-]*\b', text.lower())
        # Filter out common words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                     'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
                     'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
                     'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that'}
        return [w for w in words if w not in stop_words and len(w) > 2]

    @staticmethod
    def calculate_keyword_match(resume_data: ResumeData, job_description: str) -> tuple:
        """Calculate keyword match score and identify missing keywords"""
        # Extract keywords from job description
        job_keywords = EnhancedATSScorer.extract_keywords(job_description)
        job_keyword_freq = Counter(job_keywords)
        important_keywords = [k for k, v in job_keyword_freq.most_common(30)]

        # Extract keywords from resume
        resume_text = " ".join([
            resume_data.additionalInfo,
            " ".join(resume_data.skills.languages),
            " ".join(resume_data.skills.databases),
            " ".join(resume_data.skills.cloud),
            " ".join(resume_data.skills.tools),
            " ".join([" ".join(exp.description) for exp in resume_data.experience]),
        ]).lower()

        # Calculate match
        matched = sum(1 for kw in important_keywords if kw in resume_text)
        match_percentage = int((matched / len(important_keywords)) * 100) if important_keywords else 0

        # Find missing important keywords
        missing = [kw for kw in important_keywords[:15] if kw not in resume_text]

        return match_percentage, missing[:10]  # Return top 10 missing

    @staticmethod
    def score_formatting(resume_data: ResumeData) -> int:
        """Score resume formatting and structure"""
        score = 100

        # Check for essential sections
        if not resume_data.personalInfo.email:
            score -= 15
        if not resume_data.personalInfo.phone:
            score -= 10
        if not resume_data.experience or len(resume_data.experience) == 0:
            score -= 30
        if not resume_data.skills.languages and not resume_data.skills.tools:
            score -= 20
        if not resume_data.education or len(resume_data.education) == 0:
            score -= 15

        # Check for good practices
        if resume_data.personalInfo.linkedin:
            score += 5
        if resume_data.projects and len(resume_data.projects) > 0:
            score += 5

        return max(0, min(100, score))

    @staticmethod
    def score_experience_relevance(resume_data: ResumeData, job_description: str) -> int:
        """Score how relevant the experience is to the job"""
        if not resume_data.experience:
            return 0

        job_keywords = set(EnhancedATSScorer.extract_keywords(job_description))

        total_relevance = 0
        for exp in resume_data.experience:
            exp_text = " ".join(exp.description).lower()
            exp_keywords = set(EnhancedATSScorer.extract_keywords(exp_text))

            # Calculate overlap
            overlap = len(job_keywords & exp_keywords)
            relevance = min(100, (overlap / max(len(job_keywords), 1)) * 100)
            total_relevance += relevance

        avg_relevance = int(total_relevance / len(resume_data.experience))
        return avg_relevance

    @staticmethod
    def score_skills_alignment(resume_data: ResumeData, job_description: str) -> int:
        """Score how well skills align with job requirements"""
        all_skills = (
            resume_data.skills.languages +
            resume_data.skills.databases +
            resume_data.skills.cloud +
            resume_data.skills.tools
        )

        if not all_skills:
            return 0

        job_desc_lower = job_description.lower()
        matched_skills = sum(1 for skill in all_skills if skill.lower() in job_desc_lower)

        alignment_score = int((matched_skills / len(all_skills)) * 100) if all_skills else 0
        return min(100, alignment_score)

    @staticmethod
    def identify_strengths(resume_data: ResumeData, breakdown: ATSScoreBreakdown) -> List[str]:
        """Identify resume strengths"""
        strengths = []

        if breakdown.keyword_match >= 70:
            strengths.append("Strong keyword optimization")
        if breakdown.formatting >= 85:
            strengths.append("Well-structured and complete resume")
        if breakdown.experience_relevance >= 70:
            strengths.append("Highly relevant work experience")
        if breakdown.skills_alignment >= 70:
            strengths.append("Skills strongly aligned with job requirements")

        # Check for quantified achievements
        has_numbers = any(
            any(char.isdigit() for bullet in exp.description for char in bullet)
            for exp in resume_data.experience
        )
        if has_numbers:
            strengths.append("Good use of quantified achievements")

        return strengths

    @staticmethod
    def generate_improvements(breakdown: ATSScoreBreakdown, missing_keywords: List[str]) -> List[str]:
        """Generate specific improvement suggestions"""
        improvements = []

        if breakdown.keyword_match < 60:
            improvements.append(f"Add key terms: {', '.join(missing_keywords[:5])}")
        if breakdown.formatting < 70:
            improvements.append("Ensure all contact information is complete")
        if breakdown.experience_relevance < 60:
            improvements.append("Rewrite experience bullets to emphasize relevant skills")
        if breakdown.skills_alignment < 60:
            improvements.append("Add more job-relevant skills to your skills section")

        if len(improvements) == 0:
            improvements.append("Resume is well-optimized. Consider minor keyword enhancements.")

        return improvements

    @staticmethod
    def calculate_comprehensive_score(
        resume_data: ResumeData,
        job_description: str
    ) -> Dict:
        """Calculate comprehensive ATS score with detailed breakdown"""

        # Calculate individual scores
        keyword_score, missing_keywords = EnhancedATSScorer.calculate_keyword_match(
            resume_data, job_description
        )
        formatting_score = EnhancedATSScorer.score_formatting(resume_data)
        experience_score = EnhancedATSScorer.score_experience_relevance(
            resume_data, job_description
        )
        skills_score = EnhancedATSScorer.score_skills_alignment(
            resume_data, job_description
        )

        # Create breakdown
        breakdown = ATSScoreBreakdown(
            keyword_match=keyword_score,
            formatting=formatting_score,
            experience_relevance=experience_score,
            skills_alignment=skills_score
        )

        # Calculate weighted overall score
        overall_score = int(
            keyword_score * 0.40 +
            formatting_score * 0.15 +
            experience_score * 0.25 +
            skills_score * 0.20
        )

        # Generate feedback
        strengths = EnhancedATSScorer.identify_strengths(resume_data, breakdown)
        improvements = EnhancedATSScorer.generate_improvements(breakdown, missing_keywords)

        feedback_parts = []
        if overall_score >= 80:
            feedback_parts.append("Excellent ATS compatibility!")
        elif overall_score >= 60:
            feedback_parts.append("Good ATS compatibility with room for improvement.")
        else:
            feedback_parts.append("Needs optimization for better ATS compatibility.")

        feedback = " ".join(feedback_parts) + " " + " ".join(improvements[:2])

        return {
            "score": overall_score,
            "breakdown": breakdown,
            "missing_keywords": missing_keywords[:10],
            "strengths": strengths,
            "improvements": improvements,
            "feedback": feedback
        }
