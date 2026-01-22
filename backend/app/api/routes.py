from fastapi import APIRouter, HTTPException, status, Depends
from app.models.resume import (
    ResumeProfile,
    ResumeData,
    TailoredResumeData,
    TailorRequest,
    CoverLetterRequest,
    ATSScoreResponse
)
from app.models.ai_settings import AISettingsConfig, AISettingsResponse
from app.services.supabase_service import supabase_service
from app.services.ai_provider_service import ai_provider_service
from app.core.auth_middleware import get_current_user, get_current_user_optional
from typing import Optional, Dict, Any

router = APIRouter()

# Health check
@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "resumyx-api"}

# AI Providers
@router.get("/ai/providers")
async def get_ai_providers():
    return {
        "providers": [
            {
                "value": "gemini",
                "label": "Gemini",
                "description": "Google Gemini models",
                "models": [
                    {"value": "gemini-2.0-flash-exp", "label": "Gemini 2.0 Flash", "description": "Fast multimodal model"},
                    {"value": "gemini-1.5-pro", "label": "Gemini 1.5 Pro", "description": "High quality reasoning model"},
                    {"value": "gemini-1.5-flash", "label": "Gemini 1.5 Flash", "description": "Fast and efficient model"}
                ]
            },
            {
                "value": "openai",
                "label": "OpenAI",
                "description": "OpenAI API models",
                "models": [
                    {"value": "gpt-4o", "label": "GPT-4o", "description": "Flagship multimodal model"},
                    {"value": "gpt-4o-mini", "label": "GPT-4o mini", "description": "Efficient multimodal model"}
                ]
            },
            {
                "value": "openrouter",
                "label": "OpenRouter",
                "description": "OpenRouter model hub",
                "models": [
                    {"value": "anthropic/claude-3.5-sonnet", "label": "Claude 3.5 Sonnet", "description": "High quality creative model"},
                    {"value": "openai/gpt-4o-mini", "label": "GPT-4o mini (OpenRouter)", "description": "OpenAI via OpenRouter"},
                    {"value": "google/gemini-1.5-pro", "label": "Gemini 1.5 Pro (OpenRouter)", "description": "Gemini via OpenRouter"}
                ]
            }
        ]
    }

# AI Settings
@router.get("/ai/settings", response_model=Optional[AISettingsResponse])
async def get_ai_settings(user: dict = Depends(get_current_user)):
    settings = await supabase_service.get_ai_settings(user["user_id"])
    if not settings:
        return None

    return AISettingsResponse(
        provider=settings.get("provider"),
        model=settings.get("model"),
        site_url=settings.get("site_url"),
        app_name=settings.get("app_name")
    )

@router.post("/ai/settings")
async def save_ai_settings(
    config: AISettingsConfig,
    user: dict = Depends(get_current_user)
):
    success = await supabase_service.save_ai_settings(user["user_id"], config.model_dump())
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save AI settings"
        )
    return {"message": "AI settings saved successfully"}

@router.delete("/ai/settings")
async def delete_ai_settings(user: dict = Depends(get_current_user)):
    success = await supabase_service.delete_ai_settings(user["user_id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete AI settings"
        )
    return {"message": "AI settings deleted successfully"}

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
    user: Optional[dict] = Depends(get_current_user_optional)
):
    """Generate professional summary from experience"""
    experience = data.get("experience", "")
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Experience data is required"
        )

    settings: Optional[Dict[str, Any]] = None
    if user:
        settings = await supabase_service.get_ai_settings(user["user_id"])
    summary = await ai_provider_service.generate_summary(experience, settings)
    return {"summary": summary}

@router.post("/ai/tailor-resume")
async def tailor_resume(
    request: TailorRequest,
    user: Optional[dict] = Depends(get_current_user_optional)
):
    """Tailor resume for specific job"""
    try:
        settings: Optional[Dict[str, Any]] = None
        if user:
            settings = await supabase_service.get_ai_settings(user["user_id"])

        # Tailor each section
        tailored_summary = await ai_provider_service.tailor_summary(
            request.profileData.additionalInfo,
            request.profileData.skills,
            request.profileData.experience,
            request.jobDescription,
            settings
        )

        tailored_experience = await ai_provider_service.tailor_experience(
            request.profileData.experience,
            request.jobDescription,
            settings
        )

        tailored_skills = await ai_provider_service.tailor_skills(
            request.profileData.skills,
            request.jobDescription,
            settings
        )

        tailored_projects = await ai_provider_service.tailor_projects(
            request.profileData.projects,
            request.jobDescription,
            settings
        )

        tailored_education = await ai_provider_service.tailor_education(
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error tailoring resume: {str(e)}"
        )

@router.post("/ai/ats-score", response_model=ATSScoreResponse)
async def calculate_ats_score(
    request: TailorRequest,
    user: Optional[dict] = Depends(get_current_user_optional)
):
    """Calculate ATS compatibility score"""
    try:
        settings: Optional[Dict[str, Any]] = None
        if user:
            settings = await supabase_service.get_ai_settings(user["user_id"])

        result = await ai_provider_service.calculate_ats_score(
            request.profileData,
            request.jobDescription,
            settings
        )
        return ATSScoreResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating ATS score: {str(e)}"
        )

@router.post("/ai/generate-cover-letter")
async def generate_cover_letter(
    request: CoverLetterRequest,
    user: Optional[dict] = Depends(get_current_user_optional)
):
    """Generate personalized cover letter"""
    try:
        settings: Optional[Dict[str, Any]] = None
        if user:
            settings = await supabase_service.get_ai_settings(user["user_id"])

        cover_letter = await ai_provider_service.generate_cover_letter(
            request.profileData,
            request.jobDescription,
            request.instructions or "",
            settings
        )
        return {"coverLetter": cover_letter}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating cover letter: {str(e)}"
        )
