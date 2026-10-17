# Quiz App

### A focused, responsive quiz experience set against a moonlit night sky.

**[Play the live demo](https://priya-sinha01.github.io/Quiz/)**

**Stack:** HTML · CSS · Vanilla JavaScript · GitHub Pages

## Preview

The quiz uses this moon-and-stars artwork as its full-page background.

<p align="center">
    <img src="assets/moon.png" alt="Full moon and stars over a night sky, used as the quiz background" width="760">
</p>

## Features

- Ten general-knowledge questions, each with four answer choices
- Score display, question counter, and progress bar
- Clear correct and incorrect answer feedback
- Wrong-answer sound using `assets/oh-no.mp3`
- Next-question flow, final score summary, and restart
- Responsive layout and visible keyboard focus states

## Tech Stack

- **HTML** for page structure
- **CSS** embedded in `index.html` for styling and responsive layout
- **Vanilla JavaScript** for question rendering, answer handling, score, and navigation
- **HTML audio** with the local MP3 asset
- **GitHub Pages** for deployment

No external libraries or frameworks.

## Project Structure

```text
quiz-app/
├── index.html          # Page markup and embedded styles
├── Script.js           # Questions and quiz behavior
└── assets/
    ├── README.txt      # Asset note
    ├── moon.png        # Page background artwork
    └── oh-no.mp3       # Incorrect-answer sound
```

## Run Locally

1. Clone or download the repository.
2. Open `index.html` in a modern web browser.

Keep the `assets` folder beside `index.html` so its relative image and audio paths resolve.

## What I Learned

- Rendering questions and choices from structured JavaScript data
- Handling answer selection, score updates, and progress state
- Combining CSS feedback states with browser audio playback
- Building a responsive interface with visible keyboard focus states

## Future Improvements

- Add question categories or difficulty levels
- Save a best score between visits
- Add automated checks for scoring and navigation