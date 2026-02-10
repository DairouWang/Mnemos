# Mnemos

A poetic timeline visualization for exploring human civilization's history and personal memories.

## Getting Started

```bash
# Using Python
python3 -m http.server 8080

# Or using Node.js (if npx is installed)
npx serve .
```

Then open `http://localhost:8080` in your browser.

## Interaction

- **Hover** over a year line to reveal events from that year
- **Upper region** (silver): Collective memory / Historical events  
- **Lower region** (gold): Personal memory / Individual events

## Tech Stack

- Pure Canvas rendering
- ES Modules
- Zero dependencies

## Data

Current mock data covers 1880-1900.

Edit `data.js` to add more events.
