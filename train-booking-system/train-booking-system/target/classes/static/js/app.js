const API_BASE = '/api';

let currentTrains = [];      // last search results
let selectedTrain = null;    // train chosen for booking

// ---------- View switching ----------
document.querySelectorAll('.navlink').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.navlink').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + btn.dataset.view).classList.add('active');
  });
});

// ---------- Init ----------
document.getElementById('journeyDate').valueAsDate = new Date();
loadTickerAndStations();

async function loadTickerAndStations() {
  try {
    const res = await fetch(`${API_BASE}/trains`);
    const trains = await res.json();

    // Populate station datalist
    const stations = new Set();
    trains.forEach(t => { stations.add(t.source); stations.add(t.destination); });
    const datalist = document.getElementById('stationsList');
    datalist.innerHTML = [...stations].map(s => `<option value="${escapeHtml(s)}">`).join('');

    // Populate scrolling ticker
    const ticker = document.getElementById('tickerTrack');
    if (trains.length) {
      ticker.textContent = trains.map(t =>
        `${t.trainNumber} ${t.trainName} — ${t.source} to ${t.destination} — Dep ${t.departureTime} — Fare ₹${t.fare.toFixed(0)}    ●    `
      ).join('');
    } else {
      ticker.textContent = 'No trains available right now.';
    }
  } catch (e) {
    document.getElementById('tickerTrack').textContent = 'Unable to reach the booking server.';
  }
}

// ---------- Swap stations ----------
document.getElementById('swapBtn').addEventListener('click', () => {
  const s = document.getElementById('source');
  const d = document.getElementById('destination');
  [s.value, d.value] = [d.value, s.value];
});

// ---------- Search ----------
document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const source = document.getElementById('source').value.trim();
  const destination = document.getElementById('destination').value.trim();
  const statusEl = document.getElementById('searchStatus');
  const board = document.getElementById('board');

  if (!source || !destination) return;
  if (source.toLowerCase() === destination.toLowerCase()) {
    statusEl.textContent = 'Source and destination cannot be the same station.';
    board.classList.add('hidden');
    return;
  }

  statusEl.textContent = 'Searching the timetable…';
  board.classList.add('hidden');

  try {
    const res = await fetch(`${API_BASE}/trains/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
    const trains = await res.json();
    currentTrains = trains;

    if (!trains.length) {
      statusEl.textContent = `No direct trains found from ${source} to ${destination}.`;
      return;
    }

    statusEl.textContent = `${trains.length} train(s) found from ${source} to ${destination}.`;
    renderBoard(trains);
    board.classList.remove('hidden');
  } catch (err) {
    statusEl.textContent = 'Something went wrong reaching the server. Is the backend running?';
  }
});

function renderBoard(trains) {
  const rows = document.getElementById('boardRows');
  rows.innerHTML = trains.map((t, idx) => {
    const seatsClass = t.availableSeats === 0 ? 'seats-low' : (t.availableSeats < 10 ? 'seats-low' : 'seats-ok');
    const seatsLabel = t.availableSeats === 0 ? 'FULL' : t.availableSeats;
    return `
      <div class="board__row" style="animation-delay:${idx * 0.05}s">
        <span>
          <span class="train-name">${escapeHtml(t.trainName)}</span><br>
          <span class="train-number">#${escapeHtml(t.trainNumber)}</span>
        </span>
        <span>${escapeHtml(t.source)} → ${escapeHtml(t.destination)}</span>
        <span>${escapeHtml(t.departureTime)}</span>
        <span>${escapeHtml(t.arrivalTime)}</span>
        <span>${escapeHtml(t.duration || '—')}</span>
        <span>₹${t.fare.toFixed(0)}</span>
        <span class="${seatsClass}">${seatsLabel}</span>
        <span>
          <button class="btn--book" data-idx="${idx}" ${t.availableSeats === 0 ? 'disabled' : ''}>
            ${t.availableSeats === 0 ? 'Sold out' : 'Book'}
          </button>
        </span>
      </div>
    `;
  }).join('');

  rows.querySelectorAll('.btn--book').forEach(btn => {
    btn.addEventListener('click', () => openBookingModal(currentTrains[btn.dataset.idx]));
  });
}

// ---------- Booking modal ----------
const modal = document.getElementById('bookingModal');
const seatCountInput = document.getElementById('seatCount');

function openBookingModal(train) {
  selectedTrain = train;
  document.getElementById('modalTrainInfo').textContent =
    `${train.trainName} (#${train.trainNumber}) · ${train.source} → ${train.destination} · Dep ${train.departureTime} · ₹${train.fare.toFixed(0)}/seat`;
  seatCountInput.value = 1;
  seatCountInput.max = Math.min(6, train.availableSeats);
  document.getElementById('bookingError').textContent = '';
  buildPassengerFields(1);
  updateFareDisplay();
  modal.classList.remove('hidden');
}

document.getElementById('closeModal').addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

seatCountInput.addEventListener('input', () => {
  let n = parseInt(seatCountInput.value) || 1;
  n = Math.max(1, Math.min(n, parseInt(seatCountInput.max) || 6));
  seatCountInput.value = n;
  buildPassengerFields(n);
  updateFareDisplay();
});

function buildPassengerFields(count) {
  const container = document.getElementById('passengerFields');
  const existing = container.querySelectorAll('.passenger-row');
  const existingData = [...existing].map(row => ({
    name: row.querySelector('.p-name').value,
    age: row.querySelector('.p-age').value,
    gender: row.querySelector('.p-gender').value
  }));

  let html = '';
  for (let i = 0; i < count; i++) {
    const d = existingData[i] || { name: '', age: '', gender: 'M' };
    html += `
      <div class="passenger-row">
        <div class="field">
          <label>Passenger ${i + 1} name</label>
          <input type="text" class="p-name" value="${escapeAttr(d.name)}" required>
        </div>
        <div class="field">
          <label>Age</label>
          <input type="number" class="p-age" min="1" max="120" value="${escapeAttr(d.age)}" required>
        </div>
        <div class="field">
          <label>Gender</label>
          <select class="p-gender">
            <option value="M" ${d.gender === 'M' ? 'selected' : ''}>M</option>
            <option value="F" ${d.gender === 'F' ? 'selected' : ''}>F</option>
            <option value="O" ${d.gender === 'O' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function updateFareDisplay() {
  const n = parseInt(seatCountInput.value) || 1;
  const total = selectedTrain ? selectedTrain.fare * n : 0;
  document.getElementById('totalFareDisplay').textContent = `₹${total.toFixed(0)}`;
}

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('bookingError');
  errorEl.textContent = '';

  const passengerRows = document.querySelectorAll('.passenger-row');
  const passengers = [...passengerRows].map(row => ({
    name: row.querySelector('.p-name').value.trim(),
    age: parseInt(row.querySelector('.p-age').value),
    gender: row.querySelector('.p-gender').value
  }));

  const payload = {
    userName: document.getElementById('bookerName').value.trim(),
    userEmail: document.getElementById('bookerEmail').value.trim(),
    trainId: selectedTrain.id,
    journeyDate: document.getElementById('journeyDate').value,
    passengers
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Booking…';

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Booking failed. Please try again.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm & Book';
      return;
    }

    modal.classList.add('hidden');
    // Switch to lookup view and show the freshly booked ticket
    document.querySelector('.navlink[data-view="lookup"]').click();
    document.getElementById('lookupResults').innerHTML = renderTicket(data);
    attachCancelHandlers();
    loadTickerAndStations();

    // refresh search results seat counts if still relevant
    if (currentTrains.length) {
      document.getElementById('searchForm').requestSubmit();
    }
  } catch (err) {
    errorEl.textContent = 'Could not reach the server. Please try again.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm & Book';
  }
});

// ---------- PNR / email lookup ----------
document.getElementById('pnrForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const pnr = document.getElementById('pnrInput').value.trim();
  const resultsEl = document.getElementById('lookupResults');
  resultsEl.innerHTML = '<p class="status-msg">Looking up ticket…</p>';

  try {
    const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(pnr)}`);
    const data = await res.json();
    if (!res.ok) {
      resultsEl.innerHTML = `<p class="status-msg">${escapeHtml(data.error || 'Booking not found.')}</p>`;
      return;
    }
    resultsEl.innerHTML = renderTicket(data);
    attachCancelHandlers();
  } catch (err) {
    resultsEl.innerHTML = '<p class="status-msg">Could not reach the server.</p>';
  }
});

document.getElementById('emailForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('emailInput').value.trim();
  const resultsEl = document.getElementById('lookupResults');
  resultsEl.innerHTML = '<p class="status-msg">Fetching your bookings…</p>';

  try {
    const res = await fetch(`${API_BASE}/bookings/user/${encodeURIComponent(email)}`);
    const data = await res.json();
    if (!data.length) {
      resultsEl.innerHTML = '<p class="status-msg">No bookings found for that email.</p>';
      return;
    }
    resultsEl.innerHTML = data.map(renderTicket).join('');
    attachCancelHandlers();
  } catch (err) {
    resultsEl.innerHTML = '<p class="status-msg">Could not reach the server.</p>';
  }
});

function renderTicket(b) {
  const isCancelled = b.status === 'CANCELLED';
  const passengersRows = (b.passengers || []).map(p => `
    <tr>
      <td>${escapeHtml(p.name)}</td>
      <td>${p.age}</td>
      <td>${escapeHtml(p.gender)}</td>
      <td>${escapeHtml(p.seatNumber || '—')}</td>
    </tr>
  `).join('');

  return `
    <div class="ticket" data-pnr="${escapeAttr(b.pnr)}">
      <div class="ticket__main">
        <span class="ticket__status ticket__status--${isCancelled ? 'cancelled' : 'confirmed'}">
          ${isCancelled ? 'Cancelled' : 'Confirmed'}
        </span>
        <div class="ticket__route">${escapeHtml(b.source)} → ${escapeHtml(b.destination)}</div>
        <div class="ticket__train">${escapeHtml(b.trainName)} · #${escapeHtml(b.trainNumber)} · Booked by ${escapeHtml(b.userName)}</div>

        <div class="ticket__grid">
          <div><span>Journey date</span><strong>${escapeHtml(b.journeyDate)}</strong></div>
          <div><span>Seats booked</span><strong>${b.seatsBooked}</strong></div>
          <div><span>Total fare</span><strong>₹${b.totalFare.toFixed(0)}</strong></div>
        </div>

        <div class="ticket__passengers">
          <table>
            <thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Seat</th></tr></thead>
            <tbody>${passengersRows}</tbody>
          </table>
        </div>
      </div>
      <div class="ticket__stub">
        <div>
          <div class="label">PNR</div>
          <div class="ticket__code">${escapeHtml(b.pnr)}</div>
          <div class="barcode"></div>
        </div>
        <button class="btn--cancel" ${isCancelled ? 'disabled' : ''} data-pnr="${escapeAttr(b.pnr)}">
          ${isCancelled ? 'Already cancelled' : 'Cancel ticket'}
        </button>
      </div>
    </div>
  `;
}

function attachCancelHandlers() {
  document.querySelectorAll('.btn--cancel').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      if (!confirm('Cancel this ticket? Seats will be released.')) return;
      btn.disabled = true;
      btn.textContent = 'Cancelling…';
      try {
        const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(btn.dataset.pnr)}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Could not cancel booking.');
          btn.disabled = false;
          btn.textContent = 'Cancel ticket';
          return;
        }
        const ticketEl = btn.closest('.ticket');
        ticketEl.outerHTML = renderTicket(data);
        attachCancelHandlers();
        loadTickerAndStations();
      } catch (err) {
        alert('Could not reach the server.');
        btn.disabled = false;
        btn.textContent = 'Cancel ticket';
      }
    });
  });
}

// ---------- helpers ----------
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }
