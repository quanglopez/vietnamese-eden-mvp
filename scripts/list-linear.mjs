const fs = require('fs');
const https = require('https');

// Read LINEAR_API_KEY_B64 from .env.local, decode, use as API key
const envContent = fs.readFileSync('C:/Users/ADMIN/vietnamese-eden-mvp/.env.local', 'utf-8');
let apiKey = '';
for (const line of envContent.split(/\r?\n/)) {
  const m = line.match(/^LINEAR_API_KEY_B64=(.+)/);
  if (m) {
    apiKey = Buffer.from(m[1].trim().replace(/^"|"$/g, ''), 'base64').toString().trim();
    break;
  }
}

if (!apiKey) {
  console.error('LINEAR_API_KEY_B64 not found');
  process.exit(1);
}

const query = {
  query: `query {
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
  }`
};

const body = JSON.stringify(query);
const req = https.request('https://api.linear.app/graphql', {
  method: 'POST',
  headers: {
    'Authorization': apiKey,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const d = JSON.parse(data);
    if (d.errors) { console.error('GraphQL errors:', JSON.stringify(d.errors)); process.exit(1); }
    const issues = d.data.issues.nodes;
    console.log('Active issues:', issues.length);
    for (const i of issues) {
      const p = ['','Urgent','High','Medium','Low'][i.priority] || '';
      console.log(`  ${i.identifier} [${p}] ${i.state.name} — ${i.title.substring(0, 80)}`);
    }
  });
});
req.write(body);
req.end();
