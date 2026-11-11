import { BlogCard } from '../components/blog/BlogCard';
import { getAllPosts } from '../content/posts';
import '../styles/blog.css';
export function BlogPage() {
  const posts = getAllPosts();
  return <section className="blog-page" aria-labelledby="blog-title">
    <header className="blog-intro"><p className="blog-eyebrow">Notes along the way</p><h1 id="blog-title">Blog</h1></header>
    <div className="blog-list">{posts.length ? posts.map(post => <BlogCard key={post.slug} post={post} />) : <p>New notes will appear here.</p>}</div>
  </section>;
}
