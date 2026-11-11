import { sitePath } from '../../sitePath';
import { PostContinuity } from '../RouteTransition';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../../content/schema';
export function PostDate({ date }: { date: string }) {
  return <time dateTime={date}>{new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))}</time>;
}
export function BlogCard({ post }: { post: BlogPost }) {
  return <article className="blog-card">
    {post.coverImage && <PostContinuity slug={post.slug} part="cover"><img className="blog-cover" src={sitePath(post.coverImage)} alt="" loading="lazy" /></PostContinuity>}
    <PostDate date={post.date} />
    <PostContinuity slug={post.slug} part="title"><h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2></PostContinuity>
    <p>{post.excerpt}</p>
    {post.tags?.length ? <ul className="blog-tags" aria-label="Tags">{post.tags.map(tag => <li key={tag}>{tag}</li>)}</ul> : null}
  </article>;
}
