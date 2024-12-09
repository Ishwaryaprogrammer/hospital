// Function to open the form modal for adding a new medicine
function addMedicine() {
  const formHtml = `
    <div class="modal-overlay">
      <div class="modal">
        <h2>Add Medicine</h2>
        <form id="medicineForm">
          <label for="medicineName">Medicine Name:</label>
          <input type="text" id="medicineName" name="name" required>
          
          <label for="dose">Dose:</label>
          <input type="text" id="dose" name="dose" required>
          
          <label for="type">Type:</label>
          <select id="type" name="type">
            <option value="Tablet">Tablet</option>
            <option value="Capsule">Capsule</option>
            <option value="Syrup">Syrup</option>
            <option value="Injection">Injection</option>
          </select>
          
          <label for="days">Days:</label>
          <input type="number" id="days" name="days" required>
          
          <label for="times">Times (Comma-separated):</label>
          <input type="text" id="times" name="times" placeholder="e.g., Morning, Afternoon" required>
          
          <button type="submit">Save</button>
          <button type="button" onclick="closeModal()">Cancel</button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', formHtml);

  document.getElementById('medicineForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const medicine = Object.fromEntries(formData.entries());
    medicine.times = medicine.times.split(',').map((time) => time.trim());
    
    await fetch('/api/medicines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicine),
    });

    closeModal();
    fetchMedicines();
  });
}

// Function to close the modal
function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) modal.remove();
}

// Fetch all medicines from MongoDB and display them
async function fetchMedicines() {
  const res = await fetch('/api/medicines');
  const medicines = await res.json();

  const list = document.getElementById('medicineList');
  list.innerHTML = '';

  medicines.forEach((medicine) => {
    const item = document.createElement('div');
    item.className = 'medicine-item';
    item.innerHTML = `
      <span>${medicine.name} (${medicine.type}), Dose: ${medicine.dose}, Days: ${medicine.days}, Times: ${medicine.times.join(', ')}</span>
      <div>
        <button class="icon-button update" onclick="editMedicine('${medicine._id}')">✏️</button>
        <button class="icon-button delete" onclick="deleteMedicine('${medicine._id}')">🗑️</button>
      </div>
    `;
    list.appendChild(item);
  });
}

// Edit an existing medicine in MongoDB
async function editMedicine(id) {
  const res = await fetch(`/api/medicines/${id}`);
  const medicine = await res.json();

  addMedicine(); // Opens the form
  document.getElementById('medicineName').value = medicine.name;
  document.getElementById('dose').value = medicine.dose;
  document.getElementById('type').value = medicine.type;
  document.getElementById('days').value = medicine.days;
  document.getElementById('times').value = medicine.times.join(', ');

  const form = document.getElementById('medicineForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const updatedMedicine = Object.fromEntries(new FormData(e.target).entries());
    updatedMedicine.times = updatedMedicine.times.split(',').map((time) => time.trim());

    await fetch(`/api/medicines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMedicine),
    });

    closeModal();
    fetchMedicines();
  };
}

// Delete a medicine from MongoDB
async function deleteMedicine(id) {
  await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
  fetchMedicines();
}

// Initialize by fetching medicines on page load
fetchMedicines();
