import { Link, useParams } from 'react-router-dom';
import { getPostBySlug } from '../content/posts';
import { PostDate } from '../components/blog/BlogCard';
import { MarkdownContent } from '../components/blog/MarkdownContent';
import '../styles/blog.css';
export function BlogPostPage() {
  const { slug } = useParams();
  const post = slug ? getPostBySlug(slug) : undefined;
  if (!post) return <section className="blog-page"><h1>Post not found</h1><p>This note isn’t available.</p><Link to="/blog">Back to Blog</Link></section>;
  return <article className="blog-page blog-reader">
    <Link className="blog-back" to="/blog">Back to Blog</Link>
    <header><PostDate date={post.date} /><h1>{post.title}</h1><p className="blog-excerpt">{post.excerpt}</p>
      {post.tags?.length ? <ul className="blog-tags" aria-label="Tags">{post.tags.map(tag => <li key={tag}>{tag}</li>)}</ul> : null}
    </header>
    {post.coverImage && <img className="blog-cover" src={post.coverImage} alt="" />}
    <MarkdownContent content={post.content} />
  </article>;
}
