from fastapi import APIRouter, HTTPException, status, Depends
from app.models.resume import (
    ResumeProfile,
    ResumeData,
    TailoredResumeData,
    TailorRequest,
    CoverLetterRequest,
    ATSScoreResponse
)
from app.models.ai_config import GeminiConfig
from app.services.supabase_service import supabase_service
from app.services.ai_settings_service import ai_settings_service
from app.services.ai_service_factory import AIServiceFactory
from app.services.base_ai_service import BaseAIService
from app.core.config import settings
from typing import Optional

router = APIRouter()

async def get_ai_service_for_user(user_id: Optional[str] = None) -> BaseAIService:
    """Get AI service instance based on user preferences or default"""
    if user_id:
        # Try to get user's preferred AI settings
        user_config = await ai_settings_service.get_user_settings(user_id)
        if user_config:
            return AIServiceFactory.create_service(user_config)

    # Fall back to default Gemini service
    return AIServiceFactory.get_default_service()

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
async def generate_summary(data: dict):
    """Generate professional summary from experience"""
    experience = data.get("experience", "")
    user_id = data.get("userId")  # Optional: use user's preferred AI

    if not experience:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Experience data is required"
        )

    ai_service = await get_ai_service_for_user(user_id)
    summary = await ai_service.generate_summary(experience)
    return {"summary": summary}

@router.post("/ai/tailor-resume")
async def tailor_resume(request: TailorRequest):
    """Tailor resume for specific job"""
    try:
        # Get AI service (user-specific or default)
        user_id = getattr(request.profileData, 'userId', None) if hasattr(request.profileData, 'userId') else None
        ai_service = await get_ai_service_for_user(user_id)

        # Tailor each section using the selected AI provider
        tailored_summary = await ai_service.tailor_summary(
            request.profileData.additionalInfo,
            request.profileData.skills,
            request.profileData.experience,
            request.jobDescription
        )

        tailored_experience = await ai_service.tailor_experience(
            request.profileData.experience,
            request.jobDescription
        )

        tailored_skills = await ai_service.tailor_skills(
            request.profileData.skills,
            request.jobDescription
        )

        tailored_projects = await ai_service.tailor_projects(
            request.profileData.projects,
            request.jobDescription
        )

        tailored_education = await ai_service.tailor_education(
            request.profileData.education,
            request.jobDescription
        )

        # Create tailored resume data
        tailored_data = TailoredResumeData(
            personalInfo=request.profileData.personalInfo,
            summary=tailored_summary,
            coverLetter=request.profileData.coverLetter,
            skills=tailored_skills,
            experience=tailored_experience,
            education=tailored_education,
            projects=tailored_projects,
            certifications=request.profileData.certifications
        )

        return {"tailoredResume": tailored_data.model_dump()}

    except Exception as e:
        error_msg = str(e)
        print(f"Error tailoring resume: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )

@router.post("/ai/ats-score", response_model=ATSScoreResponse)
async def calculate_ats_score(request: TailorRequest):
    """Calculate ATS compatibility score"""
    try:
        user_id = getattr(request.profileData, 'userId', None) if hasattr(request.profileData, 'userId') else None
        ai_service = await get_ai_service_for_user(user_id)

        result = await ai_service.calculate_ats_score(
            request.profileData,
            request.jobDescription
        )
        return ATSScoreResponse(**result)
    except Exception as e:
        error_msg = str(e)
        print(f"Error calculating ATS score: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )

@router.post("/ai/generate-cover-letter")
async def generate_cover_letter(request: CoverLetterRequest):
    """Generate personalized cover letter"""
    try:
        user_id = getattr(request.profileData, 'userId', None) if hasattr(request.profileData, 'userId') else None
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
