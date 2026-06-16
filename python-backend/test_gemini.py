import asyncio
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
raw = os.getenv('GEMINI_API_KEY')
GEMINI_API_KEY = raw.strip() if raw else None
print('Key from env:', GEMINI_API_KEY[:4], '...', GEMINI_API_KEY[-4:])

gemini_client = genai.Client(api_key=GEMINI_API_KEY)

async def test():
    prompt = "Return ONLY a valid JSON object with the following schema: { 'rationale': 'test', 'factors': [] }"
    try:
        response = await gemini_client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
            )
        )
        print('Success:', response.text)
    except Exception as e:
        print('Error:', type(e), e)

asyncio.run(test())
