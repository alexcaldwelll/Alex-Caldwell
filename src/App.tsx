import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { HomePage } from './routes/HomePage';
import { BlogPage } from './routes/BlogPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <SiteHeader />
        <main id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="*" element={
              <div className="not-found">
                <h1>Page not found</h1>
                <Link to="/">Home</Link>
              </div>
            } />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}
