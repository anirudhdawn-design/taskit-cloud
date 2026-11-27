const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const usersFile = path.join(__dirname, '../data/users.json');
const secret = process.env.JWT_SECRET || 'taskit_jiit_secret_2026';

function readUsers() {
  if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]', 'utf8');
  return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const users = readUsers();
    if (users.some((u) => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
    };
    users.push(newUser);
    writeUsers(users);

    const token = jwt.sign({ id: newUser.id, name: newUser.name }, secret, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/update-profile', async (req, res) => {
  try {
    const currentEmail = String(req.body?.currentEmail || '').trim().toLowerCase();
    const newName = String(req.body?.name || '').trim();
    const newEmail = String(req.body?.email || '').trim().toLowerCase();
    if (!currentEmail) return res.status(400).json({ message: 'Current user email is required' });

    const users = readUsers();
    const user = users.find((item) => String(item.email || '').toLowerCase() === currentEmail);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (newEmail && newEmail !== currentEmail) {
      const emailTaken = users.some((item) =>
        item !== user && String(item.email || '').toLowerCase() === newEmail
      );
      if (emailTaken) return res.status(400).json({ message: 'Email is already in use' });
      user.email = newEmail;
    }
    if (newName) user.name = newName;
    writeUsers(users);
    res.json({
      message: 'Profile updated',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.delete('/delete-account', async (req, res) => {
  try {
    const email = String(req.body?.email || req.query?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Account email is required' });

    const users = readUsers();
    const user = users.find((item) => String(item.email || '').toLowerCase() === email);
    if (!user) return res.status(404).json({ message: 'Account not found' });
    writeUsers(users.filter((item) => item !== user));

    const tasksFile = path.join(__dirname, '../data/tasks.json');
    if (fs.existsSync(tasksFile)) {
      const tasks = JSON.parse(fs.readFileSync(tasksFile, 'utf8'));
      fs.writeFileSync(
        tasksFile,
        JSON.stringify(tasks.filter((task) => task.user !== user.id), null, 2),
        'utf8'
      );
    }
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readUsers();
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, name: user.name }, secret, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const users = readUsers();
    const idx = users.findIndex((u) => u.email === email);
    if (idx === -1) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    users[idx].password = await bcrypt.hash(newPassword, 10);
    writeUsers(users);
    res.json({ message: 'Password reset! You can sign in now.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
