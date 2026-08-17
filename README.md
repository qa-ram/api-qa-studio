# API QA Studio

API QA Studio is a lightweight API testing and QA workspace built with React and Vite. It helps developers explore endpoints, manage request collections, import Postman collections, work with environment variables, and run API checks with scripting support.

## Features

- Build and edit REST API requests
- Organize requests in folders and collections
- Import Postman collection JSON files
- Switch between multiple environments (Local, Staging, Production)
- Use variables and dynamic request URLs
- Run collection workflows and test scripts
- Visualize HTTP responses and request metadata
- Built-in AI-powered assistant interfaces for API workflows

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React
- CryptoJS

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run the app in development mode

```bash
npm run dev
```

The app will start in development mode and open the Vite local preview URL in the browser.

### Build for production

```bash
npm run build
```

## Project Structure

```text
api-qa-studio/
├── src/
│   ├── components/
│   ├── engine/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Notes

This project is designed for local API QA workflows and can be extended with more protocol support, AI automation, or deeper collection execution tooling.

## License

This project is provided as-is for development and internal testing use.
