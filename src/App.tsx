export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="site-brand" href="/">Alexandra</a>
        <nav aria-label="Primary">
          <a href="/">Home</a>
          <a href="/blog">Blog</a>
        </nav>
      </header>
      <main id="main-content" />
      <footer className="site-footer" />
    </div>
  );
}
