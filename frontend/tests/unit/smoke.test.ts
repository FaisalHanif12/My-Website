import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('test toolchain', () => {
  it('renders an element with Testing Library in jsdom', () => {
    render(createElement('p', { className: 'smoke' }, 'Hello from Vitest'));
    const el = screen.getByText('Hello from Vitest');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('smoke');
  });
});
