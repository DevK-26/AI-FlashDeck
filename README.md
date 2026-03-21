# FlashCard Generator


AI FlashCard Generator is a modern web-based tool to create, view, and manage flashcards for study and revision. It leverages AI to generate flashcards and evaluate answers, making your study sessions more effective.


## Features
- AI-powered flashcard generation from any text
- Evaluate your answers with instant feedback
- Create, view, and flip flashcards
- Manage your flashcard collection
- Beautiful, modern UI (responsive, dark mode)


## Getting Started

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/DevK-26/AI-FlashDeck.git
   cd "FlashCard Generator"
   ```
2. Start a local server (choose one):
   - Python 3:
     ```bash
     python3 -m http.server 8000
     # Visit http://localhost:8000
     ```
   - Or use [npx serve](https://www.npmjs.com/package/serve):
     ```bash
     npx serve -l 3456 -s .
     # Visit http://localhost:3456
     ```

### Deploying to Cloudflare Workers
1. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/):
   ```bash
   npm install -g wrangler
   ```
2. Add your Groq API key:
   ```bash
   wrangler secret put GROQ_API_KEY
   ```
3. Deploy:
   ```bash
   wrangler deploy
   ```


## Project Structure
- `index.html` — Main web UI
- `worker.js` — Cloudflare Worker (API backend)
- `wrangler.toml` — Cloudflare Worker config
- `launch.json` — VS Code launch config for local dev


## API Endpoints (Cloudflare Worker)
All endpoints are POST requests to `/`:

- **Generate flashcards:**
   ```json
   { "mode": "generate", "text": "<your text>", "numCards": 5, "difficulty": "easy|medium|hard" }
   ```
   Returns: Array of flashcard objects

- **Evaluate answer:**
   ```json
   { "mode": "evaluate", "question": "...", "correctAnswer": "...", "userAnswer": "..." }
   ```
   Returns: { "correct": true/false, "partial": true/false, "explanation": "..." }

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.


## License
MIT — see [LICENSE](LICENSE)
