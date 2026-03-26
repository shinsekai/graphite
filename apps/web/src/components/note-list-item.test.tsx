import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoteListItem } from './note-list-item';
import type { NoteSummary } from '@graphite/shared';

const getMockNote = (ageMs: number): NoteSummary => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Note',
  preview: 'This is a test note preview',
  pinned: false,
  updatedAt: new Date(Date.now() - ageMs).toISOString(),
});

const mockUntitledNote: NoteSummary = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  title: '',
  preview: '',
  pinned: true,
  updatedAt: new Date(Date.now() - 3600000).toISOString(),
};

describe('NoteListItem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-26T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render note title', () => {
    const onClick = vi.fn();
    render(<NoteListItem note={getMockNote(60000)} onClick={onClick} />);

    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('should render "Untitled" when title is empty', () => {
    const onClick = vi.fn();
    render(<NoteListItem note={mockUntitledNote} onClick={onClick} />);

    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('should render preview', () => {
    const onClick = vi.fn();
    render(<NoteListItem note={getMockNote(60000)} onClick={onClick} />);

    expect(screen.getByText('This is a test note preview')).toBeInTheDocument();
  });

  it('should render "No content" when preview is empty', () => {
    const onClick = vi.fn();
    render(<NoteListItem note={mockUntitledNote} onClick={onClick} />);

    expect(screen.getByText('No content')).toBeInTheDocument();
  });

  it('should render relative timestamp', () => {
    const onClick = vi.fn();
    render(<NoteListItem note={getMockNote(60000)} onClick={onClick} />);

    expect(screen.getByText(/1m/)).toBeInTheDocument();
  });

  it('should show pin icon when note is pinned', () => {
    const onClick = vi.fn();
    render(<NoteListItem note={mockUntitledNote} onClick={onClick} />);

    const pinIcon = document.querySelector('[class*="pinIcon"]');
    expect(pinIcon).toBeInTheDocument();
  });

  it('should not show pin icon when note is not pinned', () => {
    const onClick = vi.fn();
    render(<NoteListItem note={getMockNote(60000)} onClick={onClick} />);

    const pinIcon = document.querySelector('[class*="pinIcon"]');
    expect(pinIcon).not.toBeInTheDocument();
  });

  it('should apply active style when isActive is true', () => {
    const onClick = vi.fn();
    render(<NoteListItem note={getMockNote(60000)} onClick={onClick} isActive />);

    const item = screen.getByRole('button');
    expect(item.className).toContain('active');
  });

  it('should call onClick with note id when clicked', () => {
    const onClick = vi.fn();
    render(<NoteListItem note={getMockNote(60000)} onClick={onClick} />);

    const item = screen.getByRole('button');
    fireEvent.click(item);

    expect(onClick).toHaveBeenCalledWith(getMockNote(60000).id);
  });

  it('should call onClick with note id when Enter key is pressed', () => {
    const onClick = vi.fn();
    render(<NoteListItem note={getMockNote(60000)} onClick={onClick} />);

    const item = screen.getByRole('button');
    fireEvent.keyDown(item, { key: 'Enter' });

    expect(onClick).toHaveBeenCalledWith(getMockNote(60000).id);
  });

  it('should call onClick with note id when Space key is pressed', () => {
    const onClick = vi.fn();
    render(<NoteListItem note={getMockNote(60000)} onClick={onClick} />);

    const item = screen.getByRole('button');
    fireEvent.keyDown(item, { key: ' ' });

    expect(onClick).toHaveBeenCalledWith(getMockNote(60000).id);
  });

  it('should call onDelete when right-clicked', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    render(
      <NoteListItem note={getMockNote(60000)} onClick={onClick} onDelete={onDelete} />,
    );

    const item = screen.getByRole('button');
    fireEvent.contextMenu(item);

    expect(onDelete).toHaveBeenCalledWith(getMockNote(60000).id);
  });

  it('should not call onClick when right-clicked', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    render(
      <NoteListItem note={getMockNote(60000)} onClick={onClick} onDelete={onDelete} />,
    );

    const item = screen.getByRole('button');
    fireEvent.contextMenu(item);

    expect(onClick).not.toHaveBeenCalled();
  });
});
