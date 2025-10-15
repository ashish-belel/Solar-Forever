const admin = require('firebase-admin');

exports.getUsers = async (req, res) => {
  try {
    const users = await admin.auth().listUsers();
    res.json(users.users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await admin.auth().createUser(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};