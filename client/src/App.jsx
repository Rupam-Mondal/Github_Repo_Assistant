import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import './App.css'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
})

function Icon({ name, size = 20 }) {
  const paths = {
    github: <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.54 1.04 1.54 1.04.9 1.53 2.35 1.09 2.92.83.09-.66.35-1.1.64-1.35-2.22-.25-4.55-1.11-4.55-4.95 0-1.1.39-1.99 1.04-2.7-.1-.25-.45-1.28.1-2.67 0 0 .85-.27 2.75 1.03A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.34 1.9-1.3 2.75-1.03 2.75-1.03.55 1.39.2 2.42.1 2.67.65.71 1.04 1.6 1.04 2.7 0 3.85-2.34 4.69-4.57 4.94.36.31.68.9.68 1.82v2.7c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />,
    link: <><path d="M10.1 13.9a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" /><path d="M13.9 10.1a5 5 0 0 0-7.07 0l-2 2a5 5 0 0 0 7.07 7.07l1.15-1.15" /></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    send: <path d="m21 3-7.7 18-3.6-7.7L3 9.7 21 3Zm-11.4 10.3L14 10" />,
    spark: <path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Zm7 14 .75 2.25L22 19l-2.25.75L19 22l-.75-2.25L16 19l2.25-.75L19 16Z" />,
    check: <path d="m5 12 4.2 4L19 6" />,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [repoUrl, setRepoUrl] = useState('')
  const [connectedRepo, setConnectedRepo] = useState('')
  const [isCloning, setIsCloning] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [isAsking, setIsAsking] = useState(false)
  const [error, setError] = useState('')
  const questionRef = useRef(null)
  const conversationRef = useRef(null)

  useEffect(() => {
    const container = conversationRef.current
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages, isAsking])

  const connectRepo = async (event) => {
    event.preventDefault()
    const url = repoUrl.trim()
    if (!url) return setError('Paste a GitHub repository URL to continue.')
    setError('')
    setIsCloning(true)
    try {
      const response = await api.post('/cloneRepo', { url })
      if (response.data?.success === false) throw new Error(response.data?.message)
      setConnectedRepo(url)
      setMessages([])
      setRepoUrl('')
      setTimeout(() => questionRef.current?.focus(), 50)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to connect to this repository.')
    } finally {
      setIsCloning(false)
    }
  }

  const askQuestion = async (event) => {
    event.preventDefault()
    const value = question.trim()
    if (!value || isAsking) return
    setError('')
    setMessages((current) => [...current, { role: 'user', text: value }])
    setQuestion('')
    setIsAsking(true)
    try {
      const response = await api.post('/askquestion', { question: value })
      if (response.data?.success === false) throw new Error(response.data?.message)
      setMessages((current) => [...current, { role: 'assistant', text: response.data?.data || response.data?.message || 'I could not find an answer.' }])
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Something went wrong while answering.'
      setMessages((current) => [...current, { role: 'assistant', text: message, error: true }])
    } finally {
      setIsAsking(false)
    }
  }

  const suggestions = ['What does this project do?', 'Explain the folder structure', 'How is authentication handled?']

  return <main className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar">
      <a className="brand" href="/" aria-label="RepoLens home"><span className="brand-mark"><Icon name="spark" size={17} /></span>RepoLens</a>
      <span className="topbar-note"><span className="pulse" />AI repository companion</span>
    </header>

    {!connectedRepo ? <section className="welcome-card">
      <div className="eyebrow"><Icon name="github" size={16} /> GitHub-powered context</div>
      <h1>Understand any<br /><em>codebase</em> in seconds.</h1>
      <p>Connect a public GitHub repository and ask precise questions about its code, structure, and logic.</p>
      <form className="repo-form" onSubmit={connectRepo}>
        <div className="input-wrap"><Icon name="link" size={19} /><input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/owner/repository" aria-label="GitHub repository URL" /></div>
        <button type="submit" disabled={isCloning}>{isCloning ? <><span className="spinner" /> Indexing repository</> : <>Connect repo <Icon name="arrow" size={18} /></>}</button>
      </form>
      {error && <p className="form-error"><Icon name="close" size={15} /> {error}</p>}
      <div className="privacy-note"><span className="lock">⌁</span> Your questions are grounded in the connected repository.</div>
    </section> : <section className="workspace">
      <div className="repo-strip"><div className="repo-icon"><Icon name="github" size={19} /></div><div><span>CONNECTED REPOSITORY</span><strong>{connectedRepo.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\.git$/, '')}</strong></div><button className="change-repo" onClick={() => { setConnectedRepo(''); setMessages([]); setError('') }}>Change</button></div>
      <div className="conversation" ref={conversationRef} aria-live="polite">
        {messages.length === 0 ? <div className="empty-state"><div className="empty-icon"><Icon name="spark" size={24} /></div><h2>What would you like to know?</h2><p>Ask anything about this repository. I’ll search through the code to find the answer.</p><div className="suggestions">{suggestions.map((item) => <button key={item} onClick={() => setQuestion(item)}>{item}<Icon name="arrow" size={15} /></button>)}</div></div> : <div className="messages">{messages.map((message, index) => <article className={`message ${message.role} ${message.error ? 'message-error' : ''}`} key={index}><div className="avatar">{message.role === 'user' ? 'You' : <Icon name="spark" size={16} />}</div><div className="message-body">{message.role === 'assistant' && <span className="message-label">REPOLENS</span>}<p>{message.text}</p></div></article>)}{isAsking && <article className="message assistant"><div className="avatar"><Icon name="spark" size={16} /></div><div className="typing"><i /><i /><i /></div></article>}</div>}
      </div>
      <form className="ask-form" onSubmit={askQuestion}><textarea ref={questionRef} rows="1" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askQuestion(e) } }} placeholder="Ask a question about this codebase…" aria-label="Your question" /><button type="submit" disabled={!question.trim() || isAsking} aria-label="Send question"><Icon name="send" size={19} /></button></form>
      {error && <p className="workspace-error">{error}</p>}<p className="input-hint">Press <kbd>Enter</kbd> to send · <kbd>Shift + Enter</kbd> for a new line</p>
    </section>}
    <footer>Built for curious developers <span>✦</span></footer>
  </main>
}

export default App
