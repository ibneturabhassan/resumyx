from fastapi import APIRouter, HTTPException, status
from app.models.resume import (
    ResumeProfile,
    ResumeData,
    TailorRequest,
    CoverLetterRequest,
    ATSScoreResponse
)
from app.services.supabase_service import supabase_service
from app.services.gemini_service import gemini_service
from typing import Optional

router = APIRouter()

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
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Experience data is required"
        )

    summary = await gemini_service.generate_summary(experience)
    return {"summary": summary}

@router.post("/ai/tailor-resume")
async def tailor_resume(request: TailorRequest):
    """Tailor resume for specific job"""
    try:
        # Tailor each section
        tailored_summary = await gemini_service.tailor_summary(
            request.profileData.summary,
            request.profileData.skills,
            request.jobDescription
        )

        tailored_experience = await gemini_service.tailor_experience(
            request.profileData.experience,
            request.jobDescription
        )

        tailored_skills = await gemini_service.tailor_skills(
            request.profileData.skills,
            request.jobDescription
        )

        tailored_projects = await gemini_service.tailor_projects(
            request.profileData.projects,
            request.jobDescription
        )

        tailored_education = await gemini_service.tailor_education(
            request.profileData.education,
            request.jobDescription
        )

        # Create tailored resume data
        tailored_data = request.profileData.model_copy()
        tailored_data.summary = tailored_summary
        tailored_data.experience = tailored_experience
        tailored_data.skills = tailored_skills
        tailored_data.projects = tailored_projects
        tailored_data.education = tailored_education

        return {"tailoredResume": tailored_data.model_dump()}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error tailoring resume: {str(e)}"
        )

@router.post("/ai/ats-score", response_model=ATSScoreResponse)
async def calculate_ats_score(request: TailorRequest):
    """Calculate ATS compatibility score"""
    try:
        result = await gemini_service.calculate_ats_score(
            request.profileData,
            request.jobDescription
        )
        return ATSScoreResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating ATS score: {str(e)}"
        )

@router.post("/ai/generate-cover-letter")
async def generate_cover_letter(request: CoverLetterRequest):
    """Generate personalized cover letter"""
    try:
        cover_letter = await gemini_service.generate_cover_letter(
            request.profileData,
            request.jobDescription,
            request.instructions or ""
        )
        return {"coverLetter": cover_letter}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating cover letter: {str(e)}"
        )
