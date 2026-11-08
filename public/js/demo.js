// GitHub Pages sets this marker in its deployment artifact only.
// The Node.js application continues using its real API.
(() => {
  if (!window.EVERSMILE_DEMO) return;
  const storageKey = 'eversmile-portfolio-demo-v1';
  const today = new Date().toISOString().slice(0, 10);
  let records = [
    { id: 'demo-1', name: 'Demo Patient A', email: 'patient-a@example.com', service: 'Routine Cleaning', date: today, time: '9:00 AM', price: 120, status: 'Pending' },
    { id: 'demo-2', name: 'Demo Patient B', email: 'patient-b@example.com', service: 'Teeth Whitening', date: today, time: '11:00 AM', price: 250, status: 'Confirmed' },
  ];
  try {
    const stored = JSON.parse(sessionStorage.getItem(storageKey));
    if (Array.isArray(stored)) records = stored;
  } catch { /* Keep the sample data if browser storage is unavailable. */ }
  const save = () => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(records)); } catch { /* Session memory is enough for the preview. */ }
  };
  window.everSmileRequest = async (url, options = {}) => {
    const method = options.method || 'GET';
    const match = url.match(/^\/api\/appointments(?:\/([^/]+))?$/);
    if (!match) return new Response('{}', { status: 404 });
    const id = match[1];
    let body;
    if (options.body) body = JSON.parse(options.body);
    if (method === 'GET') return Response.json(records);
    if (method === 'POST') {
      const record = { ...body, id: crypto.randomUUID(), status: 'Pending' };
      records.push(record);
      save();
      return Response.json(record, { status: 201 });
    }
    const index = records.findIndex(item => item.id === id);
    if (index < 0) return Response.json({ error: 'Not found' }, { status: 404 });
    if (method === 'PATCH') {
      records[index].status = body.status;
      save();
      return Response.json(records[index]);
    }
    if (method === 'DELETE') {
      records.splice(index, 1);
      save();
      return new Response(null, { status: 204 });
    }
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  };
  document.addEventListener('DOMContentLoaded', () => {
    const note = document.createElement('aside');
    note.className = 'portfolio-demo-notice';
    note.setAttribute('aria-label', 'Portfolio demonstration notice');
    note.innerHTML = '<strong>Portfolio demo by Kareem Wael.</strong> Sample data only · no real appointments. Use fictional details. <a href="https://github.com/kareemw527-svg/EverSmile">View source ↗</a>';
    document.body.append(note);
    const confirmation = document.getElementById('confirmAlert');
    if (confirmation) confirmation.textContent = 'Demo appointment saved in this browser tab. No clinic was contacted.';
  });
})();
