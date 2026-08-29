const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const host = process.env.HOST || 'localhost';
const port = Number(process.env.PORT) || 3000;
const publicRoot = path.resolve(__dirname, '..', 'public');
const appointmentsFile = path.join(__dirname, 'data', 'appointments.json');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function send(response, statusCode, body, contentType) {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(body);
}

function sendJson(response, statusCode, payload) {
  send(response, statusCode, JSON.stringify(payload), 'application/json; charset=utf-8');
}

function readAppointments() {
  try {
    return JSON.parse(fs.readFileSync(appointmentsFile, 'utf8'));
  } catch (error) {
    return [];
  }
}

function saveAppointments(appointments) {
  fs.writeFileSync(appointmentsFile, `${JSON.stringify(appointments, null, 2)}\n`);
}

function handleApi(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const appointmentMatch = requestUrl.pathname.match(/^\/api\/appointments(?:\/([^/]+))?$/);
  if (!appointmentMatch) return false;

  const appointmentId = appointmentMatch[1];
  if (!appointmentId && request.method === 'GET') {
    sendJson(response, 200, readAppointments());
    return true;
  }

  if (!appointmentId && request.method === 'POST') {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 100000) request.destroy();
    });
    request.on('end', () => {
      try {
        const appointment = JSON.parse(body);
        const requiredFields = ['name', 'phone', 'email', 'service', 'date', 'time'];
        if (requiredFields.some(field => !String(appointment[field] || '').trim())) {
          sendJson(response, 400, { error: 'Please provide all required appointment details.' });
          return;
        }

        const appointments = readAppointments();
        const savedAppointment = {
          id: Date.now().toString(),
          name: appointment.name.trim(),
          phone: appointment.phone.trim(),
          email: appointment.email.trim(),
          insurance: String(appointment.insurance || 'None / Self-pay').trim(),
          notes: String(appointment.notes || '').trim(),
          service: appointment.service.trim(),
          date: appointment.date.trim(),
          time: appointment.time.trim(),
          price: Number(appointment.price) || 0,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        appointments.push(savedAppointment);
        saveAppointments(appointments);
        sendJson(response, 201, savedAppointment);
      } catch (error) {
        sendJson(response, 400, { error: 'The appointment request must be valid JSON.' });
      }
    });
    return true;
  }

  if (appointmentId && request.method === 'PATCH') {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      try {
        const changes = JSON.parse(body);
        const appointments = readAppointments();
        const appointment = appointments.find(item => item.id === appointmentId);
        if (!appointment) {
          sendJson(response, 404, { error: 'Appointment not found.' });
          return;
        }
        if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(changes.status)) {
          sendJson(response, 400, { error: 'Invalid appointment status.' });
          return;
        }
        appointment.status = changes.status;
        saveAppointments(appointments);
        sendJson(response, 200, appointment);
      } catch (error) {
        sendJson(response, 400, { error: 'The update request must be valid JSON.' });
      }
    });
    return true;
  }

  if (appointmentId && request.method === 'DELETE') {
    const appointments = readAppointments();
    const remaining = appointments.filter(item => item.id !== appointmentId);
    if (remaining.length === appointments.length) {
      sendJson(response, 404, { error: 'Appointment not found.' });
      return true;
    }
    saveAppointments(remaining);
    response.writeHead(204);
    response.end();
    return true;
  }

  if (request.method !== 'GET' && request.method !== 'POST') {
    sendJson(response, 405, { error: 'Method Not Allowed' });
    return false;
  }
  return false;
}

const server = http.createServer((request, response) => {
  if (handleApi(request, response)) return;

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    send(response, 405, 'Method Not Allowed', 'text/plain; charset=utf-8');
    return;
  }

  const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.slice(1);
  const filePath = path.resolve(publicRoot, relativePath);

  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${path.sep}`)) {
    send(response, 403, 'Forbidden', 'text/plain; charset=utf-8');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      send(response, 404, 'Not Found', 'text/plain; charset=utf-8');
      return;
    }

    const contentType = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, host, () => {
  console.log(`EverSmile is running at http://${host}:${port}`);
});