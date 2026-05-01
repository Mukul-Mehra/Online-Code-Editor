import './App.css'
import Editor from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from 'react'
import { SocketIOProvider } from "y-socket.io"
import * as Y from 'yjs'

function App() {
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })
  const [user, setUser] = useState([])

  const editorRef = useRef(null)
  const providerRef = useRef(null)

  const ydoc = useMemo(() => new Y.Doc(), [])
  const ytext = useMemo(() => ydoc.getText("monaco"), [ydoc])

  const handleSubmit = (e) => {
    e.preventDefault()
    const name = e.target.username.value
    setUsername(name)
    window.history.pushState({}, "", "?username=" + name)
  }

  const handleMount = (editor) => {
    editorRef.current = editor

    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
      { autoConnect: true }
    )

    providerRef.current = provider

    provider.awareness.setLocalStateField("user", { username })

    provider.awareness.on("change", () => {
      const states = Array.from(provider.awareness.getStates().values())

      const users = states
        .filter(state => state.user && state.user.username)
        .map(state => state.user)

      setUser(users)
    })

    new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    )
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.destroy()
      }
      ydoc.destroy()
    }
  }, [ydoc])

  if (!username) {
    return (
      <main className='h-screen w-full bg-gray-950 flex justify-center items-center p-4'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            name='username'
            type="text"
            placeholder='Enter your username'
            className='p-2 rounded-md border-2 text-white bg-gray-800'
          />
          <button className='p-2 rounded-lg bg-amber-50 text-gray-950 font-bold'>
            Join
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className='h-screen w-full bg-gray-950 flex gap-2 p-5'>

      {/* Sidebar */}
      <div className="w-1/4 bg-blue-500 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <ul className="space-y-2">
          {user.map((u, i) => (
            <li key={i} className="bg-blue-600 p-2 rounded">
              {u.username}
            </li>
          ))}
        </ul>
      </div>

      {/* Editor */}
      <div className="w-3/4 bg-gray-900 p-2">
        <Editor
          onMount={handleMount}
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          defaultValue="// Start coding..."
        />
      </div>
    </main>
  )
}

export default App