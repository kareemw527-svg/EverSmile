const fs = require('node:fs');
const path = require('node:path');

const appointmentsFile = path.join(__dirname, '..', 'data', 'appointments.json');
fs.writeFileSync(appointmentsFile, '[ ]\n');
console.log('Appointment data reset.');