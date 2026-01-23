"""Smart caching service for AI responses"""
import hashlib
import json
from typing import Optional, Any
from datetime import datetime, timedelta

class SimpleCache:
    """In-memory cache with TTL support"""

    def __init__(self, default_ttl_hours: int = 24):
        self._cache: dict = {}
        self._timestamps: dict = {}
        self.default_ttl = timedelta(hours=default_ttl_hours)

    def _generate_key(self, *args, **kwargs) -> str:
        """Generate cache key from arguments"""
        key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True)
        return hashlib.md5(key_data.encode()).hexdigest()

    def _is_expired(self, key: str) -> bool:
        """Check if cache entry is expired"""
        if key not in self._timestamps:
            return True
        return datetime.now() - self._timestamps[key] > self.default_ttl

    def get(self, *args, **kwargs) -> Optional[Any]:
        """Get value from cache"""
        key = self._generate_key(*args, **kwargs)

        if key in self._cache and not self._is_expired(key):
            print(f"Cache HIT for key: {key[:8]}...")
            return self._cache[key]

        print(f"Cache MISS for key: {key[:8]}...")
        return None

    def set(self, value: Any, *args, **kwargs):
        """Set value in cache"""
        key = self._generate_key(*args, **kwargs)
        self._cache[key] = value
        self._timestamps[key] = datetime.now()
        print(f"Cache SET for key: {key[:8]}...")

    def clear_expired(self):
        """Remove expired entries"""
        expired_keys = [k for k in self._cache.keys() if self._is_expired(k)]
        for key in expired_keys:
            del self._cache[key]
            del self._timestamps[key]
        print(f"Cleared {len(expired_keys)} expired cache entries")

    def clear(self):
        """Clear all cache"""
        self._cache.clear()
        self._timestamps.clear()
        print("Cache cleared")

    def stats(self) -> dict:
        """Get cache statistics"""
        return {
            "total_entries": len(self._cache),
            "expired_entries": sum(1 for k in self._cache.keys() if self._is_expired(k))
        }


# Global cache instance
ai_cache = SimpleCache(default_ttl_hours=24)


def cache_ai_response(func):
    """Decorator to cache AI service responses"""
    async def wrapper(*args, **kwargs):
        # Generate cache key
        cache_key_args = (func.__name__, str(args), str(kwargs))

        # Try to get from cache
        cached_result = ai_cache.get(*cache_key_args)
        if cached_result is not None:
            return cached_result

        # Call function if not cached
        result = await func(*args, **kwargs)

        # Store in cache
        ai_cache.set(result, *cache_key_args)

        return result

    return wrapper
