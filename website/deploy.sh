#!/usr/bin/env bash
# AgentClaim deploy: build the static site and upload dist/ to Vercel via the
# REST API (token comes from the Secure Vault connection custom.vercel).
# Usage: ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

npm run build

python3 - <<'PYEOF'
import json, os
files = []
for root, _, names in os.walk('dist'):
    for n in names:
        p = os.path.join(root, n)
        # NOTE: raw file text, NOT base64 — Vercel serves `data` verbatim.
        with open(p, 'r', encoding='utf-8') as f:
            files.append({'file': os.path.relpath(p, 'dist'), 'data': f.read()})
json.dump({'name': 'agentclaim', 'files': files, 'target': 'production',
           'projectSettings': {'framework': None}},
          open('/tmp/agentclaim-deploy.json', 'w'))
print(f"packed {len(files)} files")
PYEOF

python3 ~/workspace/custom-connectors/custom.vercel/bin/vercel_api.py POST \
  "/v13/deployments?teamId=team_dPNHt5zLNjeIuQgimdKsZ28P" @/tmp/agentclaim-deploy.json \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print('deployment:', d.get('id')); print('url: https://' + d.get('url','')); print('alias:', d.get('alias'))"
