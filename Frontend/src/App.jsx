import { useState, useEffect, useRef } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import Markdown from "react-markdown"
import rehypehighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import axios from "axios"
import './App.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const DEFAULT_CODE = `// Paste your code here and click "Review Code"
async function fetchUserData(userId) {
  const data = fetch('/api/users/' + userId)
    .then(res => res.json())
  return data
}`

function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [review, setReview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const reviewRef = useRef(null)

  useEffect(() => {
    prism.highlightAll()
  }, [])

  async function reviewCode() {
    if (!code.trim()) {
      setError('Please enter some code to review.')
      return
    }
    setIsLoading(true)
    setError('')
    setReview('')
    try {
      const response = await axios.post(`${BACKEND_URL}/ai/get-review`, { code })
      setReview(response.data)
      setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      if (err.response?.status === 429) {
        setError('⚡ AI quota reached. Please wait a moment and try again.')
      } else if (err.response?.status === 500) {
        setError('🔴 Server error. Please try again in a few seconds.')
      } else {
        setError('Failed to get review. Please check your connection and try again.')
      }
    }
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      reviewCode()
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function clearAll() {
    setCode('')
    setReview('')
    setError('')
  }

  return (
    <div className="app" onKeyDown={handleKeyDown}>
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">CodeReview<span className="logo-ai">AI</span></span>
          </div>
          <div className="header-meta">
            <span className="badge">Powered by Gemini 2.0 Flash</span>
            <span className="badge badge-tip">⌘ + Enter to review</span>
          </div>
        </div>
      </header>

      <section className="hero">
        <p className="hero-sub">Paste your code. Get an expert review in seconds — bugs, security, performance, best practices.</p>
      </section>

      <main className="workspace">
        <div className="panel panel-editor">
          <div className="panel-header">
            <div className="panel-title">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
              <span className="panel-label">Code Editor</span>
            </div>
            <div className="panel-actions">
              <button className="action-btn" onClick={copyCode}>{copied ? '✓ Copied' : 'Copy'}</button>
              <button className="action-btn" onClick={clearAll}>Clear</button>
            </div>
          </div>

          <div className="editor-wrap">
            <Editor
              value={code}
              onValueChange={val => setCode(val)}
              highlight={val => prism.highlight(val, prism.languages.javascript, 'javascript')}
              padding={20}
              style={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 14,
                lineHeight: 1.7,
                minHeight: '100%',
                background: 'transparent',
                color: '#e2e8f0',
              }}
            />
          </div>

          <div className="editor-footer">
            {error && <span className="error-msg">⚠ {error}</span>}
            <button
              className={`review-btn ${isLoading ? 'review-btn--loading' : ''}`}
              onClick={reviewCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <><span className="spinner"></span>Analyzing...</>
              ) : (
                <><span>✦</span> Review Code</>
              )}
            </button>
          </div>
        </div>

        <div className="panel panel-review" ref={reviewRef}>
          <div className="panel-header">
            <div className="panel-title">
              <span className="panel-label">AI Review</span>
              {review && <span className="review-done-badge">✓ Complete</span>}
            </div>
          </div>

          <div className="review-body">
            {!review && !isLoading && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p className="empty-title">No review yet</p>
                <p className="empty-sub">Paste code on the left and click Review Code.</p>
                <div className="empty-features">
                  <span>✦ Bug Detection</span>
                  <span>✦ Security Audit</span>
                  <span>✦ Performance Tips</span>
                  <span>✦ Best Practices</span>
                </div>
              </div>
            )}
            {isLoading && (
              <div className="loading-state">
                <div className="loading-bars">
                  <span></span><span></span><span></span><span></span>
                </div>
                <p>Analyzing your code...</p>
              </div>
            )}
            {review && (
              <div className="markdown-wrap">
                <Markdown rehypePlugins={[rehypehighlight]}>{review}</Markdown>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <span>Built with React + Node.js + Google Gemini 2.0 Flash</span>
      </footer>
    </div>
  )
}

export default App
