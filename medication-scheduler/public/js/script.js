document.getElementById('add-medicine-btn').addEventListener('click', () => {
    document.getElementById('modal').classList.remove('hidden');
  });
  
  document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('modal').classList.add('hidden');
  });
  
  document.getElementById('medicine-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const medicine = {};
    formData.forEach((value, key) => {
      if (key === 'times') {
        medicine[key] = medicine[key] || [];
        medicine[key].push(value);
      } else {
        medicine[key] = value;
      }
    });
  
    await fetch('/api/medicines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicine),
    });
  
    e.target.reset();
    document.getElementById('modal').classList.add('hidden');
    fetchMedicines();
  });
  
  async function fetchMedicines() {
    const res = await fetch('/api/medicines');
    const medicines = await res.json();
  
    const list = document.getElementById('medicine-list');
    list.innerHTML = '';
  
    medicines.forEach((medicine) => {
      const div = document.createElement('div');
      div.className = 'medicine-item';
      div.innerHTML = `
        <span>${medicine.name} (${medicine.type})</span>
        <button onclick="deleteMedicine('${medicine._id}')">Delete</button>
      `;
      list.appendChild(div);
    });
  }
  
  async function deleteMedicine(id) {
    await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
    fetchMedicines();
  }
  
  fetchMedicines();
  