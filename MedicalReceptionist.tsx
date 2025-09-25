import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Calendar, Search, Users, FileText, Clock, Phone, Mail } from "lucide-react";

// --- Mock data -------------------------------------------------
const MOCK_RECEPTIONIST = {
  id: "R-2001",
  name: "Maria Shilongo",
  department: "Front Desk",
  location: "Windhoek Central Clinic",
  shift: "Day Shift (8:00 - 16:00)",
  contact: "maria@example.com",
};

const MOCK_PATIENTS = [
  { id: "P-2025-0001", name: "Nangula K.", dob: "1996-03-12", contact: "nangula@example.com", phone: "+264-81-234-5678", address: "Klein Windhoek", lastVisit: "2025-09-10" },
  { id: "P-2025-0045", name: "Amos N.", dob: "1982-05-21", contact: "amos@example.com", phone: "+264-85-876-5432", address: "Katutura", lastVisit: "2025-08-15" },
  { id: "P-2025-0089", name: "Helena M.", dob: "1990-11-08", contact: "helena@example.com", phone: "+264-81-555-1234", address: "Pioneers Park", lastVisit: "2025-09-20" },
];

const MOCK_DOCTORS = [
  { id: "D-1001", name: "Dr. Asha Mwangi", specialty: "Infectious Diseases", available: true },
  { id: "D-1002", name: "Dr. Johannes Hamutenya", specialty: "General Practice", available: true },
  { id: "D-1003", name: "Dr. Sarah Nakale", specialty: "Pediatrics", available: false },
];

const INITIAL_APPOINTMENTS = [
  { id: "A-100", patientId: "P-2025-0001", patientName: "Nangula K.", doctorId: "D-1001", doctorName: "Dr. Asha Mwangi", datetime: "2025-09-25T10:30", status: "Confirmed", type: "Follow-up" },
  { id: "A-101", patientId: "P-2025-0045", patientName: "Amos N.", doctorId: "D-1002", doctorName: "Dr. Johannes Hamutenya", datetime: "2025-09-25T14:00", status: "Pending", type: "Consultation" },
  { id: "A-102", patientId: "P-2025-0089", patientName: "Helena M.", doctorId: "D-1001", doctorName: "Dr. Asha Mwangi", datetime: "2025-09-26T09:00", status: "Confirmed", type: "Check-up" },
];

const INITIAL_QUEUE = [
  { id: "Q-001", patientId: "P-2025-0001", patientName: "Nangula K.", arrivalTime: "2025-09-25T10:25", status: "Waiting", priority: "Normal" },
  { id: "Q-002", patientId: "P-2025-0045", patientName: "Amos N.", arrivalTime: "2025-09-25T13:55", status: "In Consultation", priority: "Urgent" },
];

// helpers
function fmt(d) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString();
}

function fmtTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// UI primitives
function SectionCard({ title, subtitle, icon, actions, children }) {
  return (
    <Card className="rounded-2xl">
      <CardContent>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 text-green-600">{icon}</div>
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

function TopProfile({ receptionist }) {
  return (
    <Card className="rounded-2xl">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-300 to-green-500 text-white flex items-center justify-center font-semibold text-xl shadow-inner">{receptionist.name.split(" ").map(n => n[0]).slice(0,2).join("")}</div>
          <div>
            <div className="font-semibold text-lg">{receptionist.name}</div>
            <div className="text-sm text-gray-600">{receptionist.id}</div>
            <div className="text-sm text-gray-500 mt-1">{receptionist.department} • {receptionist.shift}</div>
            <div className="text-sm text-gray-500">Contact: {receptionist.contact}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Patient Registration Modal
function PatientRegistrationModal({ onClose, onRegister }) {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: ""
  });

  const handleSubmit = () => {
    if (formData.name && formData.dob && formData.phone) {
      const newPatient = {
        id: `P-2025-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
        ...formData,
        contact: formData.email,
        lastVisit: new Date().toISOString().split('T')[0]
      };
      onRegister(newPatient);
      onClose();
    } else {
      alert("Please fill in required fields: Name, Date of Birth, and Phone");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-2xl rounded-2xl">
        <CardContent>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xl font-semibold">Register New Patient</div>
              <div className="text-sm text-gray-500">Fill in patient details</div>
            </div>
            <Button onClick={onClose} className="bg-gray-100">Cancel</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth *</label>
              <Input 
                type="date"
                value={formData.dob} 
                onChange={e => setFormData({...formData, dob: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <Input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+264-81-xxx-xxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <Input 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="patient@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="Street address, area, city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Emergency Contact</label>
              <Input 
                value={formData.emergencyContact} 
                onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
                placeholder="Emergency contact name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Emergency Phone</label>
              <Input 
                value={formData.emergencyPhone} 
                onChange={e => setFormData({...formData, emergencyPhone: e.target.value})}
                placeholder="+264-81-xxx-xxxx"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={onClose} className="bg-gray-100">Cancel</Button>
            <Button onClick={handleSubmit} className="bg-green-600 text-white">Register Patient</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Appointment Booking Modal
function AppointmentModal({ onClose, onBook, patients, doctors }) {
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    type: "Consultation",
    notes: ""
  });

  const handleSubmit = () => {
    if (formData.patientId && formData.doctorId && formData.date && formData.time) {
      const patient = patients.find(p => p.id === formData.patientId);
      const doctor = doctors.find(d => d.id === formData.doctorId);
      const newAppointment = {
        id: `A-${Math.floor(Math.random() * 9000) + 1000}`,
        patientId: formData.patientId,
        patientName: patient?.name || "",
        doctorId: formData.doctorId,
        doctorName: doctor?.name || "",
        datetime: `${formData.date}T${formData.time}`,
        status: "Confirmed",
        type: formData.type,
        notes: formData.notes
      };
      onBook(newAppointment);
      onClose();
    } else {
      alert("Please fill in all required fields");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-2xl rounded-2xl">
        <CardContent>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xl font-semibold">Book Appointment</div>
              <div className="text-sm text-gray-500">Schedule patient appointment</div>
            </div>
            <Button onClick={onClose} className="bg-gray-100">Cancel</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Patient *</label>
              <select 
                className="w-full p-2 border rounded"
                value={formData.patientId} 
                onChange={e => setFormData({...formData, patientId: e.target.value})}
              >
                <option value="">Select patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Doctor *</label>
              <select 
                className="w-full p-2 border rounded"
                value={formData.doctorId} 
                onChange={e => setFormData({...formData, doctorId: e.target.value})}
              >
                <option value="">Select doctor</option>
                {doctors.filter(d => d.available).map(d => (
                  <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <Input 
                type="date"
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time *</label>
              <Input 
                type="time"
                value={formData.time} 
                onChange={e => setFormData({...formData, time: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Appointment Type</label>
              <select 
                className="w-full p-2 border rounded"
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Check-up">Check-up</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Input 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={onClose} className="bg-gray-100">Cancel</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 text-white">Book Appointment</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Patient Search Panel
function PatientSearchPanel({ patients, onSelect }) {
  const [q, setQ] = useState("");
  const results = patients.filter(p => 
    p.name.toLowerCase().includes(q.toLowerCase()) || 
    p.id.toLowerCase().includes(q.toLowerCase()) ||
    p.phone.includes(q)
  );

  return (
    <SectionCard title="Patient Search" subtitle="Find existing patients" icon={<Search className="w-5 h-5" />}>
      <div className="space-y-3">
        <Input placeholder="Search by name, ID, or phone" value={q} onChange={e => setQ(e.target.value)} />
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.map(p => (
            <Card key={p.id} className="p-3 rounded-xl">
              <CardContent className="p-0">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-500">{p.id} • DOB: {fmtDate(p.dob)}</div>
                    <div className="text-sm text-gray-500">Phone: {p.phone}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button onClick={() => onSelect && onSelect(p)} className="bg-blue-600 text-white text-xs">View</Button>
                    <Button onClick={() => alert(`Call ${p.name} at ${p.phone}`)} className="bg-green-600 text-white text-xs">
                      <Phone className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {results.length === 0 && <div className="text-sm text-gray-500">No patients found.</div>}
        </div>
      </div>
    </SectionCard>
  );
}

// Main Receptionist Portal
export default function ReceptionistPortal() {
  const [tab, setTab] = useState('home'); // home | appointments | patients | queue | reports
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  function registerPatient(newPatient) {
    setPatients(prev => [...prev, newPatient]);
  }

  function bookAppointment(newAppointment) {
    setAppointments(prev => [...prev, newAppointment]);
  }

  function confirmAppointment(id) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Confirmed' } : a));
  }

  function cancelAppointment(id) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
  }

  function checkInPatient(queueId) {
    setQueue(prev => prev.map(q => q.id === queueId ? { ...q, status: 'In Consultation' } : q));
  }

  function completeVisit(queueId) {
    setQueue(prev => prev.filter(q => q.id !== queueId));
  }

  const todayAppointments = appointments.filter(a => 
    new Date(a.datetime).toDateString() === new Date().toDateString()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-12">
      <header className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-green-700">MESMTF</div>
            <div className="text-sm text-gray-600">Receptionist Portal</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Signed in as <strong>{MOCK_RECEPTIONIST.name}</strong></div>
            <Button className="bg-transparent border">Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-4">
          <TopProfile receptionist={MOCK_RECEPTIONIST} />

          <Card className="rounded-2xl">
            <CardContent>
              <div className="space-y-2">
                <button className={`w-full text-left p-3 rounded-lg ${tab==='home' ? 'bg-green-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('home')}>Home</button>
                <button className={`w-full text-left p-3 rounded-lg ${tab==='appointments' ? 'bg-green-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('appointments')}>Appointments</button>
                <button className={`w-full text-left p-3 rounded-lg ${tab==='patients' ? 'bg-green-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('patients')}>Patients</button>
                <button className={`w-full text-left p-3 rounded-lg ${tab==='queue' ? 'bg-green-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('queue')}>Patient Queue</button>
                <button className={`w-full text-left p-3 rounded-lg ${tab==='reports' ? 'bg-green-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('reports')}>Reports</button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent>
              <div className="text-sm text-gray-700">
                <div className="font-medium">Quick actions</div>
                <div className="mt-2 space-y-2">
                  <Button onClick={()=>setShowPatientModal(true)} className="w-full bg-green-600 text-white flex items-center gap-2"><UserPlus className="w-4 h-4" /> Register Patient</Button>
                  <Button onClick={()=>setShowAppointmentModal(true)} className="w-full bg-blue-600 text-white flex items-center gap-2"><Calendar className="w-4 h-4" /> Book Appointment</Button>
                  <Button onClick={()=>setTab('queue')} className="w-full bg-purple-600 text-white flex items-center gap-2"><Clock className="w-4 h-4" /> View Queue</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="lg:col-span-3 space-y-6">
          {tab === 'home' && (
            <div className="space-y-6">
              <SectionCard title={`Welcome, ${MOCK_RECEPTIONIST.name.split(" ")[0]}`} subtitle={`${MOCK_RECEPTIONIST.department} - ${MOCK_RECEPTIONIST.location}`} icon={<Users className="w-5 h-5" />}>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="rounded-xl p-3">
                    <CardContent className="p-0 text-center">
                      <div className="text-sm text-gray-600">Today's Appointments</div>
                      <div className="text-2xl font-bold">{todayAppointments.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl p-3">
                    <CardContent className="p-0 text-center">
                      <div className="text-sm text-gray-600">Patients Waiting</div>
                      <div className="text-2xl font-bold">{queue.filter(q => q.status === 'Waiting').length}</div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl p-3">
                    <CardContent className="p-0 text-center">
                      <div className="text-sm text-gray-600">Total Patients</div>
                      <div className="text-2xl font-bold">{patients.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl p-3">
                    <CardContent className="p-0 text-center">
                      <div className="text-sm text-gray-600">Pending Confirmations</div>
                      <div className="text-2xl font-bold">{appointments.filter(a => a.status === 'Pending').length}</div>
                    </CardContent>
                  </Card>
                </div>
              </SectionCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title="Today's Schedule" subtitle="Upcoming appointments" icon={<Calendar className="w-5 h-5" />}>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {todayAppointments.slice(0, 5).map(a => (
                      <Card key={a.id} className="p-2 rounded-lg">
                        <CardContent className="p-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">{a.patientName}</div>
                              <div className="text-xs text-gray-500">{fmtTime(a.datetime)} • {a.doctorName}</div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded ${a.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {a.status}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {todayAppointments.length === 0 && <div className="text-sm text-gray-500">No appointments today</div>}
                  </div>
                </SectionCard>

                <SectionCard title="Patient Queue" subtitle="Currently waiting" icon={<Clock className="w-5 h-5" />}>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {queue.map(q => (
                      <Card key={q.id} className="p-2 rounded-lg">
                        <CardContent className="p-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">{q.patientName}</div>
                              <div className="text-xs text-gray-500">Arrived: {fmtTime(q.arrivalTime)}</div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded ${q.status === 'Waiting' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {q.status}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {queue.length === 0 && <div className="text-sm text-gray-500">No patients waiting</div>}
                  </div>
                </SectionCard>
              </div>
            </div>
          )}

          {tab === 'appointments' && (
            <SectionCard 
              title="Appointments Management" 
              subtitle="Schedule and manage appointments" 
              icon={<Calendar className="w-5 h-5" />}
              actions={<Button onClick={()=>setShowAppointmentModal(true)} className="bg-blue-600 text-white">Book New</Button>}
            >
              <div className="space-y-4">
                {appointments.map(a => (
                  <Card key={a.id} className="p-0 rounded-2xl">
                    <CardContent>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="font-semibold">{a.patientName} <span className="text-sm text-gray-500">• {a.type}</span></div>
                          <div className="text-sm text-gray-500">{fmt(a.datetime)} • {a.doctorName}</div>
                          <div className={`inline-block text-xs px-2 py-1 rounded mt-1 ${a.status === 'Confirmed' ? 'bg-green-100 text-green-800' : a.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {a.status}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {a.status === 'Pending' && <Button onClick={() => confirmAppointment(a.id)} className="bg-green-600 text-white">Confirm</Button>}
                          {a.status !== 'Cancelled' && <Button onClick={() => cancelAppointment(a.id)} className="bg-red-600 text-white">Cancel</Button>}
                          <Button onClick={() => alert(`Contact ${a.patientName}`)} className="bg-blue-600 text-white"><Phone className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {appointments.length === 0 && <div className="text-gray-500">No appointments scheduled</div>}
              </div>
            </SectionCard>
          )}

          {tab === 'patients' && (
            <div className="space-y-6">
              <SectionCard 
                title="Patient Management" 
                subtitle="Register and manage patient records" 
                icon={<Users className="w-5 h-5" />}
                actions={<Button onClick={()=>setShowPatientModal(true)} className="bg-green-600 text-white">Register New</Button>}
              >
                <PatientSearchPanel patients={patients} onSelect={(p) => alert(`Patient Details:\n${p.name}\nID: ${p.id}\nPhone: ${p.phone}\nAddress: ${p.address}`)} />
              </SectionCard>
            </div>
          )}

          {tab === 'queue' && (
            <SectionCard title="Patient Queue Management" subtitle="Manage waiting patients" icon={<Clock className="w-5 h-5" />}>
              <div className="space-y-4">
                {queue.map(q => (
                  <Card key={q.id} className="p-0 rounded-2xl">
                    <CardContent>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="font-semibold">{q.patientName} 
                            {q.priority === 'Urgent' && <span className="ml-2 text-xs px-2 py-1 bg-red-100 text-red-800 rounded">URGENT</span>}
                          </div>
                          <div className="text-sm text-gray-500">Arrived: {fmt(q.arrivalTime)} • Status: {q.status}</div>
                          <div className="text-sm text-gray-500">Patient ID: {q.patientId}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {q.status === 'Waiting' && <Button onClick={() => checkInPatient(q.id)} className="bg-blue-600 text-white">Check In</Button>}
                          {q.status === 'In Consultation' && <Button onClick={() => completeVisit(q.id)} className="bg-green-600 text-white">Complete</Button>}
                          <Button onClick={() => alert(`Call patient ${q.patientName}`)} className="bg-gray-600 text-white"><Phone className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {queue.length === 0 && <div className="text-gray-500">No patients in queue</div>}
              </div>
            </SectionCard>
          )}

          {tab === 'reports' && (
            <SectionCard title="Reports & Statistics" subtitle="Daily reports and analytics" icon={<FileText className="w-5 h-5" />}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="rounded-xl p-4">
                    <CardContent className="p-0 text-center">
                      <div className="text-sm text-gray-600">Appointments Today</div>
                      <div className="text-3xl font-bold text-blue-600">{todayAppointments.length}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {todayAppointments.filter(a => a.status === 'Confirmed').length} confirmed
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl p-4">
                    <CardContent className="p-0 text-center">
                      <div className="text-sm text-gray-600">New Patients</div>
                      <div className="text-3xl font-bold text-green-600">
                        {patients.filter(p => p.lastVisit === new Date().toISOString().split('T')[0]).length}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">registered today</div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl p-4">
                    <CardContent className="p-0 text-center">
                      <div className="text-sm text-gray-600">Average Wait Time</div>
                      <div className="text-3xl font-bold text-purple-600">15</div>
                      <div className="text-xs text-gray-500 mt-1">minutes</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-xl p-4">
                    <CardContent className="p-0">
                      <div className="font-medium mb-3">Doctor Availability</div>
                      <div className="space-y-2">
                        {MOCK_DOCTORS.map(d => (
                          <div key={d.id} className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">{d.name}</div>
                              <div className="text-xs text-gray-500">{d.specialty}</div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded ${d.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {d.available ? 'Available' : 'Busy'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl p-4">
                    <CardContent className="p-0">
                      <div className="font-medium mb-3">Quick Reports</div>
                      <div className="space-y-2">
                        <Button onClick={() => alert('Daily summary report generated')} className="w-full bg-blue-600 text-white justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          Daily Summary Report
                        </Button>
                        <Button onClick={() => alert('Patient list exported')} className="w-full bg-green-600 text-white justify-start">
                          <Users className="w-4 h-4 mr-2" />
                          Export Patient List
                        </Button>
                        <Button onClick={() => alert('Appointment schedule printed')} className="w-full bg-purple-600 text-white justify-start">
                          <Calendar className="w-4 h-4 mr-2" />
                          Print Schedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-xl p-4">
                  <CardContent className="p-0">
                    <div className="font-medium mb-3">Recent Activity</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Last patient registered:</span>
                        <span className="text-gray-600">{patients[patients.length - 1]?.name || 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next appointment:</span>
                        <span className="text-gray-600">
                          {appointments.find(a => new Date(a.datetime) > new Date())?.patientName || 'None scheduled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Patients seen today:</span>
                        <span className="text-gray-600">{todayAppointments.filter(a => a.status === 'Completed').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SectionCard>
          )}
        </section>
      </main>

      <footer className="text-center p-6 text-gray-600">© 2025 MESMTF</footer>

      {showPatientModal && (
        <PatientRegistrationModal
          onClose={() => setShowPatientModal(false)}
          onRegister={registerPatient}
        />
      )}

      {showAppointmentModal && (
        <AppointmentModal
          onClose={() => setShowAppointmentModal(false)}
          onBook={bookAppointment}
          patients={patients}
          doctors={MOCK_DOCTORS}
        />
      )}
    </div>
  );
}