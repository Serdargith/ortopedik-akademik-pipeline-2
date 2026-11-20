# Orthopedic Academic Pipeline 2

A React + TypeScript (Vite) web app that helps draft the sections of an orthopedic research manuscript: Introduction, Methods, Results, Discussion, Limitations, Conclusion, Abstract and References.

What it includes:

- PubMed search through NCBI E-utilities (ESearch → EFetch) with formatted citations
- MeSH-enriched queries chosen by orthopedic subspecialty
- reporting-guideline checklists
- a simplified statistics helper (not a substitute for a statistics package)
- language-model calls through your own Gemini, OpenRouter or Groq API key

## Run locally

Prerequisites: Node.js

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in your own API keys. Never commit this file.
3. Start the app: `npm run dev`

## Notes

- The repository contains no patient data, and the app needs none. Enter only de-identified study information.
- Every generated section is a draft. Authors must verify each statement, number and reference.

## License

MIT. See [LICENSE](LICENSE).
