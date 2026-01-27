"""
Authentication API endpoints.
Handles user registration, login, logout, and token management.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.models.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    ChangePasswordRequest,
    AuthResponse,
    MessageResponse,
    UserResponse,
    SessionResponse
)
from app.services.auth_service import get_auth_service, AuthService
from app.core.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Register a new user with email and password.

    - **email**: Valid email address
    - **password**: Password (minimum 6 characters)

    Returns user data and session tokens (if email confirmation is disabled).
    If email confirmation is enabled, user must confirm email before logging in.
    """
    try:
        result = await auth_service.register(request.email, request.password)

        return AuthResponse(
            user=UserResponse(
                id=result["user"]["id"],
                email=result["user"]["email"],
                created_at=result["user"]["created_at"]
            ),
            session=SessionResponse(**result["session"]) if result.get("session") else None,
            message=result.get("message")
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Login with email and password.

    - **email**: User's email address
    - **password**: User's password

    Returns user data and session tokens (access_token and refresh_token).
    Store the access_token and use it in Authorization header for authenticated requests.
    """
    try:
        result = await auth_service.login(request.email, request.password)

        return AuthResponse(
            user=UserResponse(
                id=result["user"]["id"],
                email=result["user"]["email"],
                created_at=result["user"]["created_at"]
            ),
            session=SessionResponse(**result["session"])
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/refresh", response_model=SessionResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Refresh an expired access token using the refresh token.

    - **refresh_token**: The refresh token received during login

    Returns new session tokens.
    """
    try:
        result = await auth_service.refresh_token(request.refresh_token)
        return SessionResponse(**result["session"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/logout", response_model=MessageResponse)
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Logout the current user.

    Requires Authorization header with Bearer token.
    Invalidates the session on the server side.
    """
    try:
        result = await auth_service.logout(credentials.credentials)
        return MessageResponse(message=result["message"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    user: dict = Depends(get_current_user)
):
    """
    Get current authenticated user's information.

    Requires Authorization header with Bearer token.
    Returns user data from the token.
    """
    return UserResponse(
        id=user["user_id"],
        email=user["email"],
        created_at=""  # We don't have this in the token payload
    )

@router.get("/verify")
async def verify_token(
    user: dict = Depends(get_current_user)
):
    """
    Verify if the provided token is valid.

    Requires Authorization header with Bearer token.
    Returns success if token is valid, 401 if invalid/expired.
    """
    return {
        "valid": True,
        "user_id": user["user_id"],
        "email": user["email"]
    }

@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    request: ChangePasswordRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Change the current user's password.

    - **current_password**: Current password for verification
    - **new_password**: New password to set (minimum 6 characters)

    Requires Authorization header with Bearer token.
    Returns success message if password is changed successfully.
    """
    try:
        result = await auth_service.change_password(
            credentials.credentials,
            request.current_password,
            request.new_password
        )
        return MessageResponse(message=result["message"])
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
