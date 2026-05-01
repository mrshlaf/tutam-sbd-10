const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const noteRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Izinkan semua sementara untuk development
app.use(express.json());

app.use('/api/notes', noteRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    process.exit(1);
  });
