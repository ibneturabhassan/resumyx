from pydantic import BaseModel, Field
from typing import List, Optional

class PersonalInfo(BaseModel):
    fullName: str
    email: str
    phone: str
    location: str
    linkedin: str
    github: str

class Skills(BaseModel):
    languages: List[str] = []
    databases: List[str] = []
    cloud: List[str] = []
    tools: List[str] = []

class Experience(BaseModel):
    id: str
    company: str
    role: str
    location: str
    startDate: str
    endDate: str
    description: List[str]

class Education(BaseModel):
    id: str
    institution: str
    degree: str
    location: str
    graduationDate: str

class Project(BaseModel):
    id: str
    name: str
    technologies: List[str] = []
    description: List[str]

class ResumeData(BaseModel):
    personalInfo: PersonalInfo
    additionalInfo: str = ""
    coverLetter: str = ""
    skills: Skills
    experience: List[Experience] = []
    education: List[Education] = []
    projects: List[Project] = []
    certifications: List[str] = []

class ResumeProfile(BaseModel):
    userId: str
    profileData: ResumeData
    targetJd: Optional[str] = ""

class ResumeProfileResponse(BaseModel):
    userId: str
    profileData: ResumeData
    targetJd: str
    createdAt: str
    updatedAt: str

class TailorRequest(BaseModel):
    profileData: ResumeData
    jobDescription: str

class CoverLetterRequest(BaseModel):
    profileData: ResumeData
    jobDescription: str
    instructions: Optional[str] = ""

class TailoredResumeData(BaseModel):
    personalInfo: PersonalInfo
    summary: str
    coverLetter: str = ""
    skills: Skills
    experience: List[Experience] = []
    education: List[Education] = []
    projects: List[Project] = []
    certifications: List[str] = []

class ATSScoreBreakdown(BaseModel):
    keyword_match: int  # 0-100
    formatting: int  # 0-100
    experience_relevance: int  # 0-100
    skills_alignment: int  # 0-100

class ATSScoreResponse(BaseModel):
    score: int  # Overall weighted score
    feedback: str
    breakdown: Optional[ATSScoreBreakdown] = None
    missing_keywords: List[str] = []
    strengths: List[str] = []
    improvements: List[str] = []

class ChangeDetail(BaseModel):
    section: str
    field: str
    before: str
    after: str
    reason: str

class TailoredResumeResponse(BaseModel):
    tailored: TailoredResumeData
    changes: List[ChangeDetail] = []
    keyword_analysis: dict = {}
    ats_improvement: dict = {}
