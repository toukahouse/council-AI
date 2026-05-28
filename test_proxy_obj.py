import json
import asyncio
from dotenv import load_dotenv
import os
from gemini_webapi import GeminiClient
import sys

load_dotenv()

async def main():
    psid = os.environ.get("GEMINI_COOKIE_1PSID")
    psidts = os.environ.get("GEMINI_COOKIE_1PSIDTS")
    model_name = "gemini-3-flash-thinking" # Try to use the thinking model

    try:
        client = GeminiClient(secure_1psid=psid, secure_1psidts=psidts)
        await client.init()
        chat_session = client.start_chat(model=model_name)
        response = await chat_session.send_message(prompt="Solve 1+1 and explain your reasoning.")
        
        # Dump properties of response
        with open("response_dump.txt", "w") as f:
            f.write(str(dir(response)) + "\n\n")
            for attr in dir(response):
                if not attr.startswith("_"):
                    try:
                        f.write(f"{attr}: {getattr(response, attr)}\n")
                    except Exception as e:
                        f.write(f"{attr}: Error {e}\n")
    except Exception as e:
        with open("response_dump.txt", "w") as f:
            f.write(f"Error: {e}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
