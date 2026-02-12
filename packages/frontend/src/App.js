import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [sortBy, setSortBy] = useState('created_at');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', due_date: '', priority: 'medium' });

  useEffect(() => {
    fetchData();
  }, [sortBy, filterPriority, filterCompleted]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sortBy) params.append('sort', sortBy);
      if (filterPriority) params.append('filter', filterPriority);
      if (filterCompleted) params.append('completed', filterCompleted);
      
      const response = await fetch(`/api/items?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItem,
          description: newDescription,
          due_date: newDueDate || null,
          priority: newPriority
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const result = await response.json();
      setData([result, ...data]);
      setNewItem('');
      setNewDescription('');
      setNewDueDate('');
      setNewPriority('medium');
    } catch (err) {
      setError('Error adding item: ' + err.message);
      console.error('Error adding item:', err);
    }
  };

  const handleToggleComplete = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle item');
      }

      const updatedItem = await response.json();
      setData(data.map(item => item.id === itemId ? updatedItem : item));
    } catch (err) {
      setError('Error toggling item: ' + err.message);
      console.error('Error toggling item:', err);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      description: item.description || '',
      due_date: item.due_date || '',
      priority: item.priority || 'medium'
    });
  };

  const handleSaveEdit = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const updatedItem = await response.json();
      setData(data.map(item => item.id === itemId ? updatedItem : item));
      setEditingId(null);
    } catch (err) {
      setError('Error updating item: ' + err.message);
      console.error('Error updating item:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setData(data.filter(item => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error deleting item: ' + err.message);
      console.error('Error deleting item:', err);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const completedCount = data.filter(item => item.completed).length;
  const totalCount = data.length;

  return (
    <div className="App">
      <header className="App-header">
        <h1>To Do App</h1>
        <p>Keep track of your tasks</p>
        <div className="task-stats">
          <span>{completedCount} of {totalCount} tasks completed</span>
        </div>
      </header>

      <main>
        <section className="add-item-section">
          <h2>Add New Task</h2>
          <form onSubmit={handleSubmit} className="add-form">
            <div className="form-row">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>
            <div className="form-row">
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
              />
            </div>
            <div className="form-row form-row-inline">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                aria-label="Due date"
              />
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                aria-label="Priority"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button type="submit">Add Task</button>
            </div>
          </form>
        </section>

        <section className="filters-section">
          <h2>Filter & Sort</h2>
          <div className="filters">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort by"
            >
              <option value="created_at">Sort by Date Created</option>
              <option value="due_date">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              aria-label="Filter by priority"
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <select
              value={filterCompleted}
              onChange={(e) => setFilterCompleted(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Tasks</option>
              <option value="false">Active</option>
              <option value="true">Completed</option>
            </select>
          </div>
        </section>

        <section className="items-section">
          <h2>Tasks</h2>
          {loading && <p>Loading data...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
            <ul className="task-list">
              {data.length > 0 ? (
                data.map((item) => (
                  <li key={item.id} className={`task-item ${getPriorityClass(item.priority)} ${item.completed ? 'completed' : ''}`}>
                    {editingId === item.id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Task title"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description"
                        />
                        <div className="edit-form-row">
                          <input
                            type="date"
                            value={editForm.due_date}
                            onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                          />
                          <select
                            value={editForm.priority}
                            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div className="edit-actions">
                          <button onClick={() => handleSaveEdit(item.id)} className="save-btn">Save</button>
                          <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="task-checkbox">
                          <input
                            type="checkbox"
                            checked={item.completed === 1}
                            onChange={() => handleToggleComplete(item.id)}
                            aria-label={`Mark ${item.name} as ${item.completed ? 'incomplete' : 'complete'}`}
                          />
                        </div>
                        <div className="task-content">
                          <span className="task-title">{item.name}</span>
                          {item.description && <p className="task-description">{item.description}</p>}
                          <div className="task-meta">
                            {item.due_date && <span className="due-date">Due: {formatDate(item.due_date)}</span>}
                            <span className={`priority-badge ${getPriorityClass(item.priority)}`}>{item.priority}</span>
                          </div>
                        </div>
                        <div className="task-actions">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="edit-btn"
                            type="button"
                            aria-label="Edit task"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="delete-btn"
                            type="button"
                            aria-label="Delete task"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))
              ) : (
                <p className="empty-state">No tasks found. Add some!</p>
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;