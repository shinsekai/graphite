import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal } from './confirm-modal';

describe('ConfirmModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnConfirm.mockReset();
    mockOnCancel.mockReset();
  });

  const defaultProps = {
    open: true,
    title: 'Delete note',
    message: 'This note will be permanently deleted.',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  it('renders nothing when open is false', () => {
    const { container } = render(<ConfirmModal {...defaultProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders title and message when open is true', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete note')).toBeInTheDocument();
    expect(
      screen.getByText('This note will be permanently deleted.'),
    ).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Escape is pressed', () => {
    render(<ConfirmModal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when backdrop is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not call onCancel when modal content is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);

    const title = screen.getByText('Delete note');
    fireEvent.click(title);

    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it('shows custom confirm label', () => {
    render(<ConfirmModal {...defaultProps} confirmLabel="Remove" />);

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });

  it('shows custom cancel label', () => {
    render(<ConfirmModal {...defaultProps} cancelLabel="No" />);

    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancel' }),
    ).not.toBeInTheDocument();
  });

  it('applies danger variant styling to confirm button', () => {
    render(<ConfirmModal {...defaultProps} variant="danger" />);

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    expect(confirmButton.className).toContain('danger');
  });

  it('applies default variant styling to confirm button', () => {
    render(<ConfirmModal {...defaultProps} variant="default" />);

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    expect(confirmButton.className).toContain('default');
  });

  it('defaults to danger variant', () => {
    render(<ConfirmModal {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    expect(confirmButton.className).toContain('danger');
  });
});
