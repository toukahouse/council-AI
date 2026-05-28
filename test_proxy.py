import asyncio
import browser_cookie3
from gemini_webapi import GeminiClient

async def main():
    browser = "edge"
    psid_auto, psidts_auto = None, None
    try:
        cj = browser_cookie3.edge(domain_name=".google.com")
        for cookie in cj:
            if cookie.name == "__Secure-1PSID":
                psid_auto = cookie.value
            elif cookie.name == "__Secure-1PSIDTS":
                psidts_auto = cookie.value
    except Exception as e:
        print("Failed to get cookies:", e)
        return

    print("Got cookies:", psid_auto[:10], "...")
    client = GeminiClient(secure_1psid=psid_auto, secure_1psidts=psidts_auto)
    await client.init()
    print("Client initialized")
    
    chat_session = client.start_chat(model="gemini-3-pro-plus")
    
    prompt = "Hello, how are you? This is a test."
    print("Sending prompt...")
    response = await chat_session.send_message(prompt=prompt)
    print("Response:", response.text)

if __name__ == "__main__":
    import os
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
