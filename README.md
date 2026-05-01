# Collaborative Code Editor

A real-time collaborative code editor built with React, Vite, Monaco Editor, Yjs, Socket.IO, and Express.  
Users join with a username, edit code together in the browser, and see active collaborators in a live sidebar.

## Features

- Real-time collaborative editing
- Monaco-powered code editor
- Live user presence list
- Username-based join flow
- Shared document sync with Yjs
- Socket.IO-based collaboration server

## Project Structure

```text
.
├── backend
│   └── src
│       └── server.js
└── frontend
    └── src
        └── app
            └── App.jsx
