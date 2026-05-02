import './App.css'
const Editor = lazy(() => import("@monaco-editor/react"));
import { lazy, Suspense } from "react";
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from 'react'
import { SocketIOProvider } from "y-socket.io"
import * as Y from 'yjs'

function App() {
  const [showEditor, setShowEditor] = useState(false);
  const [output, setOutput] = useState("");


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
    setShowEditor(true)
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
const runCode = () => {
  const code = editorRef.current.getValue();

  try {
    // Capture console.log output
    let logs = [];
    const originalLog = console.log;

    console.log = (...args) => {
      logs.push(args.join(" "));
    };

    // Run user code
    const result = new Function(code)();

    console.log = originalLog;

    // Show output
    setOutput(logs.join("\n") || String(result) || "Code executed.");
  } catch (err) {
    setOutput(err.message);
  }
};

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
  <main className='h-screen w-full bg-gray-950 flex gap-4 p-4 text-white'>

  {/* Sidebar */}
  <div className="w-1/4 bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-800">
    <h2 className="text-lg font-semibold mb-4 text-blue-400">Active Users</h2>

    <ul className="space-y-2">
      {user.map((u, i) => (
        <li key={i} className="bg-gray-800 p-2 rounded-md text-sm">
          {u.username}
        </li>
      ))}
    </ul>
  </div>

  {/* Editor Section */}
  <div className="w-3/4 flex flex-col gap-3">

    {/* Top Bar */}
    <div className="flex justify-between items-center bg-gray-900 p-3 rounded-xl border border-gray-800 shadow">

      <span className="text-sm text-gray-400">
        ⚠️ JavaScript only supported
      </span>

      <button
        onClick={runCode}
        className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition'
      >
        ▶ Run Code
      </button>
    </div>

    {/* Output Console */}
    <div className="bg-black rounded-xl border border-gray-800 p-3 h-40 overflow-auto font-mono text-sm text-green-400 shadow-inner">
      {output || "Output will appear here..."}
    </div>

    {/* Editor */}
    <div className="flex-1 rounded-xl overflow-hidden border border-gray-800 shadow-lg">
      <Suspense fallback={<div className="p-4">Loading Editor...</div>}>
        <Editor
          onMount={handleMount}
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          defaultValue="// Write JavaScript code here...\nconsole.log('Hello Mukul 🚀');"
        />
      </Suspense>
    </div>

  </div>
</main>

  )
}

export default App