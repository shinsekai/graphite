import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './app';

describe('@graphite/web', () => {
  it('renders Graphite heading', () => {
    const { container } = render(<App />);
    expect(container.querySelector('h1')?.textContent).toBe('Graphite');
  });

  it('performs a basic arithmetic check', () => {
    expect(1 + 1).toBe(2);
  });
});
