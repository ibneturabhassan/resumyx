"""Content analysis for ranking and validation"""
from typing import List, Dict
from app.models.resume import Experience
import re

class BulletPointRanker:
    """Ranks bullet points by relevance to job description"""

    @staticmethod
    def extract_important_terms(job_description: str) -> List[str]:
        """Extract key terms from job description"""
        # Split into words and filter
        words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.-]*\b', job_description.lower())

        # Common technical terms and action verbs get priority
        priority_terms = {
            'develop', 'design', 'implement', 'architect', 'lead', 'manage',
            'python', 'java', 'javascript', 'react', 'node', 'aws', 'azure',
            'docker', 'kubernetes', 'sql', 'nosql', 'api', 'microservices'
        }

        important = [w for w in words if w in priority_terms or len(w) > 6]
        return list(set(important))[:30]  # Top 30 unique terms

    @staticmethod
    def score_bullet(bullet: str, important_terms: List[str]) -> Dict:
        """Score a single bullet point"""
        bullet_lower = bullet.lower()

        # Count matching terms
        matches = sum(1 for term in important_terms if term in bullet_lower)

        # Check for quantification (numbers = good)
        has_numbers = bool(re.search(r'\d+', bullet))

        # Check for action verbs
        action_verbs = ['developed', 'designed', 'implemented', 'led', 'managed',
                       'created', 'built', 'architected', 'optimized', 'improved']
        has_action_verb = any(verb in bullet_lower for verb in action_verbs)

        # Calculate score (0-100)
        score = 0
        score += min(matches * 15, 60)  # Max 60 points for keyword matches
        score += 20 if has_numbers else 0  # 20 points for quantification
        score += 20 if has_action_verb else 0  # 20 points for action verb

        return {
            "bullet": bullet,
            "score": min(score, 100),
            "has_quantification": has_numbers,
            "keyword_matches": matches,
            "reason": f"{'Strong' if score >= 70 else 'Moderate' if score >= 40 else 'Weak'} relevance"
        }

    @staticmethod
    def rank_experience_bullets(
        experience: List[Experience],
        job_description: str,
        keep_top_n: int = 5
    ) -> List[Experience]:
        """Rank and filter bullets for each experience"""
        important_terms = BulletPointRanker.extract_important_terms(job_description)

        ranked_experience = []
        for exp in experience:
            # Score all bullets
            scored_bullets = [
                BulletPointRanker.score_bullet(bullet, important_terms)
                for bullet in exp.description
            ]

            # Sort by score (descending)
            scored_bullets.sort(key=lambda x: x["score"], reverse=True)

            # Keep top N bullets
            top_bullets = [b["bullet"] for b in scored_bullets[:keep_top_n]]

            # Create new experience with ranked bullets
            ranked_exp = Experience(
                id=exp.id,
                company=exp.company,
                role=exp.role,
                location=exp.location,
                startDate=exp.startDate,
                endDate=exp.endDate,
                description=top_bullets
            )
            ranked_experience.append(ranked_exp)

        return ranked_experience


class HallucinationDetector:
    """Detects when AI adds false information"""

    @staticmethod
    def extract_facts(text: str) -> Dict[str, List[str]]:
        """Extract checkable facts from text"""
        facts = {
            "numbers": re.findall(r'\d+(?:,\d+)*(?:\.\d+)?%?', text),
            "dates": re.findall(r'\b\d{4}\b', text),  # Years
            "technologies": []  # Would be enhanced with NER
        }
        return facts

    @staticmethod
    def check_fact_preservation(
        original_text: str,
        tailored_text: str
    ) -> Dict:
        """Check if tailored version preserves original facts"""
        original_facts = HallucinationDetector.extract_facts(original_text)
        tailored_facts = HallucinationDetector.extract_facts(tailored_text)

        # Check for new numbers (potential fabrication)
        new_numbers = [n for n in tailored_facts["numbers"]
                       if n not in original_facts["numbers"]]

        # Check for new dates
        new_dates = [d for d in tailored_facts["dates"]
                     if d not in original_facts["dates"]]

        fabricated = len(new_numbers) > 0 or len(new_dates) > 0

        return {
            "safe": not fabricated,
            "new_numbers": new_numbers,
            "new_dates": new_dates,
            "warning": "Detected potential fabricated data" if fabricated else None
        }

    @staticmethod
    def verify_experience_accuracy(
        original_experience: List[Experience],
        tailored_experience: List[Experience]
    ) -> Dict:
        """Verify that experience hasn't been fabricated"""
        issues = []

        for orig, tail in zip(original_experience, tailored_experience):
            # Check company name hasn't changed
            if orig.company != tail.company:
                issues.append(f"Company name changed: {orig.company} -> {tail.company}")

            # Check role hasn't changed substantially
            if orig.role != tail.role:
                issues.append(f"Role changed: {orig.role} -> {tail.role}")

            # Check dates haven't changed
            if orig.startDate != tail.startDate or orig.endDate != tail.endDate:
                issues.append(f"Dates changed for {orig.company}")

            # Check each bullet for fabrication
            for orig_bullet, tail_bullet in zip(orig.description, tail.description):
                check = HallucinationDetector.check_fact_preservation(
                    orig_bullet,
                    tail_bullet
                )
                if not check["safe"]:
                    issues.append(
                        f"Potential fabrication in {orig.company}: {check['warning']}"
                    )

        return {
            "safe": len(issues) == 0,
            "issues": issues,
            "verified": len(issues) == 0
        }
