import os
import json
from google import genai
from google.genai import types

def main():
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    model = "gemini-2.5-pro"
    contents = [types.Content(role="user", parts=[types.Part.from_text(text="Why is the sky blue? Explain in 1 sentence.")])]
    config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="HIGH")
    )
    for chunk in client.models.generate_content_stream(model=model, contents=contents, config=config):
        print(chunk.model_dump_json(indent=2))
        break

if __name__ == "__main__":
    main()
