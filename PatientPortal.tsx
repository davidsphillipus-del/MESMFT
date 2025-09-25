/*
PatientPortal.jsx

Cleaned and fixed Patient Portal implementation.
- Removed any malformed/duplicated JSX blocks.
- Home view hides patient medical details (no medical info shown on Home).
- Medication reminders shown as admin notifications.
- Education + Diagnosis bot cards replaced with provided design.
- TreatmentEpisodesPanel implemented and working.

Save as src/PatientPortal.jsx and import/render it in your app.
*/

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Calendar, Search, Users, MessageSquare, Brain, Stethoscope } from 'lucide-react';

// Mock data
const MOCK_PATIENT = {
  id: 'P-2025-0001',
  name: 'Nangula K.',
  dob: '1996-03-12',
  gender: 'Female',
  contact: 'nangula@example.com',
  episodes: [
    {
      id: 'E-1001',
      start: '2025-09-10',
      end: '2025-09-13',
      status: 'Closed',
      presenting: ['fever', 'headache', 'abdominal pain'],
      notes: 'Presented with fever, headache and abdominal pain. RDT positive for malaria. Treated with artemisinin combination therapy (ACT). Follow-up advised.',
      attachments: [
        { id: 'A1', name: 'Episode Summary (PDF)', url: '#' },
        { id: 'A2', name: 'RDT result image', url: '#' },
      ],
    },
    {
      id: 'E-1008',
      start: '2025-07-05',
      end: '2025-07-06',
      status: 'Closed',
      presenting: ['sore throat', 'fever'],
      notes: 'Likely typhoid vs upper respiratory infection. Symptomatic treatment given.',
      attachments: [],
    },
  ],
};

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Asha Mwangi', specialty: 'Infectious Diseases', years: 12, location: 'Windhoek', rating: 4.8, telemedicine: true, languages: ['English','Oshiwambo'], nextAvailable: '2025-10-01T09:00' },
  { id: 2, name: 'Dr. Peter Naude', specialty: 'General Practitioner', years: 5, location: 'Walvis Bay', rating: 4.2, telemedicine: false, languages: ['English','Afrikaans'], nextAvailable: '2025-10-03T14:30' },
  { id: 3, name: 'Dr. L. T. Mensah', specialty: 'Pediatrics', years: 8, location: 'Windhoek', rating: 4.6, telemedicine: true, languages: ['English','French'], nextAvailable: '2025-10-02T11:00' },
];

const GLOBAL_TREATMENT_EPISODES = [
  {
    id: 'T-9001',
    patientName: 'Nangula K.',
    patientId: 'P-2025-0001',
    createdAt: '2025-09-10T08:12',
    status: 'Closed',
    summary: 'Nurse recorded fever, doctor diagnosed malaria, pharmacy dispensed ACT.',
    participants: [
      { role: 'nurse', name: 'Nurse Tamara' },
      { role: 'doctor', name: 'Dr. Asha Mwangi' },
      { role: 'pharmacist', name: 'Pharm. John' },
    ],
    timeline: [
      { who: 'nurse', time: '2025-09-10T08:12', note: 'Vitals recorded: temp 38.9C' },
      { who: 'doctor', time: '2025-09-10T09:05', note: 'Clinical exam + RDT positive. Plan: ACT' },
      { who: 'pharmacy', time: '2025-09-10T10:00', note: 'Dispensed artemether-lumefantrine' },
    ],
  },
  {
    id: 'T-9002',
    patientName: 'Amos N.',
    patientId: 'P-2025-0045',
    createdAt: '2025-08-01T11:00',
    status: 'Open',
    summary: 'Suspected typhoid - send blood culture; nurse to follow up.',
    participants: [
      { role: 'nurse', name: 'Nurse Peter' },
      { role: 'doctor', name: 'Dr. Maria Tshuma' },
    ],
    timeline: [
      { who: 'nurse', time: '2025-08-01T11:00', note: 'Reported abdominal pain, persistent fever' },
      { who: 'doctor', time: '2025-08-01T11:30', note: 'Ordered blood culture and started empirical therapy' },
    ],
  },
];

// Helpers
function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

function openPrintWindow(htmlContent, title = 'Print') {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body class="p-6 bg-white text-black">
        ${htmlContent}
      </body>
    </html>
  `);
  w.document.close();
  setTimeout(() => w.print(), 250);
}

// UI primitives
function SectionCard({ title, subtitle, icon, actions, children }) {
  return (
    <Card className="rounded-2xl">
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">{icon}</div>
            <div>
              <div className="font-semibold">{title}</div>
              {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

// Top profile
function TopProfile({ patient }) {
  return (
    <Card className="rounded-2xl">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 text-white flex items-center justify-center font-semibold text-xl shadow-inner">{patient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
          <div>
            <div className="font-semibold text-lg">{patient.name}</div>
            <div className="text-sm text-gray-600">{patient.id}</div>
            <div className="text-sm text-gray-500 mt-1">DOB: {patient.dob} - {patient.gender}</div>
            <div className="text-sm text-gray-500">Contact: {patient.contact}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Medical records view (kept for the Records tab only)
function MedicalRecordsView({ patient }) {
  const [selected, setSelected] = useState(null);

  function handlePrintEpisode(ep) {
    const html = `
      <div class="max-w-2xl mx-auto font-sans">
        <h1 class="text-2xl font-bold mb-2">Episode Summary - ${ep.id}</h1>
        <div class="text-sm text-gray-600 mb-4">Patient: ${patient.name} - ${patient.id}</div>
        <div class="mb-2"><strong>Start:</strong> ${ep.start} - <strong>End:</strong> ${ep.end} - <strong>Status:</strong> ${ep.status}</div>
        <h3 class="font-semibold mt-4">Presenting complaints</h3>
        <p>${ep.presenting.join(', ')}</p>
        <h3 class="font-semibold mt-4">Clinical Notes</h3>
        <p>${ep.notes}</p>
      </div>
    `;
    openPrintWindow(html, `Episode-${ep.id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Medical Records</h3>
        <div className="text-sm text-gray-500">Episodes & attachments</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patient.episodes.map(ep => (
          <Card key={ep.id} className="p-0 overflow-hidden rounded-2xl">
            <CardContent>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-semibold">{ep.id} <span className="text-sm text-gray-500">- {ep.status}</span></div>
                  <div className="text-sm text-gray-500">{ep.start} - {ep.end}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setSelected(ep)} className="bg-transparent border">View</Button>
                  <Button onClick={() => handlePrintEpisode(ep)} className="bg-indigo-600 text-white flex items-center gap-2"><Printer className="w-4 h-4" /> Print</Button>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-700">{ep.notes.slice(0, 180)}{ep.notes.length > 180 && '...'}</div>

              {ep.attachments.length > 0 && (
                <div className="mt-3 text-sm">
                  <div className="font-medium">Attachments</div>
                  <ul className="list-disc ml-5 text-gray-600">
                    {ep.attachments.map(a => (
                      <li key={a.id}><a href={a.url} className="text-blue-600 hover:underline">{a.name}</a></li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-2xl rounded-2xl overflow-auto">
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-semibold">Episode {selected.id}</div>
                  <div className="text-sm text-gray-500">{selected.start} - {selected.end} - {selected.status}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => handlePrintEpisode(selected)} className="bg-indigo-600 text-white flex items-center gap-2"><Printer className="w-4 h-4" /> Print</Button>
                  <Button onClick={() => setSelected(null)} className="bg-gray-100">Close</Button>
                </div>
              </div>

              <div className="p-2 space-y-4">
                <div>
                  <div className="font-medium">Presenting complaints</div>
                  <div className="text-gray-700">{selected.presenting.join(', ')}</div>
                </div>

                <div>
                  <div className="font-medium">Clinical notes</div>
                  <div className="text-gray-700 whitespace-pre-wrap">{selected.notes}</div>
                </div>

                <div>
                  <div className="font-medium">Attachments</div>
                  {selected.attachments.length ? (
                    <ul className="list-disc ml-5 text-gray-700">
                      {selected.attachments.map(a => (
                        <li key={a.id}><a href={a.url} className="text-blue-600 hover:underline">{a.name}</a></li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500">No attachments</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Explore doctors
function ExploreDoctorsPanel() {
  const [q, setQ] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [minYears, setMinYears] = useState(0);
  const [location, setLocation] = useState('');
  const [telemedicineOnly, setTelemedicineOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const filtered = MOCK_DOCTORS.filter(d => {
    if (q && !d.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (specialty && d.specialty !== specialty) return false;
    if (minYears && d.years < minYears) return false;
    if (location && !d.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (telemedicineOnly && !d.telemedicine) return false;
    return true;
  }).sort((a,b) => {
    if (sortBy === 'experience') return b.years - a.years;
    if (sortBy === 'rating') return b.rating - a.rating;
    // relevance/default: keep original order
    return a.id - b.id;
  });

  return (
    <div className="space-y-4">
      <SectionCard title="Explore Doctors" subtitle="Search by specialty, experience, location" icon={<Search className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <Input placeholder="Search name..." value={q} onChange={e => setQ(e.target.value)} />
          <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="p-2 rounded-md border">
            <option value="">All specialties</option>
            <option>Infectious Diseases</option>
            <option>General Practitioner</option>
            <option>Pediatrics</option>
            <option>Internal Medicine</option>
          </select>
          <Input type="number" placeholder="Min years" value={minYears} onChange={e => setMinYears(Number(e.target.value))} />
          <Input placeholder="Location (optional)" value={location} onChange={e => setLocation(e.target.value)} />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={telemedicineOnly} onChange={e => setTelemedicineOnly(e.target.checked)} /> Telemedicine only</label>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <div>Sort:</div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="p-1 rounded border">
              <option value="relevance">Relevance</option>
              <option value="experience">Experience</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(d => (
            <Card key={d.id} className="rounded-xl p-3">
              <CardContent className="flex items-center justify-between p-0">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-gray-500">{d.specialty} • {d.years} yrs • {d.location}</div>
                  <div className="text-xs text-gray-500">Languages: {d.languages.join(', ')}</div>
                  <div className="text-xs text-gray-500">Telemedicine: {d.telemedicine ? 'Yes' : 'No'}</div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="text-sm text-gray-600">Rating: {d.rating}</div>
                  <div className="text-xs text-gray-500">Next: {new Date(d.nextAvailable).toLocaleString()}</div>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => setSelectedDoctor(d)} className="bg-transparent border">View</Button>
                    <Button onClick={() => alert('Booking flow (demo)')} className="bg-blue-600 text-white">Book</Button>
                    <Button onClick={() => alert('Open message (demo)')} className="bg-gray-100">Message</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && <div className="text-gray-500">No doctors match your search.</div>}
        </div>
      </SectionCard>

      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-2xl rounded-2xl overflow-auto">
            <CardContent>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xl font-semibold">{selectedDoctor.name}</div>
                  <div className="text-sm text-gray-500">{selectedDoctor.specialty} • {selectedDoctor.years} yrs • {selectedDoctor.location}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setSelectedDoctor(null)} className="bg-gray-100">Close</Button>
                </div>
              </div>

              <div className="mt-4 text-gray-700">
                <div className="font-medium">About</div>
                <p className="text-sm">Experienced clinician with focus on {selectedDoctor.specialty.toLowerCase()}. Available for {selectedDoctor.telemedicine ? 'in-person and telemedicine' : 'in-person'} consultations.</p>

                <div className="mt-3">
                  <div className="font-medium">Languages</div>
                  <div className="text-sm">{selectedDoctor.languages.join(', ')}</div>
                </div>

                <div className="mt-3">
                  <div className="font-medium">Next available</div>
                  <div className="text-sm">{new Date(selectedDoctor.nextAvailable).toLocaleString()}</div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={() => { alert('Book (demo)'); setSelectedDoctor(null); }} className="bg-blue-600 text-white">Book</Button>
                  <Button onClick={() => { alert('Message (demo)'); }} className="bg-transparent border">Message</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Appointments
function AppointmentsPanel() {
  const [appointments, setAppointments] = useState([
    { id: 'A-0001', doctor: MOCK_DOCTORS[0], datetime: '2025-10-05T09:30', status: 'Confirmed' },
    { id: 'A-0002', doctor: MOCK_DOCTORS[1], datetime: '2025-11-01T14:00', status: 'Pending' },
  ]);

  const [booking, setBooking] = useState({ doctor: null, datetime: '', reason: '' });
  const [showSearch, setShowSearch] = useState(false);

  function handleBook(e) {
    e.preventDefault();
    if (!booking.doctor || !booking.datetime) {
      alert('Please select a doctor and date/time.');
      return;
    }
    const newA = {
      id: `A-${Math.floor(Math.random() * 9000) + 1000}`,
      doctor: booking.doctor,
      datetime: booking.datetime,
      status: 'Pending',
    };
    setAppointments(prev => [newA, ...prev]);
    setBooking({ doctor: null, datetime: '', reason: '' });
    setShowSearch(false);
    alert('Appointment requested (demo). Receptionist will confirm.');
  }

  function handleCancel(id) {
    if (!confirm('Cancel this appointment?')) return;
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status: 'Cancelled' } : a)));
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Book appointment" icon={<Calendar className="w-5 h-5" />}>
        <form onSubmit={handleBook} className="space-y-3">
          <div>
            <div className="text-sm text-gray-700 mb-1">Doctor</div>
            {booking.doctor ? (
              <div className="flex items-center justify-between gap-3 bg-gray-50 p-3 rounded">
                <div>
                  <div className="font-medium">{booking.doctor.name}</div>
                  <div className="text-sm text-gray-500">{booking.doctor.specialty}</div>
                </div>
                <Button onClick={() => setBooking(b => ({ ...b, doctor: null }))} className="bg-gray-100">Change</Button>
              </div>
            ) : (
              <>
                <Button type="button" onClick={() => setShowSearch(s => !s)} className="bg-blue-600 text-white">Find Doctor</Button>
                {showSearch && (
                  <div className="mt-3">
                    <ExploreDoctorsPanel />
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-700 mb-1">Preferred date & time</div>
            <Input type="datetime-local" value={booking.datetime} onChange={e => setBooking(b => ({ ...b, datetime: e.target.value }))} />
          </div>

          <div>
            <div className="text-sm text-gray-700 mb-1">Reason (optional)</div>
            <textarea value={booking.reason} onChange={e => setBooking(b => ({ ...b, reason: e.target.value }))} className="w-full p-2 border rounded" rows={2} />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-green-600 text-white">Request Appointment</Button>
            <Button type="button" className="bg-gray-100" onClick={() => setBooking({ doctor: null, datetime: '', reason: '' })}>Reset</Button>
          </div>
        </form>
      </SectionCard>

      <div>
        <h4 className="font-semibold mb-2">Upcoming & Recent Appointments</h4>
        <div className="space-y-3">
          {appointments.map(a => (
            <Card key={a.id} className="p-3 rounded-xl">
              <CardContent className="flex justify-between items-center p-0">
                <div>
                  <div className="font-medium">{a.doctor.name} - {a.doctor.specialty}</div>
                  <div className="text-sm text-gray-600">{formatDate(a.datetime)} - {new Date(a.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-sm text-gray-500">Status: {a.status}</div>
                </div>
                <div className="flex items-center gap-2">
                  {a.status !== "Cancelled" && <Button onClick={() => handleCancel(a.id)} className="bg-red-600 text-white">Cancel</Button>}
                  <Button className="bg-transparent border">Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Treatment episodes
function TreatmentEpisodesPanel({ episodes = GLOBAL_TREATMENT_EPISODES }) {
  return (
    <SectionCard title="Treatment Episodes" subtitle="Global view of care episodes" icon={<Users className="w-5 h-5" />}>
      <div className="space-y-4">
        {episodes.map(ep => (
          <Card key={ep.id} className="rounded-xl">
            <CardContent>
              <div className="font-semibold">{ep.id} - {ep.patientName} - {ep.status}</div>
              <div className="text-sm text-gray-500">{formatDate(ep.createdAt)}</div>
              <div className="mt-2 text-gray-700">{ep.summary}</div>
              <div className="mt-3">
                <div className="font-medium">Participants</div>
                <ul className="text-sm text-gray-600">
                  {ep.participants.map(p => (
                    <li key={p.role}>{p.role}: {p.name}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionCard>
  );
}

// Short bot card (link style)
function ShortBotCard({ title, subtitle, icon, href }) {
  return (
    <Card className="rounded-2xl">
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">{icon}</div>
            <div>
              <div className="font-semibold">{title}</div>
              {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
            </div>
          </div>
          <div>
            <a href={href} className="inline-block bg-blue-600 text-white px-3 py-2 rounded-md">Open</a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main page
export default function PatientPortal() {
  const [tab, setTab] = useState('home'); // home | records | appointments | doctors | episodes

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
      <header className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-blue-700">MESMTF</div>
            <div className="text-sm text-gray-600">Patient Portal</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Signed in as <strong>{MOCK_PATIENT.name}</strong></div>
            <Button className="bg-transparent border">Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-4">
          <TopProfile patient={MOCK_PATIENT} />

          <Card className="rounded-2xl">
            <CardContent>
              <div className="space-y-2">
                <button className={`w-full text-left p-3 rounded-lg ${tab==='home' ? 'bg-blue-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('home')}>Home</button>
                <button className={`w-full text-left p-3 rounded-lg ${tab==='records' ? 'bg-blue-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('records')}>Medical Records</button>
                <button className={`w-full text-left p-3 rounded-lg ${tab==='appointments' ? 'bg-blue-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('appointments')}>Appointments</button>
                <button className={`w-full text-left p-3 rounded-lg ${tab==='doctors' ? 'bg-blue-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('doctors')}>Find Doctors</button>
                <button className={`w-full text-left p-3 rounded-lg ${tab==='episodes' ? 'bg-blue-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('episodes')}>Treatment Episodes</button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent>
              <div className="text-sm text-gray-700">
                <div className="font-medium">Quick actions</div>
                <div className="mt-2 space-y-2">
                  <Button onClick={()=>setTab('records')} className="w-full bg-indigo-600 text-white flex items-center gap-2"><Printer className="w-4 h-4" /> Print latest record</Button>
                  <Button onClick={()=>setTab('appointments')} className="w-full bg-blue-600 text-white flex items-center gap-2"><Calendar className="w-4 h-4" /> Book appointment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="lg:col-span-3 space-y-6">
          {tab === 'home' && (
            <div className="space-y-6">
              <SectionCard title={`Welcome back, ${MOCK_PATIENT.name.split(" ")[0]}`} subtitle={`Account ID: ${MOCK_PATIENT.id}`} icon={<Users className="w-5 h-5" />}>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="rounded-xl p-3">
                    <CardContent className="p-0 text-center">
                      <div className="text-sm text-gray-600">Medication reminders</div>
                      <div className="text-2xl font-bold">1</div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl p-3">
                    <CardContent className="p-0 text-center">
                      <div className="text-sm text-gray-600">Administration notices</div>
                      <div className="text-2xl font-bold">2</div>
                    </CardContent>
                  </Card>
                </div>

                <section className="grid md:grid-cols-2 gap-6 p-8 max-w-4xl mx-auto">
                  <Card className="shadow-md hover:shadow-lg transition rounded-2xl">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <Brain className="h-12 w-12 text-green-600 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Education Bot</h3>
                      <p className="text-gray-600">Learn about diseases, prevention, and treatment through an interactive AI tutor.</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md hover:shadow-lg transition rounded-2xl">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <Stethoscope className="h-12 w-12 text-red-600 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Diagnosis Bot</h3>
                      <p className="text-gray-600">Guided Q&A to provide AI-assisted diagnostic support for multiple conditions.</p>
                    </CardContent>
                  </Card>
                </section>
              </SectionCard>
            </div>
          )}

          {tab === 'records' && <MedicalRecordsView patient={MOCK_PATIENT} />}

          {tab === 'appointments' && <AppointmentsPanel />}

          {tab === 'doctors' && <ExploreDoctorsPanel />}

          {tab === 'episodes' && <TreatmentEpisodesPanel />}
        </section>
      </main>

      <footer className="text-center p-6 text-gray-600">© 2025 MESMTF</footer>
    </div>
  );
}
