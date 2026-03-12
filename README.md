# FlashCard Generator

A simple web-based FlashCard Generator to help you create, view, and manage flashcards for study and revision.

## Features
- Create flashcards with questions and answers
- View and flip flashcards
- Manage your flashcard collection

## Getting Started

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/DevK-26/AI-FlashDeck.git
   ```
2. Navigate to the project directory:
   ```bash
   cd "FlashCard Generator"
   ```
3. Start a local server (Python 3):
   ```bash
   python3 -m http.server 8000
   ```
4. Open your browser and go to [http://localhost:8000](http://localhost:8000)

## Project Structure
- `index.html` - Main HTML file
- `worker.js` - JavaScript worker for background tasks
- `wrangler.toml` - Configuration for Cloudflare Workers
- `launch.json` - VS Code launch configuration

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
