import os
import httpx
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

router = APIRouter()

class EjectRequestIn(BaseModel):
    user_id: str
    current_lat: float
    current_lng: float
    trip_id: str

# Basecamp would typically be fetched from Supabase based on trip_id
# We hardcode a KL basecamp for the demo
BASECAMP_LAT = 3.1466
BASECAMP_LNG = 101.7111
BASECAMP_NAME = "Pavilion Hotel Kuala Lumpur"

def calculate_heuristic_price(distance_km: float, is_raining: bool = False, is_rush_hour: bool = False) -> float:
    base_fare = 5.0
    per_km_rate = 1.50
    surge_multiplier = 1.0
    
    if is_raining:
        surge_multiplier += 0.5
    if is_rush_hour:
        surge_multiplier += 0.5
        
    total = (base_fare + (distance_km * per_km_rate)) * surge_multiplier
    return round(total, 2)

@router.post("/eject/proxy")
async def trigger_proxy_eject(payload: EjectRequestIn):
    """
    Final Blueprint Proxy Extraction Engine.
    Uses Google Maps Distance Matrix API to calculate distance to Basecamp,
    then applies a deterministic pricing formula for Grab.
    """
    gmaps_api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not gmaps_api_key:
        # Fallback for demo without API key
        distance_km = 3.2
        duration_mins = 12
    else:
        # Call Google Maps Distance Matrix API
        url = "https://maps.googleapis.com/maps/api/distancematrix/json"
        params = {
            "origins": f"{payload.current_lat},{payload.current_lng}",
            "destinations": f"{BASECAMP_LAT},{BASECAMP_LNG}",
            "key": gmaps_api_key
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
            if data["status"] == "OK":
                element = data["rows"][0]["elements"][0]
                distance_km = element["distance"]["value"] / 1000.0
                duration_mins = element["duration"]["value"] / 60.0
            else:
                raise HTTPException(status_code=500, detail="Google Maps API failed")
    
    # Simulate surge pricing based on some logic (or random for demo)
    is_raining = False # Could hit a weather API here
    is_rush_hour = False
    
    cost_estimate = calculate_heuristic_price(distance_km, is_raining, is_rush_hour)
    
    # Log this ejection to Supabase (pseudo-code)
    # supabase.table("eject_events").insert({"member_id": payload.user_id, "grab_cost_estimate": cost_estimate}).execute()
    
    return {
        "destination_name": BASECAMP_NAME,
        "distance_km": round(distance_km, 1),
        "walking_duration_mins": round(duration_mins, 1),
        "grab_cost_estimate_rm": cost_estimate,
        "grab_deep_link": "grab://open?dropOffName=Basecamp"
    }
