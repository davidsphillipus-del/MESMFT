import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Calendar, Search, Users, MessageSquare, Brain, FileText } from "lucide-react";

// --- Mock data -------------------------------------------------
const MOCK_NURSE = {
  id: "N-2001",
  name: "Nurse Tamara Iipinge",
  specialty: "General Practice",
  location: "Windhoek",
  years: 8,
  contact: "tamara@example.com",
};

const MOCK_PATIENTS = [
  { id: "P-2025-0001", name: "Nangula K.", dob: "1996-03-12", contact: "nangula@example.com" },
  { id: "P-2025-0045", name: "Amos N.", dob: "1982-05-21", contact: "amos@example.com" },
];

const INITIAL_EPISODES = [
  {
    id: "T-9001",
    patientId: "P-2025-0001",
    patientName: "Nangula K.",
    start: "2025-09-10T08:10",
    status: "Open",
    summary: "Presenting with fever and headache. RDT positive for malaria (nurse recorded).",
    participants: [
      { role: "nurse", name: "Nurse Tamara" },
      { role: "doctor", name: "Dr. Asha Mwangi" },
    ],
    observations: [
      { who: "nurse", time: "2025-09-10T08:12", note: "Temp 38.9 C; pulse 98" },
    ],
    diagnoses: [],
    prescriptions: [],
  },
];

const MOCK_APPOINTMENTS = [
  { id: "A-100", patientId: "P-2025-0001", patientName: "Nangula K.", datetime: "2025-10-05T09:30", status: "Confirmed" },
];

// helpers
function fmt(d) {
  if (!d) return "";
  return new Date(d).toLocaleString();
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

function TopProfile({ nurse }) {
  return (
    <Card className="rounded-2xl">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 text-white flex items-center justify-center font-semibold text-xl shadow-inner">{nurse.name.split(" ").map(n => n[0]).slice(0,2).join("")}</div>
          <div>
            <div className="font-semibold text-lg">{nurse.name}</div>
            <div className="text-sm text-gray-600">{nurse.id}</div>
            <div className="text-sm text-gray-500 mt-1">{nurse.specialty} • {nurse.years} yrs</div>
            <div className="text-sm text-gray-500">Contact: {nurse.contact}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Episode viewer (kept simple and reused)
function EpisodeModal({ episode, onClose, onAddObservation, onAddDiagnosis, onAddPrescription, onCloseEpisode }) {
  const [obsText, setObsText] = useState("");
  const [symptomsText, setSymptomsText] = useState("");
  const [diagText, setDiagText] = useState("");
  const [prescText, setPrescText] = useState("");

  if (!episode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-4xl rounded-2xl overflow-auto">
        <CardContent>
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-xl font-semibold">Episode {episode.id} — {episode.patientName}</div>
              <div className="text-sm text-gray-500">Started: {fmt(episode.start)} • Status: {episode.status}</div>
            </div>
            <div className="flex gap-2">
              {episode.status !== 'Closed' && <Button onClick={() => onCloseEpisode(episode.id)} className="bg-indigo-600 text-white">Close Episode</Button>}
              <Button onClick={onClose} className="bg-gray-100">Close</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium">Summary</div>
              <div className="text-sm text-gray-700 mb-3">{episode.summary}</div>

              <div className="font-medium">Timeline & observations</div>
              <ul className="list-disc ml-5 text-sm text-gray-700">
                {episode.observations.map((o, idx) => (
                  <li key={idx}>{fmt(o.time)} — <strong>{o.who}</strong>: {o.note}</li>
                ))}
              </ul>

              <div className="mt-3">
                <div className="text-sm font-medium">Add observation</div>
                <textarea value={obsText} onChange={e => setObsText(e.target.value)} className="w-full p-2 border rounded mt-1" rows={3} />
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => { if (obsText.trim()) { onAddObservation(episode.id, obsText.trim()); setObsText(""); } }} className="bg-blue-600 text-white">Add</Button>
                  <Button className="bg-gray-100" onClick={() => setObsText("")}>Reset</Button>
                </div>
              </div>
            </div>

            <div>
              <div className="font-medium">Diagnosis (smart prompt)</div>
              <div className="text-sm text-gray-600 mb-2">Enter comma-separated symptoms for the smart prompt</div>
              <Input placeholder="fever, headache" value={symptomsText} onChange={e => setSymptomsText(e.target.value)} />
              <div className="flex gap-2 mt-2">
                <Button onClick={() => alert('Run smart prompt (simulated)')} className="bg-green-600 text-white">Run</Button>
                <Button className="bg-gray-100" onClick={() => setSymptomsText("")}>Clear</Button>
              </div>

              <div className="mt-3">
                <div className="text-sm font-medium">Record diagnosis</div>
                <Input placeholder="Final diagnosis / note" value={diagText} onChange={e => setDiagText(e.target.value)} />
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => { if (diagText.trim()) { onAddDiagnosis(episode.id, diagText.trim()); setDiagText(""); } }} className="bg-indigo-600 text-white">Save diagnosis</Button>
                  <Button className="bg-gray-100" onClick={() => setDiagText("")}>Reset</Button>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium">Add prescription</div>
                <Input placeholder="e.g. Artemether-lumefantrine 20/120 mg" value={prescText} onChange={e => setPrescText(e.target.value)} />
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => { if (prescText.trim()) { onAddPrescription(episode.id, prescText.trim()); setPrescText(""); } }} className="bg-blue-600 text-white">Add prescription</Button>
                  <Button className="bg-gray-100" onClick={() => setPrescText("")}>Reset</Button>
                </div>

                <div className="mt-3">
                  <div className="font-medium">Prescriptions</div>
                  <ul className="list-disc ml-5 text-sm text-gray-700">
                    {episode.prescriptions.length === 0 && <li className="text-gray-500">No prescriptions recorded</li>}
                    {episode.prescriptions.map((p, idx) => (
                      <li key={idx}>{p.text} — <span className="text-xs text-gray-500">by {p.prescriber} at {fmt(p.createdAt)}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Explore patients (nurse view of patient list)
function ExplorePatientsPanel({ onSelect }) {
  const [q, setQ] = useState("");
  const results = MOCK_PATIENTS.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()));

  return (
    <SectionCard title="Patients" subtitle="Search your patients" icon={<Users className="w-5 h-5" />}>
      <div className="space-y-3">
        <Input placeholder="Search patients by name or id" value={q} onChange={e => setQ(e.target.value)} />
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.map(p => (
            <Card key={p.id} className="p-3 rounded-xl">
              <CardContent className="flex justify-between items-center p-0">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.id} • DOB: {p.dob}</div>
                </div>
                <Button onClick={() => onSelect && onSelect(p)} className="bg-blue-600 text-white">Open</Button>
              </CardContent>
            </Card>
          ))}
          {results.length === 0 && <div className="text-sm text-gray-500">No patients found.</div>}
        </div>
      </div>
    </SectionCard>
  );
}

// Main Nurse portal — layout mirrors DoctorPortal exactly
export default function NursePortal() {
  const [tab, setTab] = useState('home'); // home | episodes | appointments | patients | tools
  const [episodes, setEpisodes] = useState(INITIAL_EPISODES);
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  function openEpisode(id) {
    const ep = episodes.find(e => e.id === id);
    setSelectedEpisode(ep);
  }

  function addObservation(epId, text) {
    setEpisodes(prev => prev.map(ep => ep.id === epId ? { ...ep, observations: [...ep.observations, { who: MOCK_NURSE.name, time: new Date().toISOString(), note: text }] } : ep));
  }

  function addDiagnosis(epId, text) {
    setEpisodes(prev => prev.map(ep => ep.id === epId ? { ...ep, diagnoses: [...ep.diagnoses, { id: `D-${Date.now()}`, doctor: MOCK_NURSE.name, text, createdAt: new Date().toISOString() }] } : ep));
  }

  function addPrescription(epId, text) {
    setEpisodes(prev => prev.map(ep => ep.id === epId ? { ...ep, prescriptions: [...ep.prescriptions, { text, prescriber: MOCK_NURSE.name, createdAt: new Date().toISOString(), dispensed: false }] } : ep));
  }

  function closeEpisode(epId) {
    setEpisodes(prev => prev.map(ep => ep.id === epId ? { ...ep, status: 'Closed' } : ep));
    setSelectedEpisode(null);
  }

  function confirmAppointment(id) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Confirmed' } : a));
  }

  function cancelAppointment(id) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
      <header className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-blue-700">MESMTF</div>
            <div className="text-sm text-gray-600">Nurse Portal</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Signed in as <strong>{MOCK_NURSE.name}</strong></div>
            <Button className="bg-transparent border">Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-4">
          <TopProfile nurse={MOCK_NURSE} />

          <Card className="rounded-2xl">
            <CardContent>
              <div className="space-y-2">
                <button className={`w-full text-left p-3 rounded-lg ${tab==='home' ? 'bg-blue-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('home')}>Home</button>
                <button className={`w-full text-left p-3 rounded-lg ${tab==='episodes' ? 'bg-blue-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('episodes')}>Treatment Episodes</button>
                <button className={`w-full text-left p-3 rounded-lg ${tab==='appointments' ? 'bg-blue-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('appointments')}>Appointments</button>
                <button className={`w-full text-left p-3 rounded-lg ${tab==='patients' ? 'bg-blue-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('patients')}>Patients</button>
                <button className={`w-full text-left p-3 rounded-lg ${tab==='tools' ? 'bg-blue-50' : 'hover:bg-gray-50'}`} onClick={()=>setTab('tools')}>Tools</button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent>
              <div className="text-sm text-gray-700">
                <div className="font-medium">Quick actions</div>
                <div className="mt-2 space-y-2">
                  <Button onClick={()=>setTab('episodes')} className="w-full bg-indigo-600 text-white flex items-center gap-2"><Printer className="w-4 h-4" /> View episodes</Button>
                  <Button onClick={()=>setTab('appointments')} className="w-full bg-blue-600 text-white flex items-center gap-2"><Calendar className="w-4 h-4" /> Manage appointments</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="lg:col-span-3 space-y-6">
          {tab === 'home' && (
            <div className="space-y-6">
              <SectionCard title={`Welcome back, ${MOCK_NURSE.name.split(" ")[1] || MOCK_NURSE.name.split(" ")[0]}`} subtitle={`ID: ${MOCK_NURSE.id}`} icon={<Users className="w-5 h-5" />}>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="rounded-xl p-3">
                    <CardContent className="p-0 text-center">
                      <div className="text-sm text-gray-600">Open Episodes</div>
                      <div className="text-2xl font-bold">{episodes.filter(e => e.status === 'Open').length}</div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl p-3">
                    <CardContent className="p-0 text-center">
                      <div className="text-sm text-gray-600">Today's Appointments</div>
                      <div className="text-2xl font-bold">{appointments.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl p-3">
                    <CardContent className="p-0 text-center">
                      <div className="text-sm text-gray-600">Pending Diagnoses</div>
                      <div className="text-2xl font-bold">{episodes.reduce((acc, e) => acc + (e.diagnoses.length === 0 && e.status === 'Open' ? 1 : 0), 0)}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <SectionCard title="Education Bot" subtitle="Patient-facing material" icon={<MessageSquare className="w-5 h-5" />}>
                      <div className="p-4 text-sm text-gray-700">Patient education and printable leaflets available from the education bot (link to chat and resources).</div>
                      <div className="mt-3"><a href="/education-chat" className="inline-block bg-green-600 text-white px-4 py-2 rounded-md">Open Education Chat</a></div>
                    </SectionCard>
                  </div>

                  <div>
                    <SectionCard title="Nursing Protocols" subtitle="Clinical guidelines" icon={<Brain className="w-5 h-5" />}>
                      <div className="p-4 text-sm text-gray-700">Access nursing protocols, medication administration guidelines, and clinical procedures. Outputs must be reviewed by clinicians.</div>
                      <div className="mt-3"><a href="/protocols" className="inline-block bg-red-600 text-white px-4 py-2 rounded-md">Open Protocols</a></div>
                    </SectionCard>
                  </div>
                </div>
              </SectionCard>

            </div>
          )}

          {tab === 'episodes' && (
            <SectionCard title="Treatment Episodes" subtitle="End-to-end care episodes" icon={<FileText className="w-5 h-5" />}>
              <div className="space-y-4">
                {episodes.map(ep => (
                  <Card key={ep.id} className="p-0 rounded-2xl">
                    <CardContent>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="font-semibold">{ep.id} <span className="text-sm text-gray-500">• {ep.status}</span></div>
                          <div className="text-sm text-gray-500">{ep.start}</div>
                          <div className="mt-2 text-sm text-gray-700">{ep.summary}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button onClick={() => openEpisode(ep.id)} className="bg-transparent border">Open</Button>
                          {ep.status !== 'Closed' && <Button onClick={() => { closeEpisode(ep.id); }} className="bg-indigo-600 text-white">Close</Button>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {episodes.length === 0 && <div className="text-gray-500">No episodes found.</div>}
              </div>
            </SectionCard>
          )}

          {tab === 'appointments' && (
            <SectionCard title="Appointments" subtitle="Manage your schedule" icon={<Calendar className="w-5 h-5" />}>
              <div className="space-y-3">
                {appointments.map(a => (
                  <Card key={a.id} className="p-3 rounded-xl">
                    <CardContent className="flex justify-between items-center p-0">
                      <div>
                        <div className="font-medium">{a.patientName}</div>
                        <div className="text-sm text-gray-500">{fmt(a.datetime)} • {a.status}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.status === 'Pending' && <Button onClick={() => confirmAppointment(a.id)} className="bg-green-600 text-white">Confirm</Button>}
                        {a.status !== 'Cancelled' && <Button onClick={() => cancelAppointment(a.id)} className="bg-red-600 text-white">Cancel</Button>}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {appointments.length === 0 && <div className="text-gray-500">No upcoming appointments</div>}
              </div>
            </SectionCard>
          )}

          {tab === 'patients' && (
            <ExplorePatientsPanel onSelect={(p) => alert(`Open patient ${p.name} (demo)`)} />
          )}

          {tab === 'tools' && (
            <SectionCard title="Tools & Admin" subtitle="Exports, audit, & settings" icon={<Users className="w-5 h-5" />}>
              <div className="space-y-3">
                <div className="text-sm text-gray-700">Export episode summaries, manage prescriptions, and view audit logs.</div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => alert('Export (demo)')} className="bg-transparent border">Export summaries</Button>
                  <Button onClick={() => alert('Audit logs (demo)')} className="bg-gray-100">Audit</Button>
                </div>
              </div>
            </SectionCard>
          )}
        </section>
      </main>

      <footer className="text-center p-6 text-gray-600">© 2025 MESMTF</footer>

      {selectedEpisode && (
        <EpisodeModal
          episode={selectedEpisode}
          onClose={() => setSelectedEpisode(null)}
          onAddObservation={addObservation}
          onAddDiagnosis={addDiagnosis}
          onAddPrescription={addPrescription}
          onCloseEpisode={closeEpisode}
        />
      )}
    </div>
  );
}