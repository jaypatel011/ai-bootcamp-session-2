import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock data with new schema
const mockItems = [
  { id: 1, name: 'Test Item 1', description: 'First item', due_date: '2026-02-15', priority: 'high', completed: 0, created_at: '2023-01-01T00:00:00.000Z' },
  { id: 2, name: 'Test Item 2', description: 'Second item', due_date: '2026-02-20', priority: 'medium', completed: 0, created_at: '2023-01-02T00:00:00.000Z' },
];

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockItems)
    );
  }),
  
  // POST /api/items handler
  rest.post('/api/items', (req, res, ctx) => {
    const { name, description, due_date, priority } = req.body;
    
    if (!name || name.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Item name is required' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        name,
        description: description || '',
        due_date: due_date || null,
        priority: priority || 'medium',
        completed: 0,
        created_at: new Date().toISOString(),
      })
    );
  }),

  // PATCH /api/items/:id/toggle handler
  rest.patch('/api/items/:id/toggle', (req, res, ctx) => {
    const { id } = req.params;
    const item = mockItems.find(i => i.id === parseInt(id));
    if (!item) {
      return res(ctx.status(404), ctx.json({ error: 'Item not found' }));
    }
    return res(
      ctx.status(200),
      ctx.json({ ...item, completed: item.completed === 0 ? 1 : 0 })
    );
  }),

  // PUT /api/items/:id handler
  rest.put('/api/items/:id', (req, res, ctx) => {
    const { id } = req.params;
    const { name, description, due_date, priority } = req.body;
    const item = mockItems.find(i => i.id === parseInt(id));
    if (!item) {
      return res(ctx.status(404), ctx.json({ error: 'Item not found' }));
    }
    return res(
      ctx.status(200),
      ctx.json({ ...item, name, description, due_date, priority })
    );
  }),

  // DELETE /api/items/:id handler
  rest.delete('/api/items/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Item deleted successfully' }));
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('To Do App')).toBeInTheDocument();
    expect(screen.getByText('Keep track of your tasks')).toBeInTheDocument();
  });

  test('loads and displays items with new fields', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Initially shows loading state
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });

    // Check for priority badges
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  test('displays task statistics', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('0 of 2 tasks completed')).toBeInTheDocument();
    });
  });

  test('adds a new item with all fields', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });
    
    // Fill in the form
    const titleInput = screen.getByPlaceholderText('Task title');
    await act(async () => {
      await user.type(titleInput, 'New Test Item');
    });
    
    const submitButton = screen.getByText('Add Task');
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Check that the new item appears
    await waitFor(() => {
      expect(screen.getByText('New Test Item')).toBeInTheDocument();
    });
  });

  test('toggles item completion', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    // Find and click the checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    await act(async () => {
      await user.click(checkboxes[0]);
    });
    
    // Verify the toggle was called (item should update)
    await waitFor(() => {
      expect(checkboxes[0]).toBeChecked();
    });
  });

  test('renders filter and sort controls', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Filter & Sort')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by priority')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    });
  });

  test('renders edit and delete buttons for each item', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    
    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  test('handles API error', async () => {
    // Override the default handler to simulate an error
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no items', async () => {
    // Override the default handler to return empty array
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('No tasks found. Add some!')).toBeInTheDocument();
    });
  });

  test('deletes an item when delete button is clicked', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByText('Delete');
    await act(async () => {
      await user.click(deleteButtons[0]);
    });
    
    // Item should be removed from the list
    await waitFor(() => {
      expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
    });
  });

  test('opens edit form when edit button is clicked', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByText('Edit');
    await act(async () => {
      await user.click(editButtons[0]);
    });
    
    // Edit form should appear with Save and Cancel buttons
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  test('cancels edit mode when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    // Click edit
    const editButtons = screen.getAllByText('Edit');
    await act(async () => {
      await user.click(editButtons[0]);
    });
    
    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    await act(async () => {
      await user.click(cancelButton);
    });
    
    // Edit form should close, edit buttons should be visible again
    await waitFor(() => {
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
      expect(screen.getAllByText('Edit').length).toBeGreaterThan(0);
    });
  });

  test('saves edited item when save button is clicked', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });
    
    // Click edit
    const editButtons = screen.getAllByText('Edit');
    await act(async () => {
      await user.click(editButtons[0]);
    });
    
    // Modify the title input
    const titleInputs = screen.getAllByPlaceholderText('Task title');
    await act(async () => {
      await user.clear(titleInputs[0]);
      await user.type(titleInputs[0], 'Updated Title');
    });
    
    // Click save
    const saveButton = screen.getByText('Save');
    await act(async () => {
      await user.click(saveButton);
    });
    
    // Edit form should close
    await waitFor(() => {
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
  });

  test('changes sort option', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
    });
    
    const sortSelect = screen.getByLabelText('Sort by');
    await act(async () => {
      await user.selectOptions(sortSelect, 'priority');
    });
    
    expect(sortSelect).toHaveValue('priority');
  });

  test('changes filter by priority option', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText('Filter by priority')).toBeInTheDocument();
    });
    
    const filterSelect = screen.getByLabelText('Filter by priority');
    await act(async () => {
      await user.selectOptions(filterSelect, 'high');
    });
    
    expect(filterSelect).toHaveValue('high');
  });

  test('changes filter by status option', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    });
    
    const statusSelect = screen.getByLabelText('Filter by status');
    await act(async () => {
      await user.selectOptions(statusSelect, 'true');
    });
    
    expect(statusSelect).toHaveValue('true');
  });

  test('does not submit empty task title', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });
    
    // Try to submit without entering a title
    const submitButton = screen.getByText('Add Task');
    const initialItemCount = screen.getAllByRole('listitem').length;
    
    await act(async () => {
      await user.click(submitButton);
    });
    
    // No new item should be added
    const itemCount = screen.getAllByRole('listitem').length;
    expect(itemCount).toBe(initialItemCount);
  });
});