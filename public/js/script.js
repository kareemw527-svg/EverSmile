document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Services page: category filter ---------- */
  const filterBar = document.getElementById('filterBar');
  if (filterBar) {
    const pills = filterBar.querySelectorAll('.filter-pill');
    const items = document.querySelectorAll('.service-item');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter;
        items.forEach(item => {
          const cats = item.dataset.cat.split(' ');
          const show = filter === 'all' || cats.includes(filter);
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Booking page ---------- */
  const serviceSelect = document.getElementById('serviceSelect');
  const sumService = document.getElementById('sumService');
  const sumPrice = document.getElementById('sumPrice');
  const sumTime = document.getElementById('sumTime');
  const sumDate = document.getElementById('sumDate');
  const apptDate = document.getElementById('apptDate');
  let selectedService = 'Routine Cleaning';
  let selectedPrice = 120;
  let selectedTime = '9:00 AM';

  if (serviceSelect) {
    const cards = serviceSelect.querySelectorAll('.select-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedService = card.dataset.service;
        selectedPrice = Number(card.dataset.price);
        sumService.textContent = card.dataset.service;
        sumPrice.textContent = card.dataset.price === '0' ? 'Free' : '$' + card.dataset.price;
      });
    });
  }

  const timeSlots = document.querySelectorAll('.time-slot:not(.disabled)');
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      selectedTime = slot.dataset.time;
      if (sumTime) sumTime.textContent = slot.dataset.time;
    });
  });

  if (apptDate) {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    apptDate.min = today.toISOString().split('T')[0];
    apptDate.addEventListener('change', () => {
      const d = new Date(apptDate.value + 'T00:00:00');
      sumDate.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    });
  }

  const bookingForm = document.getElementById('bookingForm');
  const confirmAlert = document.getElementById('confirmAlert');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitButton = bookingForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: document.getElementById('patientName').value,
            phone: document.getElementById('patientPhone').value,
            email: document.getElementById('patientEmail').value,
            insurance: document.getElementById('insurance').value,
            notes: document.getElementById('notes').value,
            service: selectedService,
            price: selectedPrice,
            date: apptDate.value,
            time: selectedTime
          })
        });
        if (!response.ok) throw new Error('Unable to save appointment');
        confirmAlert.classList.remove('d-none');
        confirmAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
        bookingForm.reset();
      } catch (error) {
        confirmAlert.classList.remove('d-none');
        confirmAlert.classList.add('alert-danger');
        confirmAlert.textContent = 'Unable to save your appointment. Please try again.';
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  /* ---------- Admin dashboard: live appointments and actions ---------- */
  const appointmentsBody = document.getElementById('appointmentsBody');
  const totalPatients = document.getElementById('totalPatients');
  const appointmentsToday = document.getElementById('appointmentsToday');
  const revenueTotal = document.getElementById('revenueTotal');
  const pendingAppointments = document.getElementById('pendingAppointments');
  const confirmedAppointments = document.getElementById('confirmedAppointments');
  const activityList = document.getElementById('activityList');
  let dashboardAppointments = [];

  const escapeHtml = value => String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  const renderDashboard = () => {
    const today = new Date().toISOString().slice(0, 10);
    const patients = new Set(dashboardAppointments.map(appointment => appointment.email));
    const todayAppointments = dashboardAppointments.filter(appointment => appointment.date === today);
    const pending = dashboardAppointments.filter(appointment => appointment.status === 'Pending');
    const confirmed = dashboardAppointments.filter(appointment => appointment.status === 'Confirmed');
    const revenue = dashboardAppointments.filter(appointment => appointment.status !== 'Cancelled').reduce((total, appointment) => total + appointment.price, 0);
    if (totalPatients) totalPatients.textContent = patients.size;
    if (appointmentsToday) appointmentsToday.textContent = todayAppointments.length;
    if (revenueTotal) revenueTotal.textContent = `$${revenue.toLocaleString()}`;
    if (pendingAppointments) pendingAppointments.textContent = pending.length;
    if (confirmedAppointments) confirmedAppointments.textContent = confirmed.length;
    if (appointmentsBody) {
      appointmentsBody.innerHTML = dashboardAppointments.length ? dashboardAppointments.slice().reverse().map(appointment => {
        const initials = appointment.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
        const date = new Date(`${appointment.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const statusClass = appointment.status.toLowerCase() === 'confirmed' ? 'badge-confirmed' : appointment.status.toLowerCase() === 'cancelled' ? 'badge-cancelled' : 'badge-pending';
        return `<tr><td><div class="d-flex align-items-center gap-2"><div class="avatar-circle" style="width:32px;height:32px;font-size:0.75rem;">${escapeHtml(initials)}</div> ${escapeHtml(appointment.name)}</div></td><td>${escapeHtml(appointment.service)}</td><td class="mono">${date}</td><td class="mono">${escapeHtml(appointment.time)}</td><td><span class="badge-status ${statusClass}">${escapeHtml(appointment.status)}</span></td><td><div class="d-flex gap-1"><button class="btn btn-sm btn-outline-line appointment-status" data-id="${appointment.id}" data-status="Confirmed" title="Confirm appointment"><i class="bi bi-check"></i></button><button class="btn btn-sm btn-outline-line appointment-status" data-id="${appointment.id}" data-status="Cancelled" title="Cancel appointment"><i class="bi bi-x"></i></button><button class="btn btn-sm btn-outline-line appointment-delete" data-id="${appointment.id}" title="Delete appointment"><i class="bi bi-trash"></i></button></div></td></tr>`;
      }).join('') : '<tr><td colspan="6" class="text-muted-custom text-center py-4">No appointments found.</td></tr>';
    }
    if (activityList) activityList.innerHTML = dashboardAppointments.slice().reverse().slice(0, 5).map(appointment => `<div class="activity-item"><div class="activity-dot"></div><div><div class="small">${escapeHtml(appointment.status)} appointment</div><div class="text-muted-custom" style="font-size:0.78rem;">${escapeHtml(appointment.name)} · ${escapeHtml(appointment.service)}</div></div></div>`).join('');
  };

  if (appointmentsBody) {
    fetch('/api/appointments')
      .then(response => response.json())
      .then(appointments => {
        dashboardAppointments = appointments;
        renderDashboard();
      })
      .catch(() => {});
  }

  if (appointmentsBody) {
    appointmentsBody.addEventListener('click', async event => {
      const statusButton = event.target.closest('.appointment-status');
      const deleteButton = event.target.closest('.appointment-delete');
      const button = statusButton || deleteButton;
      if (!button) return;
      const isDelete = Boolean(deleteButton);
      if (isDelete && !window.confirm('Delete this appointment?')) return;
      const response = await fetch(`/api/appointments/${button.dataset.id}`, { method: isDelete ? 'DELETE' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: isDelete ? undefined : JSON.stringify({ status: button.dataset.status }) });
      if (response.ok) {
        dashboardAppointments = dashboardAppointments.filter(appointment => appointment.id !== button.dataset.id);
        if (!isDelete) {
          const updated = await response.json();
          dashboardAppointments.push(updated);
        }
        renderDashboard();
      }
    });
  }

  /* ---------- Admin dashboard: sidebar toggle (mobile) ---------- */
  const sidebarToggle = document.getElementById('sidebarToggle');
  const adminSidebar = document.getElementById('adminSidebar');
  if (sidebarToggle && adminSidebar) {
    sidebarToggle.addEventListener('click', () => adminSidebar.classList.toggle('open'));
  }

  /* ---------- Admin dashboard: revenue chart ---------- */
  const chartCanvas = document.getElementById('revenueChart');
  if (chartCanvas && window.Chart) {
    const ctx = chartCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(34, 230, 197, 0.35)');
    gradient.addColorStop(1, 'rgba(34, 230, 197, 0)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Revenue',
          data: [520, 610, 480, 700, 860, 640, 440],
          borderColor: '#22e6c5',
          backgroundColor: gradient,
          borderWidth: 2.5,
          pointBackgroundColor: '#0a0f1a',
          pointBorderColor: '#22e6c5',
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#8a97ac', font: { family: 'Inter', size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: '#8a97ac',
              font: { family: 'Inter', size: 11 },
              callback: (v) => '$' + v
            }
          }
        }
      }
    });
  }

});
