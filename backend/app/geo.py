"""Keyless geo helpers: Nominatim for geocoding, OSRM for travel time (SPEC.md 3)."""

from __future__ import annotations

import httpx

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OSRM_URL = "https://router.project-osrm.org/route/v1/foot"
USER_AGENT = "santai-lepak-bro/1.0 (hackathon demo)"


async def geocode(place: str) -> tuple[float, float] | None:
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            NOMINATIM_URL,
            params={"q": place, "format": "json", "limit": 1},
            headers={"User-Agent": USER_AGENT},
        )
    response.raise_for_status()
    results = response.json()
    if not results:
        return None
    return float(results[0]["lat"]), float(results[0]["lon"])


async def route(
    origin: tuple[float, float], destination: tuple[float, float]
) -> dict[str, float] | None:
    coords = f"{origin[1]},{origin[0]};{destination[1]},{destination[0]}"
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(f"{OSRM_URL}/{coords}", params={"overview": "false"})
    response.raise_for_status()
    payload = response.json()
    routes = payload.get("routes") or []
    if not routes:
        return None
    return {
        "travel_time_minutes": routes[0]["duration"] / 60,
        "distance_km": routes[0]["distance"] / 1000,
    }
