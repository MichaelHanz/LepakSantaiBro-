import os
import httpx
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

router = APIRouter()

class AnchorSuggestionIn(BaseModel):
    budget_limit_rm: float
    basecamp_lat: float
    basecamp_lng: float
    query: str = "dinner restaurant" # e.g. "dinner", "lunch", "cafe"

@router.post("/anchor/suggest")
async def suggest_anchor(payload: AnchorSuggestionIn):
    """
    RAG-Lite architecture:
    1. Query Google Places API for 10 nearby places
    2. Feed results to Gemini with strict constraints
    3. Return structured JSON
    """
    gmaps_api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    
    if not gmaps_api_key or not gemini_api_key:
        # Fallback dummy data for demo if keys are missing
        return {
            "suggestions": [
                {
                    "name": "Nasi Kandar Pelita",
                    "estimated_cost_rm": 20,
                    "reason": "Fits the budget comfortably and is well-known.",
                    "distance_km": 0.5
                },
                {
                    "name": "Lot 10 Hutong Food Court",
                    "estimated_cost_rm": 35,
                    "reason": "Offers a variety of options under the RM50 limit.",
                    "distance_km": 1.2
                }
            ]
        }
        
    # Step 1: Fetch from Places API (Nearby Search)
    places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{payload.basecamp_lat},{payload.basecamp_lng}",
        "radius": 5000,
        "keyword": payload.query,
        "key": gmaps_api_key
    }
    
    async with httpx.AsyncClient() as client:
        places_res = await client.get(places_url, params=params)
        places_data = places_res.json()
        
        if places_data.get("status") != "OK":
            raise HTTPException(status_code=500, detail="Google Places API failed")
            
        results = places_data.get("results", [])[:10]
        
        # Format for Gemini context
        context_places = []
        for p in results:
            context_places.append(f"Name: {p.get('name')}, Rating: {p.get('rating')}, Address: {p.get('vicinity')}")
            
    # Step 2: Feed to Gemini
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_api_key}"
    prompt = f"""
    You are a travel assistant. You must parse these real locations and select up to 3 that best fit a budget of RM{payload.budget_limit_rm}.
    
    Locations:
    {chr(10).join(context_places)}
    
    Return the output STRICTLY as a JSON array of objects with the keys: 'name', 'estimated_cost_rm' (number), 'reason' (string), and 'distance_km' (number, estimate based on vicinity).
    Do NOT wrap the JSON in markdown code blocks. Just output raw JSON.
    """
    
    async with httpx.AsyncClient() as client:
        gemini_res = await client.post(gemini_url, json={
            "contents": [{"parts":[{"text": prompt}]}]
        })
        gemini_data = gemini_res.json()
        
        try:
            # Parse Gemini's JSON response
            text = gemini_data["candidates"][0]["content"]["parts"][0]["text"]
            import json
            suggestions = json.loads(text)
            return {"suggestions": suggestions}
        except Exception as e:
            print("Gemini Parsing Error:", e)
            raise HTTPException(status_code=500, detail="Failed to parse LLM response")
