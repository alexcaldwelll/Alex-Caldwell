import { BrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { AppLayout } from './AppLayout';
const BlogPage = lazy(() => import('./routes/BlogPage').then(module => ({ default: module.BlogPage })));
const BlogPostPage = lazy(() => import('./routes/BlogPostPage').then(module => ({ default: module.BlogPostPage })));

export function App() {
  return <BrowserRouter basename={import.meta.env.BASE_URL}><AppLayout pages={{ BlogPage, BlogPostPage }} /></BrowserRouter>;
}
