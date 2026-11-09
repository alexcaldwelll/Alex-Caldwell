import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { StaticJourney } from '../../src/scenes/mobile/StaticJourney';
import { HomePage } from '../../src/routes/HomePage';
afterEach(cleanup);
it('renders all chapters in order with accessible local posters and no canvas', () => {
  const { container } = render(<StaticJourney />);
  expect(screen.getAllByRole('heading', { level: 2 }).map(node => node.textContent)).toEqual(['Seattle', 'Charleston', 'Washington, DC', 'Nashville', 'The unfinished future']);
  expect(screen.getAllByRole('img')).toHaveLength(5);
  expect(container.querySelector('canvas')).toBeNull();
  expect(container.querySelector('.story-chapter p')).toBeNull();
  expect(container.querySelectorAll('[data-faith-visible="true"]')).toHaveLength(3);
});
it('opens with only a pencil before the journey', () => {
  const { container } = render(<HomePage />);
  const opening = container.querySelector('.story-opening');
  expect(opening?.textContent).toBe('');
  expect(opening?.querySelector('img')?.alt).toMatch(/yellow pencil/i);
  expect(screen.queryByText(/welcome/i)).toBeNull();
});
