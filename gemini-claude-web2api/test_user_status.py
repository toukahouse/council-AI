import ssl, urllib.request, urllib.parse, json, re, time, hashlib, sys, os

sys.path.insert(0, r'c:\projectcode\universal proxy\gemini-claude-web2api\gemini')
import gemini_web2api

gemini_web2api.CONFIG['cookie_file'] = r'c:\projectcode\universal proxy\gemini-claude-web2api\gemini\cookie.txt'
cookie_str, sapisid = gemini_web2api.load_cookie()
prefix = gemini_web2api.account_prefix()
ctx = ssl.create_default_context()

ts_xsrf = int(time.time())
h_xsrf = hashlib.sha1(f"{ts_xsrf} {sapisid} https://gemini.google.com".encode()).hexdigest()
auth_xsrf = f"SAPISIDHASH {ts_xsrf}_{h_xsrf}"
init_headers = {
    "Referer": f"https://gemini.google.com{prefix}/app",
    "X-Same-Domain": "1",
    "Cookie": cookie_str,
    "Authorization": auth_xsrf,
}
init_req = urllib.request.Request(f"https://gemini.google.com{prefix}/app", headers=init_headers)
init_resp = urllib.request.urlopen(init_req, timeout=10, context=ctx)
init_text = init_resp.read().decode("utf-8", errors="replace")
m = re.search(r'"SNlM0e":"([^"]+)"', init_text)
m_fsid = re.search(r'"FdrFJe":"([^"]+)"', init_text)
fresh_xsrf = m.group(1) if m else ""
fsid = m_fsid.group(1) if m_fsid else ""

# Call otAQ7b to get user status & model list
envelope = [[["otAQ7b", "[]", None, "generic"]]]
body_params = {
    "at": fresh_xsrf,
    "f.req": json.dumps(envelope)
}
body = urllib.parse.urlencode(body_params).encode()
reqid = int(time.time()) % 1000000
url = f"https://gemini.google.com{prefix}/_/BardChatUi/data/batchexecute?rpcids=otAQ7b&f.sid={fsid}&bl=boq_assistant-bard-web-server_20260224.08_p0&hl=en&_reqid={reqid}&rt=c"
headers = {
    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    "Origin": "https://gemini.google.com",
    "Referer": f"https://gemini.google.com{prefix}/",
    "X-Same-Domain": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0",
    "Cookie": cookie_str,
    "Authorization": gemini_web2api.make_sapisidhash(sapisid)
}
req = urllib.request.Request(url, data=body, headers=headers, method="POST")
resp = urllib.request.urlopen(req, timeout=15, context=ctx)
raw = resp.read().decode("utf-8", errors="replace")

for line in raw.split("\n"):
    if '"wrb.fr"' in line and '"otAQ7b"' in line:
        arr = json.loads(line)
        inner_str = arr[0][2]
        inner = json.loads(inner_str)
        print("Status code:", inner[14] if len(inner) > 14 else "N/A")
        print("Models list:", json.dumps(inner[15] if len(inner) > 15 else [], indent=2))
        print("Tier flags [16]:", json.dumps(inner[16] if len(inner) > 16 else [], indent=2))
        print("Capability flags [17]:", json.dumps(inner[17] if len(inner) > 17 else [], indent=2))
