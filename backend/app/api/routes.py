from fastapi import APIRouter, HTTPException, status, Depends
from app.models.resume import (
    ResumeProfile,
    ResumeData,
    TailoredResumeData,
    TailorRequest,
    CoverLetterRequest,
    ATSScoreResponse,
    ChangeDetail,
    TailoredResumeResponse
)
from app.services.supabase_service import supabase_service
from app.services.ai_settings_service import ai_settings_service
from app.services.ai_service_factory import AIServiceFactory
from app.services.base_ai_service import BaseAIService
from app.services.enhanced_ats_scorer import EnhancedATSScorer
from app.core.auth_middleware import get_current_user
from typing import Optional, Dict, Any, List
import asyncio
import json

router = APIRouter()

async def get_ai_service_for_user(user_id: Optional[str] = None) -> BaseAIService:
    """Get AI service instance based on user preferences (required)"""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User authentication required for AI operations"
        )

    # Get user's AI settings
    user_config = await ai_settings_service.get_user_settings(user_id)
    if not user_config:
        raise HTTPException(
            status_code=status.HTTP_428_PRECONDITION_REQUIRED,
            detail="AI provider not configured. Please configure your AI settings in the AI Settings page before using AI features."
        )

    return AIServiceFactory.create_service(user_config)

# Health check
@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "resumyx-api"}

# Profile endpoints
@router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """Get user profile"""
    profile = await supabase_service.get_profile(user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile

@router.post("/profile")
async def save_profile(profile: ResumeProfile):
    """Save or update user profile"""
    success = await supabase_service.save_profile(
        profile.userId,
        profile.profileData,
        profile.targetJd or ""
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save profile"
        )
    return {"message": "Profile saved successfully", "userId": profile.userId}

@router.delete("/profile/{user_id}")
async def delete_profile(user_id: str):
    """Delete user profile"""
    success = await supabase_service.delete_profile(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete profile"
        )
    return {"message": "Profile deleted successfully"}

# AI endpoints
@router.post("/ai/generate-summary")
async def generate_summary(
    data: dict,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate professional summary from experience"""
    experience = data.get("experience", "")
    user_id = current_user["user_id"]

    if not experience:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Experience data is required"
        )

    ai_service = await get_ai_service_for_user(user_id)
    summary = await ai_service.generate_summary(experience)
    return {"summary": summary}

@router.post("/ai/tailor-summary")
async def tailor_summary_endpoint(
    request: TailorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Tailor professional summary for specific job"""
    try:
        user_id = current_user["user_id"]
        ai_service = await get_ai_service_for_user(user_id)

        summary = await ai_service.tailor_summary(
            request.profileData.additionalInfo,
            request.profileData.skills,
            request.profileData.experience,
            request.jobDescription
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/ai/tailor-experience")
async def tailor_experience_endpoint(
    request: TailorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Tailor work experience for specific job"""
    try:
        user_id = current_user["user_id"]
        ai_service = await get_ai_service_for_user(user_id)

        experience = await ai_service.tailor_experience(
            request.profileData.experience,
            request.jobDescription
        )
        return {"experience": [exp.model_dump() for exp in experience]}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/ai/tailor-skills")
async def tailor_skills_endpoint(
    request: TailorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Tailor skills for specific job"""
    try:
        user_id = current_user["user_id"]
        ai_service = await get_ai_service_for_user(user_id)

        skills = await ai_service.tailor_skills(
            request.profileData.skills,
            request.jobDescription
        )
        return {"skills": skills}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/ai/tailor-projects")
async def tailor_projects_endpoint(
    request: TailorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Tailor projects for specific job"""
    try:
        user_id = current_user["user_id"]
        ai_service = await get_ai_service_for_user(user_id)

        projects = await ai_service.tailor_projects(
            request.profileData.projects,
            request.jobDescription
        )
        return {"projects": [proj.model_dump() for proj in projects]}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/ai/tailor-education")
async def tailor_education_endpoint(
    request: TailorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Tailor education for specific job"""
    try:
        user_id = current_user["user_id"]
        ai_service = await get_ai_service_for_user(user_id)

        education = await ai_service.tailor_education(
            request.profileData.education,
            request.jobDescription
        )
        return {"education": [edu.model_dump() for edu in education]}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/ai/tailor-resume")
async def tailor_resume(
    request: TailorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Tailor resume for specific job with parallel processing and change tracking"""
    try:
        # Get AI service using authenticated user
        user_id = current_user["user_id"]
        ai_service = await get_ai_service_for_user(user_id)

        # PARALLEL PROCESSING: Tailor all sections simultaneously
        results = await asyncio.gather(
            ai_service.tailor_summary(
                request.profileData.additionalInfo,
                request.profileData.skills,
                request.profileData.experience,
                request.jobDescription
            ),
            ai_service.tailor_experience(
                request.profileData.experience,
                request.jobDescription
            ),
            ai_service.tailor_skills(
                request.profileData.skills,
                request.jobDescription
            ),
            ai_service.tailor_projects(
                request.profileData.projects,
                request.jobDescription
            ),
            ai_service.tailor_education(
                request.profileData.education,
                request.jobDescription
            ),
            return_exceptions=True  # Don't fail entire operation if one section fails
        )

        # Unpack results
        tailored_summary, tailored_experience, tailored_skills, tailored_projects, tailored_education = results

        # Handle exceptions in individual results
        if isinstance(tailored_summary, Exception):
            print(f"Summary tailoring failed: {tailored_summary}")
            tailored_summary = ""
        if isinstance(tailored_experience, Exception):
            print(f"Experience tailoring failed: {tailored_experience}")
            tailored_experience = request.profileData.experience
        if isinstance(tailored_skills, Exception):
            print(f"Skills tailoring failed: {tailored_skills}")
            tailored_skills = request.profileData.skills
        if isinstance(tailored_projects, Exception):
            print(f"Projects tailoring failed: {tailored_projects}")
            tailored_projects = request.profileData.projects
        if isinstance(tailored_education, Exception):
            print(f"Education tailoring failed: {tailored_education}")
            tailored_education = request.profileData.education

        # Track changes
        changes: List[ChangeDetail] = []

        # Track summary changes
        if tailored_summary:
            changes.append(ChangeDetail(
                section="Summary",
                field="summary",
                before=request.profileData.additionalInfo[:100] + "..." if len(request.profileData.additionalInfo) > 100 else request.profileData.additionalInfo,
                after=tailored_summary[:100] + "..." if len(tailored_summary) > 100 else tailored_summary,
                reason="Generated job-specific summary"
            ))

        # Track experience changes
        for i, (orig_exp, tail_exp) in enumerate(zip(request.profileData.experience, tailored_experience if isinstance(tailored_experience, list) else [])):
            if orig_exp.description != tail_exp.description:
                changes.append(ChangeDetail(
                    section="Experience",
                    field=f"{orig_exp.company} - {orig_exp.role}",
                    before=f"{len(orig_exp.description)} bullets",
                    after=f"{len(tail_exp.description)} bullets (tailored)",
                    reason="Optimized for job requirements"
                ))

        # Create tailored resume data
        tailored_data = TailoredResumeData(
            personalInfo=request.profileData.personalInfo,
            summary=tailored_summary,
            coverLetter=request.profileData.coverLetter,
            skills=tailored_skills,
            experience=tailored_experience if isinstance(tailored_experience, list) else request.profileData.experience,
            education=tailored_education if isinstance(tailored_education, list) else request.profileData.education,
            projects=tailored_projects if isinstance(tailored_projects, list) else request.profileData.projects,
            certifications=request.profileData.certifications
        )

        # Calculate keyword analysis
        scorer = EnhancedATSScorer()
        keyword_score, missing_keywords = scorer.calculate_keyword_match(
            request.profileData,
            request.jobDescription
        )

        keyword_analysis = {
            "matched_percentage": keyword_score,
            "missing_keywords": missing_keywords[:5]
        }

        return {
            "tailoredResume": tailored_data.model_dump(),
            "changes": [c.model_dump() for c in changes],
            "keywordAnalysis": keyword_analysis
        }

    except Exception as e:
        error_msg = str(e)
        print(f"Error tailoring resume: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )

@router.post("/ai/ats-score", response_model=ATSScoreResponse)
async def calculate_ats_score(
    request: TailorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Calculate comprehensive ATS compatibility score with detailed breakdown"""
    try:
        # Use enhanced ATS scorer for detailed analysis
        scorer = EnhancedATSScorer()
        result = scorer.calculate_comprehensive_score(
            request.profileData,
            request.jobDescription
        )

        return ATSScoreResponse(
            score=result["score"],
            feedback=result["feedback"],
            breakdown=result["breakdown"],
            missing_keywords=result["missing_keywords"],
            strengths=result["strengths"],
            improvements=result["improvements"]
        )
    except Exception as e:
        error_msg = str(e)
        print(f"Error calculating ATS score: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )

@router.post("/ai/ats-score-llm")
async def calculate_ats_score_llm(
    request: TailorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Calculate ATS score using LLM analysis of complete assembled resume"""
    try:
        user_id = current_user["user_id"]
        ai_service = await get_ai_service_for_user(user_id)

        # Use AI service to analyze the complete assembled resume
        result = await ai_service.calculate_ats_score(
            request.profileData,
            request.jobDescription
        )

        # LLM returns a simpler format: {"score": 85, "feedback": "..."}
        # We'll enhance it with the heuristic breakdown for additional details
        scorer = EnhancedATSScorer()
        heuristic_result = scorer.calculate_comprehensive_score(
            request.profileData,
            request.jobDescription
        )

        return {
            "score": result.get("score", 0),
            "feedback": result.get("feedback", ""),
            "breakdown": heuristic_result["breakdown"],
            "missing_keywords": heuristic_result["missing_keywords"],
            "strengths": heuristic_result["strengths"],
            "improvements": heuristic_result["improvements"]
        }
    except Exception as e:
        error_msg = str(e)
        print(f"Error calculating LLM ATS score: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )

@router.post("/ai/generate-cover-letter")
async def generate_cover_letter(
    request: CoverLetterRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate personalized cover letter"""
    try:
        user_id = current_user["user_id"]
        ai_service = await get_ai_service_for_user(user_id)

        cover_letter = await ai_service.generate_cover_letter(
            request.profileData,
            request.jobDescription,
            request.instructions or ""
        )
        return {"coverLetter": cover_letter}
    except Exception as e:
        error_msg = str(e)
        print(f"Error generating cover letter: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )
