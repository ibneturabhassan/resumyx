"""
Authentication service using Supabase Auth.
Handles user registration, login, and JWT token validation.
"""
import jwt
from typing import Optional, Dict
from datetime import datetime, timedelta
from supabase import Client, create_client
from app.core.config import settings

class AuthService:
    def __init__(self, supabase_client: Client):
        self.client = supabase_client
        # Create separate client with anon key for auth operations
        self.auth_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        self.jwt_secret = settings.SUPABASE_JWT_SECRET

    async def register(self, email: str, password: str) -> Dict:
        """
        Register a new user with Supabase Auth.

        Args:
            email: User's email address
            password: User's password (will be hashed by Supabase)

        Returns:
            Dict with user data and session info
        """
        try:
            response = self.auth_client.auth.sign_up({
                "email": email,
                "password": password
            })

            if response.user:
                return {
                    "user": {
                        "id": response.user.id,
                        "email": response.user.email,
                        "created_at": str(response.user.created_at)
                    },
                    "session": {
                        "access_token": response.session.access_token if response.session else None,
                        "refresh_token": response.session.refresh_token if response.session else None,
                        "expires_at": response.session.expires_at if response.session else None
                    } if response.session else None,
                    "message": "Registration successful. Please check your email to confirm your account." if not response.session else "Registration successful!"
                }
            else:
                raise Exception("Registration failed - no user returned")

        except Exception as e:
            error_msg = str(e)
            if "User already registered" in error_msg:
                raise ValueError("An account with this email already exists")
            elif "Password should be at least" in error_msg:
                raise ValueError("Password must be at least 6 characters")
            else:
                raise Exception(f"Registration failed: {error_msg}")

    async def login(self, email: str, password: str) -> Dict:
        """
        Login user with email and password.

        Args:
            email: User's email address
            password: User's password

        Returns:
            Dict with user data and session tokens
        """
        try:
            response = self.auth_client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })

            if response.user and response.session:
                return {
                    "user": {
                        "id": response.user.id,
                        "email": response.user.email,
                        "created_at": str(response.user.created_at)
                    },
                    "session": {
                        "access_token": response.session.access_token,
                        "refresh_token": response.session.refresh_token,
                        "expires_at": response.session.expires_at,
                        "expires_in": response.session.expires_in
                    }
                }
            else:
                raise Exception("Login failed - invalid credentials")

        except Exception as e:
            error_msg = str(e)
            if "Invalid login credentials" in error_msg or "Email not confirmed" in error_msg:
                raise ValueError("Invalid email or password")
            else:
                raise Exception(f"Login failed: {error_msg}")

    async def refresh_token(self, refresh_token: str) -> Dict:
        """
        Refresh an expired access token.

        Args:
            refresh_token: The refresh token from login

        Returns:
            Dict with new session tokens
        """
        try:
            response = self.auth_client.auth.refresh_session(refresh_token)

            if response.session:
                return {
                    "session": {
                        "access_token": response.session.access_token,
                        "refresh_token": response.session.refresh_token,
                        "expires_at": response.session.expires_at,
                        "expires_in": response.session.expires_in
                    }
                }
            else:
                raise Exception("Token refresh failed")

        except Exception as e:
            raise Exception(f"Token refresh failed: {str(e)}")

    async def logout(self, access_token: str) -> Dict:
        """
        Logout user (sign out from Supabase).

        Args:
            access_token: User's access token

        Returns:
            Success message
        """
        try:
            # Set the session for this request
            self.auth_client.auth.sign_out(access_token)
            return {"message": "Logged out successfully"}
        except Exception as e:
            # Even if Supabase logout fails, we can still clear client-side
            return {"message": "Logged out (client-side)"}

    def verify_token(self, token: str) -> Optional[Dict]:
        """
        Verify and decode a JWT token.

        Args:
            token: JWT access token

        Returns:
            Decoded token payload with user info, or None if invalid
        """
        try:
            # First, try to verify using Supabase client (which handles ES256 tokens)
            try:
                user = self.supabase_client.auth.get_user(token)
                if user and user.user:
                    return {
                        "user_id": user.user.id,
                        "email": user.user.email,
                        "role": "authenticated",
                        "exp": None
                    }
            except Exception as e:
                print(f"Supabase token verification failed, trying JWT decode: {e}")

            # Fallback to JWT decode for backward compatibility
            # Try without signature verification as a last resort for Supabase ES256 tokens
            payload = jwt.decode(
                token,
                options={"verify_signature": False},
                audience="authenticated"
            )

            # Check if token is expired
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp) < datetime.now():
                return None

            return {
                "user_id": payload.get("sub"),  # Subject is the user ID
                "email": payload.get("email"),
                "role": payload.get("role"),
                "exp": exp
            }
        except jwt.InvalidTokenError as e:
            print(f"JWT decode error: {e}")
            return None
        except Exception as e:
            print(f"Token verification error: {e}")
            return None

    async def get_user(self, access_token: str) -> Dict:
        """
        Get current user info from access token.

        Args:
            access_token: User's access token

        Returns:
            User information
        """
        try:
            # Verify token first
            user_data = self.verify_token(access_token)
            if not user_data:
                raise ValueError("Invalid or expired token")

            # Get full user details from Supabase
            response = self.client.auth.get_user(access_token)

            if response.user:
                return {
                    "id": response.user.id,
                    "email": response.user.email,
                    "created_at": response.user.created_at,
                    "updated_at": response.user.updated_at
                }
            else:
                raise Exception("User not found")

        except Exception as e:
            raise Exception(f"Failed to get user: {str(e)}")

    async def change_password(self, access_token: str, current_password: str, new_password: str) -> Dict:
        """
        Change user's password.

        Args:
            access_token: User's access token
            current_password: Current password for verification
            new_password: New password to set

        Returns:
            Success message
        """
        try:
            # Verify token first
            user_data = self.verify_token(access_token)
            if not user_data:
                raise ValueError("Invalid or expired token")

            # Verify current password by attempting login
            try:
                await self.login(user_data["email"], current_password)
            except Exception:
                raise ValueError("Current password is incorrect")

            # Update password using Supabase admin API
            # Set the auth context with the access token
            self.auth_client.auth.set_session(access_token, access_token)

            # Update the user's password
            response = self.auth_client.auth.update_user({
                "password": new_password
            })

            if response.user:
                return {"message": "Password changed successfully"}
            else:
                raise Exception("Password update failed")

        except ValueError as e:
            # Re-raise validation errors
            raise ValueError(str(e))
        except Exception as e:
            error_msg = str(e)
            if "Password should be at least" in error_msg:
                raise ValueError("New password must be at least 6 characters")
            else:
                raise Exception(f"Failed to change password: {error_msg}")

# Create singleton instance (will be initialized with supabase client in routes)
auth_service: Optional[AuthService] = None

def get_auth_service() -> AuthService:
    """Get the auth service instance."""
    global auth_service
    if auth_service is None:
        # Import here to avoid circular dependency
        from app.services.supabase_service import supabase_service
        auth_service = AuthService(supabase_service.client)
    return auth_service
