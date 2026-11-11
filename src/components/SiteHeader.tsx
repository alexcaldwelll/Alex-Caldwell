import { Link, NavLink } from 'react-router-dom';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-brand" to="/">Alexandra</Link>
      <nav aria-label="Primary">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/blog" end>Blog</NavLink>
      </nav>
    </header>
  );
}
