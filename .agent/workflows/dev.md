---
description: How to start the development server and preview the catalog
---

## Start Development Server

// turbo-all

1. Install dependencies:
```bash
cd /Users/gustavochaconmendoza/Desktop/SincroChatCatalog && npm install
```

2. Start the dev server:
```bash
cd /Users/gustavochaconmendoza/Desktop/SincroChatCatalog && npm run dev
```

3. Open in browser:
   - Landing page: http://localhost:4321/
   - Demo catalog (preview mode): http://localhost:4321/s/preview

## Notes

- The preview mode at `/s/preview` uses hardcoded demo data (no n8n required)
- To use real data, set `PUBLIC_N8N_WEBHOOK_URL` in `.env`
- The frontend NEVER accesses Supabase directly — all data flows through n8n webhooks
