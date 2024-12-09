const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/medicationScheduler', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const MedicineSchema = new mongoose.Schema({
  name: String,
  type: String,
  amount: Number,
  dose: String,
  days: Number,
  schedule: String,
  times: [String],
  meal: String,
});

const Medicine = mongoose.model('Medicine', MedicineSchema);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api/medicines', async (req, res) => {
  const medicines = await Medicine.find();
  res.json(medicines);
});

app.post('/api/medicines', async (req, res) => {
  const medicine = new Medicine(req.body);
  await medicine.save();
  res.json({ success: true });
});

app.delete('/api/medicines/:id', async (req, res) => {
  await Medicine.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
