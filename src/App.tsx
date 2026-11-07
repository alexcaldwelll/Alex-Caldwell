import { BrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { AppLayout } from './AppLayout';
const BlogPage = lazy(() => import('./routes/BlogPage').then(module => ({ default: module.BlogPage })));
const BlogPostPage = lazy(() => import('./routes/BlogPostPage').then(module => ({ default: module.BlogPostPage })));

export function App() {
  return <BrowserRouter><AppLayout pages={{ BlogPage, BlogPostPage }} /></BrowserRouter>;
}
