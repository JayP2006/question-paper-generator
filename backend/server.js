require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const app = express();
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require("./routes/authRoutes");
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);

connectDB();

app.use('/api', apiRoutes);
app.use("/api/auth",authRoutes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});