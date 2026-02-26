# BMI Calculator & Tracker

A modern React web application for calculating and tracking Body Mass Index (BMI), featuring persistent history, data visualization, and CSV export functionality.

## Live Demo
** Run the application here:**
[https://vercel.com/jagill12s-projects/bmi-tracker](https://bmi-tracker-three.vercel.app/)

## Application Preview
<img width="1217" height="829" alt="bmi-tracker-ui" src="https://github.com/user-attachments/assets/b407809f-5b83-402f-9aea-d765fc2690de" />

## Features

### Core Functionality
  - Metric and Imperial unit support
  - Real-time BMI calculation
  - Automatic BMI category classification
  - Contextual health guidance

### Advanced Features (V2-V3)
  - Input validation and guardrails
  - Persistent history using browser 'localStorage'
  - BMI trend visualization using Recharts
  - CSV export for external analysis
  - Versioned feature progression (V1 -> V3)

## Engineering Highlights

This project demonstrates practical frontend application architecture:
  - React hooks ('useState', 'useEffect', 'useMemo') for state and derived calculations
  - Client-side persistence without backend infrastructure
  - Data visualization pipeline using Recharts
  - Browser file generation using Blob APIs
  - Modular feature evolution through versioned UI states
  - Responsive UI built with Tailwind CSS

## Tech Stack
  - **React (Vite)**
  - **JavaScript (ES Modules)**
  - **Tailwind CSS**
  - **Recharts**
  - **Framer Motion**
  - **Vercel** (deployment)

## Project Structure
```
src/
├── App.jsx # Main application logic & UI
├── main.jsx # React entry point
├── index.css # Tailwind styling
docs/
└── bmi-tracker-ui.png
```
## Persistence Model

BMI entries are stored locally in the browser:
```
localStorage key:
bmi-tracker-history-v1
```
No backend or database required

## Example Export Output

BMI history can be exported as CSV for analysis:
```
csv
date, height, weight, bmi, category, note
2026-02-26, 175 cm, 70 kg, 22.86, Normal, Morning after run
```

## Local Development
### Requirements
  - Node.js (LTS)
  - npm
### Run locally
```
npm install
npm run dev
```
### Production build
```
npm run build
npm run preview
```

## Future Improvements
  - Cloud sync and authentication
  - Goal tracking and progress analytics
  - Accessibility enhancements (ARIA + keyboard navigation
  - Component modularization
  - Unit testing for calculation logic

## Author
John Gill
Bioinformatics and Software Engineering

