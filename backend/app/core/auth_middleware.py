"""
Authentication middleware for FastAPI.
Validates JWT tokens and attaches user info to requests.
"""
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.services.auth_service import get_auth_service

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = None
) -> Optional[dict]:
    """
    Dependency to get current authenticated user from JWT token.

    Args:
        credentials: HTTP Bearer credentials with JWT token

    Returns:
        User data from token, or None if not authenticated

    Raises:
        HTTPException: If token is invalid or expired
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    auth_service = get_auth_service()
    user_data = auth_service.verify_token(token)

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_data

async def get_current_user_optional(
    request: Request
) -> Optional[dict]:
    """
    Optional authentication - doesn't fail if no token provided.
    Useful for endpoints that work with or without authentication.

    Args:
        request: FastAPI request object

    Returns:
        User data from token, or None if not authenticated
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]
    auth_service = get_auth_service()

    return auth_service.verify_token(token)

def require_auth(user: Optional[dict] = None) -> dict:
    """
    Helper function to require authentication.
    Use in route handlers to ensure user is authenticated.

    Args:
        user: User data from get_current_user dependency

    Returns:
        User data

    Raises:
        HTTPException: If user is not authenticated
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return user
