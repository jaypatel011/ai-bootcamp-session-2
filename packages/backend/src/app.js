const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    due_date TEXT DEFAULT NULL,
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
    completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialItems = [
  { name: 'Complete project setup', description: 'Initialize the TODO app', priority: 'high', due_date: '2026-02-15' },
  { name: 'Add unit tests', description: 'Write tests for all components', priority: 'medium', due_date: '2026-02-20' },
  { name: 'Update documentation', description: 'Keep docs up to date', priority: 'low', due_date: null }
];
const insertStmt = db.prepare('INSERT INTO items (name, description, priority, due_date) VALUES (?, ?, ?, ?)');

initialItems.forEach(item => {
  insertStmt.run(item.name, item.description, item.priority, item.due_date);
});

console.log('In-memory database initialized with sample data');

// API Routes
app.get('/api/items', (req, res) => {
  try {
    const { sort, filter, completed } = req.query;
    
    let query = 'SELECT * FROM items';
    const conditions = [];
    
    // Filter by completion status
    if (completed === 'true') {
      conditions.push('completed = 1');
    } else if (completed === 'false') {
      conditions.push('completed = 0');
    }
    
    // Filter by priority
    if (filter && ['low', 'medium', 'high'].includes(filter)) {
      conditions.push(`priority = '${filter}'`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Sort options
    switch (sort) {
      case 'due_date':
        query += ' ORDER BY due_date ASC NULLS LAST';
        break;
      case 'priority':
        query += " ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END";
        break;
      case 'title':
        query += ' ORDER BY name ASC';
        break;
      default:
        query += ' ORDER BY created_at DESC';
    }
    
    const items = db.prepare(query).all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const { name, description = '', due_date = null, priority = 'medium' } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }
    
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }

    const result = insertStmt.run(name, description, priority, due_date);
    const id = result.lastInsertRowid;

    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update a task
app.put('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, due_date, priority } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }

    const updateStmt = db.prepare(
      'UPDATE items SET name = ?, description = ?, due_date = ?, priority = ? WHERE id = ?'
    );
    updateStmt.run(name, description || '', due_date || null, priority || 'medium', id);

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Toggle task completion
app.patch('/api/items/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const newCompleted = existingItem.completed ? 0 : 1;
    const toggleStmt = db.prepare('UPDATE items SET completed = ? WHERE id = ?');
    toggleStmt.run(newCompleted, id);

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error toggling item completion:', error);
    res.status(500).json({ error: 'Failed to toggle item completion' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM items WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Item deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db, insertStmt };