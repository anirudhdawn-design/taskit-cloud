const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
const tasksFile = path.join(__dirname, '../data/tasks.json');
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function readTasks() {
  if (!fs.existsSync(tasksFile)) fs.writeFileSync(tasksFile, '[]', 'utf8');
  return JSON.parse(fs.readFileSync(tasksFile, 'utf8'));
}

function writeTasks(tasks) {
  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2), 'utf8');
}

function normalizeTask(task) {
  return {
    ...task,
    description: typeof task.description === 'string' ? task.description : '',
  };
}

function pruneOldTasks(tasks) {
  const cutoff = Date.now() - SEVEN_DAYS_MS;
  const recent = tasks.filter((t) => {
    if (!t.createdAt) return true;
    return new Date(t.createdAt).getTime() >= cutoff;
  });
  if (recent.length !== tasks.length) {
    writeTasks(recent);
  }
  return recent;
}

router.get('/', auth, (req, res) => {
  try {
    const allTasks = pruneOldTasks(readTasks());
    const userTasks = allTasks
      .filter((t) => t.user === req.user.id)
      .map(normalizeTask);
    res.json(userTasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, (req, res) => {
  try {
    const { title, description, category, priority, dueDate } = req.body;
    const tasks = pruneOldTasks(readTasks());
    const newTask = normalizeTask({
      _id: Date.now().toString(),
      user: req.user.id,
      title,
      description: typeof description === 'string' ? description.trim() : '',
      category: category || 'Personal',
      priority: priority || 'Medium',
      dueDate: dueDate || '',
      completed: false,
      createdAt: new Date().toISOString(),
    });
    tasks.unshift(newTask);
    writeTasks(tasks);
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, (req, res) => {
  try {
    const tasks = readTasks();
    const idx = tasks.findIndex((t) => t._id === req.params.id && t.user === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'Task not found' });
    tasks[idx] = normalizeTask({
      ...tasks[idx],
      ...req.body,
      description:
        req.body.description !== undefined
          ? req.body.description
          : tasks[idx].description,
    });
    writeTasks(tasks);
    res.json(tasks[idx]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, (req, res) => {
  try {
    const tasks = readTasks();
    const filtered = tasks.filter((t) => !(t._id === req.params.id && t.user === req.user.id));
    writeTasks(filtered);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
