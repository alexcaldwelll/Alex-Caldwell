import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { HomePage } from './routes/HomePage';
const BlogPage = lazy(() => import('./routes/BlogPage').then(module => ({ default: module.BlogPage })));
const BlogPostPage = lazy(() => import('./routes/BlogPostPage').then(module => ({ default: module.BlogPostPage })));

export function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <SiteHeader />
        <main id="main-content">
          <AppRoutes />
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<p className="not-found" role="status">Loading notes…</p>}>
      <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="*" element={
              <div className="not-found">
                <h1>Page not found</h1>
                <Link to="/">Home</Link>
              </div>
            } />
      </Routes>
    </Suspense>
  );
}
