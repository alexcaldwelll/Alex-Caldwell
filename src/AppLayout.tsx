import { Suspense, ViewTransition, type ComponentType } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { RouteTransition } from './components/RouteTransition';
import { HomePage } from './routes/HomePage';

type Pages = { BlogPage: ComponentType; BlogPostPage: ComponentType };

export function AppLayout({ pages }: { pages: Pages }) {
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <SiteHeader />
    <RouteTransition>
      <main id="main-content" tabIndex={-1}><AppRoutes pages={pages} /></main>
    </RouteTransition>
    <SiteFooter />
  </div>;
}

function LazyRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ViewTransition default="none" exit="content-reveal"><p className="not-found" role="status">Loading notes…</p></ViewTransition>}>
    <ViewTransition default="none" enter="content-reveal">{children}</ViewTransition>
  </Suspense>;
}

export function AppRoutes({ pages }: { pages: Pages }) {
  const Index = pages.BlogPage, Post = pages.BlogPostPage;
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/blog" element={<LazyRoute><Index /></LazyRoute>} />
    <Route path="/blog/:slug" element={<LazyRoute><Post /></LazyRoute>} />
    <Route path="*" element={<div className="not-found"><h1>Page not found</h1><Link to="/">Home</Link></div>} />
  </Routes>;
}
