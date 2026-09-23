# GMVCC Tinambag Library System

A ready-to-run React project (Vite). No manual setup needed beyond the two
commands below — everything (project files, dependencies list, entry point)
is already in place.

## How to run in VS Code

1. Unzip this folder and open it in VS Code (`File > Open Folder`).
2. Open a terminal in VS Code (`` Ctrl+` ``) and run:
   ```
   npm install
   ```
3. Once it finishes, run:
   ```
   npm run dev
   ```
4. Vite will print a local address, usually `http://localhost:5173`.
   Ctrl-click it (or paste it into your browser) to open the app.

## Login (demo accounts)

- Admin — `admin` / `admin123`
- Librarian — `librarian` / `librarian123`

## Project structure

```
gmvcc-library-vscode/
├── index.html          entry HTML file Vite loads
├── package.json         dependencies (React, lucide-react, Vite)
├── vite.config.js       build tool config
├── src/
│   ├── main.jsx         mounts the app into index.html
│   └── App.jsx           the entire library system (all screens/logic)
└── README.md
```

## Notes

- All data (books, loans, community service records) lives in memory only
  and resets when you stop the dev server. To persist data permanently,
  connect this to the MySQL database using `gmvcc_tinambag_library_schema.sql`
  through a backend API.
- If `npm install` fails, check that Node.js is v18 or newer: `node -v`.
