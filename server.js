const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

// Initialize Express
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable
const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/vibratube', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Create a Schema and Model for Channels
const ChannelSchema = new mongoose.Schema({
  name: String,
  description: String,
  profilePicture: String,
  banner: String,
  colorScheme: String,
  socialLinks: String
});

const Channel = mongoose.model('Channel', ChannelSchema);

// Routes
app.post('/api/create-channel', upload.fields([{ name: 'profile-picture' }, { name: 'channel-banner' }]), (req, res) => {
  const { 'channel-name': name, 'channel-description': description, 'social-links': socialLinks } = req.body;
  const profilePicture = req.files['profile-picture'] ? req.files['profile-picture'][0].path : null;
  const banner = req.files['channel-banner'] ? req.files['channel-banner'][0].path : null;
  const colorScheme = req.body['color-scheme'];

  const newChannel = new Channel({
    name,
    description,
    profilePicture,
    banner,
    colorScheme,
    socialLinks
  });

  newChannel.save()
    .then(channel => res.json(channel))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Route to fetch all channels
app.get('/api/channels', (req, res) => {
    Channel.find()
      .then(channels => res.json(channels))
      .catch(err => res.status(400).json('Error: ' + err));
  });
  