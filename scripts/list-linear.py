import json, urllib.request, base64
from pathlib import Path

p = Path(r"C:\Users\ADMIN\vietnamese-eden-mvp\.env.local")
key_b64 = None
for line in p.read_text(encoding='utf-8').splitlines():
    s = line.strip()
    if s.startswith('LINEAR_API_KEY_B64=***        key_b64 = s.split('=', 1)[1].strip().strip('"')
        break
api_key = base64.b64decode(key_b64).decode().strip()

query = '''
query {
  issues(
    filter: { 
      team: { key: { eq: "ALE" } }, 
      state: { type: { nin: ["completed", "canceled"] } } 
    }
    first: 10
    sortBy: priority
  ) {
    nodes {
      identifier
      title
      priority
      state { name }
    }
  }
}
'''
req = urllib.request.Request(
    'https://api.linear.app/graphql',
    data=json.dumps({'query': query}).encode(),
    headers={'Authorization': api_key, 'Content-Type': 'application/json'}
)
resp = json.loads(urllib.request.urlopen(req, timeout=15).read().decode())
issues = resp['data']['issues']['nodes']
print(f'Active issues: {len(issues)}')
for i in issues:
    p_label = ['','Urgent','High','Medium','Low','No'][i['priority']]
    print(f'  {i["identifier"]} [{p_label}] {i["state"]["name"]} — {i["title"][:80]}')
