import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../../src/App';

afterEach(cleanup);

describe('application shell', () => {
  it('exposes Alexandra and the two primary navigation destinations', () => {
    render(<App />);

    const header = screen.getByRole('banner');
    expect(within(header).getByText('Alexandra')).toBeDefined();
    const navigation = within(header).getByRole('navigation', { name: 'Primary' });
    expect(within(navigation).getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/');
    expect(within(navigation).getByRole('link', { name: 'Blog' }).getAttribute('href')).toBe('/blog');
    expect(screen.getByRole('main')).toBeDefined();
    expect(screen.getByRole('contentinfo')).toBeDefined();
  });

  it('keeps the initial Home page free of a generic welcome headline', () => {
    render(<App />);

    expect(screen.queryByRole('heading', { name: /welcome/i })).toBeNull();
    expect(screen.getByRole('main').textContent).toBe('');
  });
});
