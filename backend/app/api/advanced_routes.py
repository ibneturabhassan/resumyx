"""Advanced AI features: batch processing, analytics, ranking"""
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from app.models.resume import ResumeData, TailorRequest
from app.services.content_analyzer import BulletPointRanker, HallucinationDetector
from app.services.ai_settings_service import ai_settings_service
from app.services.ai_service_factory import AIServiceFactory
from app.core.auth_middleware import get_current_user
from typing import Dict, Any, List
from pydantic import BaseModel
import asyncio

router = APIRouter()

class BatchTailorRequest(BaseModel):
    profileData: ResumeData
    jobDescriptions: List[str]  # Multiple job descriptions

class RankBulletsRequest(BaseModel):
    profileData: ResumeData
    jobDescription: str
    keep_top_n: int = 5

class VerifyAccuracyRequest(BaseModel):
    original: ResumeData
    tailored: ResumeData

@router.post("/ai/batch-tailor")
async def batch_tailor_resumes(
    request: BatchTailorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """
    Tailor resume for multiple jobs simultaneously
    Returns multiple tailored versions
    """
    try:
        user_id = current_user["user_id"]

        # Get user's AI settings
        user_config = await ai_settings_service.get_user_settings(user_id)
        if not user_config:
            raise HTTPException(
                status_code=status.HTTP_428_PRECONDITION_REQUIRED,
                detail="AI provider not configured"
            )

        ai_service = AIServiceFactory.create_service(user_config)

        # Process all jobs in parallel
        async def tailor_for_job(job_desc: str):
            try:
                # Tailor all sections in parallel for each job
                results = await asyncio.gather(
                    ai_service.tailor_summary(
                        request.profileData.additionalInfo,
                        request.profileData.skills,
                        request.profileData.experience,
                        job_desc
                    ),
                    ai_service.tailor_experience(
                        request.profileData.experience,
                        job_desc
                    ),
                    ai_service.tailor_skills(
                        request.profileData.skills,
                        job_desc
                    ),
                    return_exceptions=True
                )

                summary, experience, skills = results

                return {
                    "job_description": job_desc[:100] + "...",
                    "summary": summary if not isinstance(summary, Exception) else "",
                    "experience_count": len(experience) if isinstance(experience, list) else 0,
                    "status": "success"
                }
            except Exception as e:
                return {
                    "job_description": job_desc[:100] + "...",
                    "status": "error",
                    "error": str(e)
                }

        # Limit to 5 jobs max to prevent abuse
        job_descriptions = request.jobDescriptions[:5]

        # Process all jobs in parallel
        results = await asyncio.gather(*[
            tailor_for_job(job_desc) for job_desc in job_descriptions
        ])

        return {
            "total_jobs": len(results),
            "results": results,
            "message": f"Processed {len(results)} job descriptions"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/ai/rank-bullets")
async def rank_experience_bullets(
    request: RankBulletsRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Rank and prioritize bullet points by relevance
    Returns top N most relevant bullets per experience
    """
    try:
        ranker = BulletPointRanker()
        ranked_experience = ranker.rank_experience_bullets(
            request.profileData.experience,
            request.jobDescription,
            request.keep_top_n
        )

        return {
            "ranked_experience": [exp.model_dump() for exp in ranked_experience],
            "message": f"Ranked and kept top {request.keep_top_n} bullets per role"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/ai/verify-accuracy")
async def verify_tailored_accuracy(
    request: VerifyAccuracyRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Verify that tailored resume doesn't contain fabricated information
    Checks for hallucinations and data integrity
    """
    try:
        detector = HallucinationDetector()

        # Verify experience accuracy
        verification = detector.verify_experience_accuracy(
            request.original.experience,
            request.tailored.experience
        )

        return {
            "verified": verification["safe"],
            "issues": verification["issues"],
            "message": "Resume verified" if verification["safe"] else "Issues detected"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/ai/cache/stats")
async def get_cache_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get AI response cache statistics"""
    from app.services.cache_service import ai_cache

    stats = ai_cache.stats()
    return {
        "cache_stats": stats,
        "message": "Cache statistics retrieved"
    }


@router.post("/ai/cache/clear")
async def clear_cache(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Clear AI response cache (admin/dev feature)"""
    from app.services.cache_service import ai_cache

    ai_cache.clear()
    return {"message": "Cache cleared successfully"}
