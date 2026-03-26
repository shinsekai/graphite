import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchInput } from './search-input';

describe('SearchInput', () => {
  it('should render with placeholder', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} placeholder="Search..." />);

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();
  });

  it('should display current value', () => {
    const onChange = vi.fn();
    render(<SearchInput value="test query" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test query');
  });

  it('should call onChange when typing', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(onChange).toHaveBeenCalledWith('new value');
  });

  it('should show clear button when value is present', () => {
    const onChange = vi.fn();
    render(<SearchInput value="test" onChange={onChange} />);

    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    const clearButton = screen.queryByLabelText('Clear search');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should clear input when clear button is clicked', () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(<SearchInput value="test" onChange={onChange} onClear={onClear} />);

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalled();
  });

  it('should focus input after clear', () => {
    const onChange = vi.fn();
    render(<SearchInput value="test" onChange={onChange} />);

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });

  it('should clear input on Escape key', () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(<SearchInput value="test" onChange={onChange} onClear={onClear} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalled();
  });

  it('should update when value prop changes', () => {
    const onChange = vi.fn();
    const { rerender } = render(<SearchInput value="initial" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('initial');

    rerender(<SearchInput value="updated" onChange={onChange} />);
    expect(input).toHaveValue('updated');
  });

  it('should use default placeholder', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Search notes...');
    expect(input).toBeInTheDocument();
  });
});
