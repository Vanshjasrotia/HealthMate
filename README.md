# HealthMate – AI Powered Medical Assistant

Frontend-only React app. No backend or authentication.

## Folder structure

```
HealthMate/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── Card.jsx
    │   └── Button.jsx
    └── pages/
        ├── Home.jsx
        ├── DiseasePrediction.jsx
        ├── Chatbot.jsx
        ├── ReportAnalyzer.jsx
        ├── MedicationReminder.jsx
        └── Dashboard.jsx
```

## Run

```bash
npm install
npm start
```

Open http://localhost:5173/

## Build

```bash
npm run build
npm run preview
```

## Pages

- **Home** – Overview, key features, disclaimer
- **Disease Prediction** – Form (age, gender, BP, glucose, cholesterol, BMI) and result placeholder
- **Medical Chatbot** – Chat UI with user/bot messages and disclaimer
- **Report Analyzer** – File upload and placeholder extracted/abnormal values
- **Medication Reminder** – Add reminders, list with remove
- **Dashboard** – Cards (last prediction, risk score, reminders) and placeholder charts

All data is dummy/placeholder; no API calls.
