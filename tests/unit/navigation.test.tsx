import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../../src/App';

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});

describe('shared navigation', () => {
  it('contains only the brand and two primary links', () => {
    render(<App />);
    const header = screen.getByRole('banner');
    expect(header.textContent).toBe('AlexandraHomeBlog');
    expect(within(header).getAllByRole('link').map(link => link.textContent)).toEqual(['Alexandra', 'Home', 'Blog']);
  });

  it('navigates between pages and marks only the current primary link', async () => {
    render(<App />);
    const home = screen.getByRole('link', { name: 'Home' });
    const blog = screen.getByRole('link', { name: 'Blog' });
    expect(home.getAttribute('aria-current')).toBe('page');
    expect(blog.getAttribute('aria-current')).toBeNull();
    fireEvent.click(blog);
    expect(window.location.pathname).toBe('/blog');
    await waitFor(() => expect(blog.getAttribute('aria-current')).toBe('page'));
    expect(home.getAttribute('aria-current')).toBeNull();
    fireEvent.click(home);
    expect(window.location.pathname).toBe('/');
    expect(home.getAttribute('aria-current')).toBe('page');
  });

  it('supports a direct Blog visit', () => {
    window.history.replaceState(null, '', '/blog');
    render(<App />);
    expect(screen.getByRole('link', { name: 'Blog' }).getAttribute('aria-current')).toBe('page');
  });

  it('provides a home link for unknown routes without extending primary navigation', () => {
    window.history.replaceState(null, '', '/missing');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeDefined();
    const home = within(screen.getByRole('main')).getByRole('link', { name: 'Home' });
    fireEvent.click(home);
    expect(window.location.pathname).toBe('/');
    expect(screen.queryByRole('heading')).toBeNull();
    expect(within(screen.getByRole('navigation', { name: 'Primary' })).getAllByRole('link')).toHaveLength(2);
  });
});
