const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;

// In-memory task list (resets on pod restart — that's fine for the lab)
let tasks = [
  { id: 1, text: 'Deploy to Kubernetes',   done: false },
  { id: 2, text: 'Configure Jenkins',      done: true  },
  { id: 3, text: 'Write Ansible playbook', done: false },
];
let nextId = 4;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// POST add a new task
app.post('/api/tasks', (req, res) => {
  const task = { id: nextId++, text: req.body.text, done: false };
  tasks.push(task);
  res.status(201).json(task);
});

// PATCH toggle done/undone
app.patch('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Not found' });
  task.done = !task.done;
  res.json(task);
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
  tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
  res.status(204).send();
});

// Health check endpoint (Kubernetes uses this)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`MyApp To-Do running on port ${PORT}`);
});