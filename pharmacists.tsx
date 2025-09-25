/*
PharmacistPortal.jsx

Comprehensive Pharmacist Portal implementation with:
- Prescription queue management
- Inventory tracking and alerts
- Patient consultation records
- Dispensing workflows
- Treatment episode integration
- Drug interaction checking

Save as src/PharmacistPortal.jsx and import/render it in your app.
*/

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Pill, 
  AlertTriangle, 
  Clock, 
  Check, 
  X, 
  Search, 
  Package, 
  Users, 
  MessageSquare, 
  Printer,
  Eye,
  Plus,
  Minus,
  Bell,
  TrendingDown,
  TrendingUp,
  User,
  Calendar
} from 'lucide-react';

// Mock data
const MOCK_PHARMACIST = {
  id: 'PH-2025-001',
  name: 'Pharm. Sarah Nakamhela',
  license: 'NAM-PHARM-12345',
  contact: 'sarah.nakamhela@mesmtf.na',
  location: 'Windhoek Central Pharmacy',
  certifications: ['Clinical Pharmacy', 'Antimicrobial Stewardship']
};

const MOCK_PRESCRIPTIONS = [
  {
    id: 'RX-2025-1001',
    patientId: 'P-2025-0001',
    patientName: 'Nangula K.',
    doctorName: 'Dr. Asha Mwangi',
    status: 'Pending Review',
    priority: 'High',
    receivedAt: '2025-09-25T08:30',
    medications: [
      { 
        drug: 'Artemether-Lumefantrine', 
        strength: '20/120mg', 
        dosage: '4 tablets twice daily x 3 days',
        quantity: 24,
        inStock: 45,
        interactions: []
      }
    ],
    diagnosis: 'Malaria (P. falciparum)',
    notes: 'Patient weight: 65kg. No known allergies.'
  },
  {
    id: 'RX-2025-1002',
    patientId: 'P-2025-0045',
    patientName: 'Amos N.',
    doctorName: 'Dr. Maria Tshuma',
    status: 'Ready for Pickup',
    priority: 'Medium',
    receivedAt: '2025-09-24T14:15',
    dispensedAt: '2025-09-24T16:20',
    medications: [
      { 
        drug: 'Ciprofloxacin', 
        strength: '500mg', 
        dosage: '1 tablet twice daily x 7 days',
        quantity: 14,
        inStock: 120,
        interactions: ['Warfarin', 'Theophylline']
      },
      { 
        drug: 'Paracetamol', 
        strength: '500mg', 
        dosage: '1-2 tablets every 6 hours as needed',
        quantity: 20,
        inStock: 500,
        interactions: []
      }
    ],
    diagnosis: 'Suspected typhoid fever',
    notes: 'Monitor for GI side effects. Patient education on drug interactions provided.'
  },
  {
    id: 'RX-2025-1003',
    patientId: 'P-2025-0078',
    patientName: 'Maria S.',
    doctorName: 'Dr. Peter Naude',
    status: 'Consultation Required',
    priority: 'High',
    receivedAt: '2025-09-25T09:45',
    medications: [
      { 
        drug: 'Amoxicillin', 
        strength: '500mg', 
        dosage: '1 capsule three times daily x 7 days',
        quantity: 21,
        inStock: 5, // Low stock!
        interactions: []
      },
      { 
        drug: 'Metformin', 
        strength: '500mg', 
        dosage: '1 tablet twice daily',
        quantity: 60,
        inStock: 200,
        interactions: ['Alcohol', 'Contrast agents']
      }
    ],
    diagnosis: 'Respiratory tract infection + Diabetes management',
    notes: 'Patient allergic to penicillin derivatives - CHECK ALLERGY HISTORY!'
  }
];

const MOCK_INVENTORY = [
  { 
    id: 'INV-001', 
    drug: 'Artemether-Lumefantrine', 
    strength: '20/120mg',
    currentStock: 45, 
    minStock: 50, 
    maxStock: 200,
    unitCost: 2.50,
    expiryDate: '2026-03-15',
    supplier: 'Global Health Pharma',
    lastRestocked: '2025-08-15'
  },
  { 
    id: 'INV-002', 
    drug: 'Amoxicillin', 
    strength: '500mg',
    currentStock: 5, 
    minStock: 25, 
    maxStock: 150,
    unitCost: 0.15,
    expiryDate: '2025-12-20',
    supplier: 'MedSupply Ltd',
    lastRestocked: '2025-07-10'
  },
  { 
    id: 'INV-003', 
    drug: 'Paracetamol', 
    strength: '500mg',
    currentStock: 500, 
    minStock: 100, 
    maxStock: 1000,
    unitCost: 0.05,
    expiryDate: '2027-01-30',
    supplier: 'Pharma Direct',
    lastRestocked: '2025-09-01'
  },
  { 
    id: 'INV-004', 
    drug: 'Metformin', 
    strength: '500mg',
    currentStock: 200, 
    minStock: 75, 
    maxStock: 300,
    unitCost: 0.12,
    expiryDate: '2026-06-10',
    supplier: 'Global Health Pharma',
    lastRestocked: '2025-08-20'
  },
  { 
    id: 'INV-005', 
    drug: 'Ciprofloxacin', 
    strength: '500mg',
    currentStock: 120, 
    minStock: 40, 
    maxStock: 200,
    unitCost: 0.35,
    expiryDate: '2026-09-05',
    supplier: 'MedSupply Ltd',
    lastRestocked: '2025-09-10'
  }
];

const MOCK_CONSULTATIONS = [
  {
    id: 'CON-001',
    patientName: 'John M.',
    date: '2025-09-24',
    type: 'Medication Review',
    duration: '15 min',
    topic: 'Hypertension management',
    notes: 'Discussed lifestyle modifications and adherence. Patient understanding good.',
    followUp: '2025-10-24'
  },
  {
    id: 'CON-002',
    patientName: 'Grace L.',
    date: '2025-09-23',
    type: 'Drug Information',
    duration: '10 min',
    topic: 'Antibiotic side effects',
    notes: 'Patient concerned about diarrhea. Advised probiotics and monitoring.',
    followUp: null
  }
];

// Helper functions
function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

function formatDateTime(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleString();
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'High': return 'text-red-600 bg-red-50';
    case 'Medium': return 'text-yellow-600 bg-yellow-50';
    case 'Low': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'Pending Review': return 'text-orange-600 bg-orange-50';
    case 'Ready for Pickup': return 'text-green-600 bg-green-50';
    case 'Dispensed': return 'text-blue-600 bg-blue-50';
    case 'Consultation Required': return 'text-red-600 bg-red-50';
    case 'On Hold': return 'text-gray-600 bg-gray-50';
    default: return 'text-gray-600 bg-gray-50';
  }
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
      <body class="p-6 bg-white text-black font-sans">
        ${htmlContent}
      </body>
    </html>
  `);
  w.document.close();
  setTimeout(() => w.print(), 250);
}

// UI Components
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

function TopProfile({ pharmacist }) {
  return (
    <Card className="rounded-2xl">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-300 to-green-500 text-white flex items-center justify-center font-semibold text-xl shadow-inner">
            {pharmacist.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="font-semibold text-lg">{pharmacist.name}</div>
            <div className="text-sm text-gray-600">{pharmacist.license}</div>
            <div className="text-sm text-gray-500 mt-1">{pharmacist.location}</div>
            <div className="text-sm text-gray-500">{pharmacist.contact}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Prescription Queue Panel
function PrescriptionQueuePanel() {
  const [prescriptions, setPrescriptions] = useState(MOCK_PRESCRIPTIONS);
  const [selectedRx, setSelectedRx] = useState(null);
  const [filter, setFilter] = useState('All');

  const filteredRx = prescriptions.filter(rx => {
    if (filter === 'All') return true;
    return rx.status === filter;
  });

  function handleStatusChange(rxId, newStatus) {
    setPrescriptions(prev => 
      prev.map(rx => rx.id === rxId ? { 
        ...rx, 
        status: newStatus,
        dispensedAt: newStatus === 'Dispensed' ? new Date().toISOString() : rx.dispensedAt
      } : rx)
    );
  }

  function printRxLabel(rx) {
    const html = `
      <div class="max-w-md mx-auto border-2 border-black p-4">
        <div class="text-center mb-4">
          <h1 class="text-lg font-bold">MESMTF Pharmacy</h1>
          <div class="text-sm">Prescription Label</div>
        </div>
        <div class="mb-3">
          <div><strong>Rx #:</strong> ${rx.id}</div>
          <div><strong>Patient:</strong> ${rx.patientName}</div>
          <div><strong>Doctor:</strong> ${rx.doctorName}</div>
          <div><strong>Date:</strong> ${formatDate(rx.receivedAt)}</div>
        </div>
        <div class="border-t pt-3">
          ${rx.medications.map(med => `
            <div class="mb-3">
              <div class="font-semibold">${med.drug} ${med.strength}</div>
              <div class="text-sm">Quantity: ${med.quantity}</div>
              <div class="text-sm">Directions: ${med.dosage}</div>
            </div>
          `).join('')}
        </div>
        <div class="text-xs mt-4 border-t pt-2">
          <div>Pharmacist: ${MOCK_PHARMACIST.name}</div>
          <div>License: ${MOCK_PHARMACIST.license}</div>
        </div>
      </div>
    `;
    openPrintWindow(html, `Prescription-${rx.id}`);
  }

  return (
    <div className="space-y-4">
      <SectionCard 
        title="Prescription Queue" 
        subtitle={`${filteredRx.length} prescriptions`}
        icon={<Clock className="w-5 h-5" />}
        actions={
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="p-2 rounded border text-sm"
          >
            <option>All</option>
            <option>Pending Review</option>
            <option>Ready for Pickup</option>
            <option>Consultation Required</option>
            <option>Dispensed</option>
          </select>
        }
      >
        <div className="space-y-3">
          {filteredRx.map(rx => (
            <Card key={rx.id} className="rounded-xl">
              <CardContent>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-semibold">{rx.id}</div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(rx.priority)}`}>
                        {rx.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(rx.status)}`}>
                        {rx.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      <strong>{rx.patientName}</strong> • {rx.doctorName}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      Received: {formatDateTime(rx.receivedAt)}
                    </div>
                    <div className="text-sm">
                      <strong>Medications:</strong> {rx.medications.map(m => m.drug).join(', ')}
                    </div>
                    {rx.medications.some(m => m.inStock < 10) && (
                      <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                        <AlertTriangle className="w-4 h-4" />
                        Low stock alert
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setSelectedRx(rx)} className="bg-blue-600 text-white">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {rx.status === 'Ready for Pickup' && (
                      <Button 
                        onClick={() => handleStatusChange(rx.id, 'Dispensed')}
                        className="bg-green-600 text-white"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionCard>

      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl">
            <CardContent>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xl font-semibold">Prescription {selectedRx.id}</div>
                  <div className="text-sm text-gray-500">{selectedRx.patientName} • {selectedRx.doctorName}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => printRxLabel(selectedRx)} className="bg-indigo-600 text-white">
                    <Printer className="w-4 h-4 mr-1" /> Print Label
                  </Button>
                  <Button onClick={() => setSelectedRx(null)} className="bg-gray-100">Close</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedRx.patientName}</div>
                    <div><strong>Patient ID:</strong> {selectedRx.patientId}</div>
                    <div><strong>Diagnosis:</strong> {selectedRx.diagnosis}</div>
                    <div><strong>Prescriber:</strong> {selectedRx.doctorName}</div>
                    <div><strong>Received:</strong> {formatDateTime(selectedRx.receivedAt)}</div>
                    {selectedRx.dispensedAt && (
                      <div><strong>Dispensed:</strong> {formatDateTime(selectedRx.dispensedAt)}</div>
                    )}
                  </div>

                  {selectedRx.notes && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Clinical Notes</h4>
                      <div className="text-sm text-gray-700 bg-yellow-50 p-3 rounded">{selectedRx.notes}</div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Medications</h3>
                  <div className="space-y-3">
                    {selectedRx.medications.map((med, idx) => (
                      <Card key={idx} className="p-3">
                        <CardContent className="p-0">
                          <div className="font-medium">{med.drug} {med.strength}</div>
                          <div className="text-sm text-gray-600 mt-1">{med.dosage}</div>
                          <div className="text-sm text-gray-600">Quantity: {med.quantity}</div>
                          <div className={`text-sm mt-1 ${med.inStock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                            Stock: {med.inStock} units
                          </div>
                          {med.interactions.length > 0 && (
                            <div className="mt-2 text-sm">
                              <div className="text-orange-600 font-medium">⚠️ Drug Interactions:</div>
                              <div className="text-orange-700">{med.interactions.join(', ')}</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button 
                  onClick={() => handleStatusChange(selectedRx.id, 'Ready for Pickup')}
                  className="bg-green-600 text-white"
                  disabled={selectedRx.status === 'Ready for Pickup' || selectedRx.status === 'Dispensed'}
                >
                  Mark Ready for Pickup
                </Button>
                <Button 
                  onClick={() => handleStatusChange(selectedRx.id, 'Consultation Required')}
                  className="bg-orange-600 text-white"
                >
                  Require Consultation
                </Button>
                <Button 
                  onClick={() => handleStatusChange(selectedRx.id, 'On Hold')}
                  className="bg-gray-600 text-white"
                >
                  Put On Hold
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Inventory Management Panel
function InventoryPanel() {
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.drug.toLowerCase().includes(searchTerm.toLowerCase());
    const isLowStock = item.currentStock <= item.minStock;
    return matchesSearch && (!showLowStock || isLowStock);
  });

  function handleStockAdjustment(itemId, adjustment) {
    setInventory(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, currentStock: Math.max(0, item.currentStock + adjustment) }
          : item
      )
    );
  }

  function getStockStatus(item) {
    if (item.currentStock <= item.minStock) return { text: 'Low Stock', color: 'text-red-600 bg-red-50' };
    if (item.currentStock >= item.maxStock) return { text: 'Overstocked', color: 'text-orange-600 bg-orange-50' };
    return { text: 'Normal', color: 'text-green-600 bg-green-50' };
  }

  return (
    <div className="space-y-4">
      <SectionCard 
        title="Inventory Management" 
        subtitle={`${filteredInventory.length} items • ${inventory.filter(i => i.currentStock <= i.minStock).length} low stock alerts`}
        icon={<Package className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search medications..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="w-40"
            />
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={showLowStock} 
                onChange={e => setShowLowStock(e.target.checked)} 
              />
              Low stock only
            </label>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredInventory.map(item => {
            const status = getStockStatus(item);
            return (
              <Card key={item.id} className="rounded-xl">
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{item.drug}</div>
                      <div className="text-sm text-gray-500">{item.strength}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Stock: {item.currentStock} / {item.maxStock}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires: {formatDate(item.expiryDate)}
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        onClick={() => handleStockAdjustment(item.id, -1)}
                        className="bg-gray-100 p-1"
                        disabled={item.currentStock <= 0}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="mx-2 font-mono text-sm">{item.currentStock}</span>
                      <Button 
                        onClick={() => handleStockAdjustment(item.id, 1)}
                        className="bg-gray-100 p-1"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={() => setSelectedItem(item)}
                        className="bg-blue-600 text-white ml-2"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SectionCard>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-2xl rounded-2xl">
            <CardContent>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xl font-semibold">{selectedItem.drug}</div>
                  <div className="text-sm text-gray-500">{selectedItem.strength}</div>
                </div>
                <Button onClick={() => setSelectedItem(null)} className="bg-gray-100">Close</Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium mb-2">Stock Information</div>
                  <div className="space-y-1">
                    <div>Current Stock: {selectedItem.currentStock}</div>
                    <div>Minimum Stock: {selectedItem.minStock}</div>
                    <div>Maximum Stock: {selectedItem.maxStock}</div>
                    <div>Unit Cost: N${selectedItem.unitCost}</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2">Supply Information</div>
                  <div className="space-y-1">
                    <div>Supplier: {selectedItem.supplier}</div>
                    <div>Expiry Date: {formatDate(selectedItem.expiryDate)}</div>
                    <div>Last Restocked: {formatDate(selectedItem.lastRestocked)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button className="bg-green-600 text-white" onClick={() => alert('Reorder functionality (demo)')}>
                  Reorder Stock
                </Button>
                <Button className="bg-orange-600 text-white" onClick={() => alert('Edit item functionality (demo)')}>
                  Edit Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Patient Consultations Panel
function ConsultationsPanel() {
  const [consultations, setConsultations] = useState(MOCK_CONSULTATIONS);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newConsultation, setNewConsultation] = useState({
    patientName: '',
    type: 'Medication Review',
    topic: '',
    notes: '',
    followUp: ''
  });

  function handleSubmitConsultation(e) {
    e.preventDefault();
    const consultation = {
      id: `CON-${Math.floor(Math.random() * 1000) + 100}`,
      ...newConsultation,
      date: new Date().toISOString().split('T')[0],
      duration: '15 min'
    };
    setConsultations(prev => [consultation, ...prev]);
    setNewConsultation({ patientName: '', type: 'Medication Review', topic: '', notes: '', followUp: '' });
    setShowNewForm(false);
  }

  return (
    <div className="space-y-4">
      <SectionCard 
        title="Patient Consultations" 
        subtitle={`${consultations.length} consultations recorded`}
        icon={<MessageSquare className="w-5 h-5" />}
        actions={
          <Button onClick={() => setShowNewForm(true)} className="bg-green-600 text-white">
            New Consultation
          </Button>
        }
      >
        {showNewForm && (
          <Card className="mb-4 rounded-xl">
            <CardContent>
              <form onSubmit={handleSubmitConsultation} className="space-y-3">
                <div className="text-lg font-semibold">New Consultation</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Patient Name</label>
                    <Input 
                      value={newConsultation.patientName} 
                      onChange={e => setNewConsultation(prev => ({...prev, patientName: e.target.value}))}
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select 
                      value={newConsultation.type} 
                      onChange={e => setNewConsultation(prev => ({...prev, type: e.target.value}))}
                      className="w-full p-2 border rounded"
                    >
                      <option>Medication Review</option>
                      <option>Drug Information</option>
                      <option>Side Effect Counseling</option>
                      <option>Adherence Support</option>
                      <option>Drug Interaction Check</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Topic</label>
                  <Input 
                    value={newConsultation.topic} 
                    onChange={e => setNewConsultation(prev => ({...prev, topic: e.target.value}))}
                    placeholder="Brief description of consultation topic"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea 
                    value={newConsultation.notes} 
                    onChange={e => setNewConsultation(prev => ({...prev, notes: e.target.value}))}
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Detailed consultation notes"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Follow-up Date (optional)</label>
                  <Input 
                    type="date"
                    value={newConsultation.followUp} 
                    onChange={e => setNewConsultation(prev => ({...prev, followUp: e.target.value}))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-green-600 text-white">Save Consultation</Button>
                  <Button type="button" onClick={() => setShowNewForm(false)} className="bg-gray-100">Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {consultations.map(consultation => (
            <Card key={consultation.id} className="rounded-xl">
              <CardContent>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{consultation.patientName}</div>
                    <div className="text-sm text-gray-600">{consultation.type} • {consultation.duration}</div>
                    <div className="text-sm text-gray-500">{formatDate(consultation.date)}</div>
                    <div className="text-sm font-medium mt-1">{consultation.topic}</div>
                    <div className="text-sm text-gray-700 mt-2">{consultation.notes}</div>
                    {consultation.followUp && (
                      <div className="text-sm text-blue-600 mt-1">Follow-up: {formatDate(consultation.followUp)}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button className="bg-blue-600 text-white" onClick={() => alert('Print consultation record (demo)')}>
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// Dashboard Home Panel
function DashboardPanel() {
  const pendingRx = MOCK_PRESCRIPTIONS.filter(rx => rx.status === 'Pending Review').length;
  const readyForPickup = MOCK_PRESCRIPTIONS.filter(rx => rx.status === 'Ready for Pickup').length;
  const lowStockItems = MOCK_INVENTORY.filter(item => item.currentStock <= item.minStock).length;
  const consultationsToday = MOCK_CONSULTATIONS.filter(c => c.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="space-y-6">
      <SectionCard 
        title={`Welcome back, ${MOCK_PHARMACIST.name.split(' ')[1]}`} 
        subtitle={`${MOCK_PHARMACIST.location}`}
        icon={<User className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-xl p-4 bg-orange-50">
            <CardContent className="p-0 text-center">
              <div className="text-2xl font-bold text-orange-600">{pendingRx}</div>
              <div className="text-sm text-orange-700">Pending Review</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl p-4 bg-green-50">
            <CardContent className="p-0 text-center">
              <div className="text-2xl font-bold text-green-600">{readyForPickup}</div>
              <div className="text-sm text-green-700">Ready for Pickup</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl p-4 bg-red-50">
            <CardContent className="p-0 text-center">
              <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
              <div className="text-sm text-red-700">Low Stock Alerts</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl p-4 bg-blue-50">
            <CardContent className="p-0 text-center">
              <div className="text-2xl font-bold text-blue-600">{consultationsToday}</div>
              <div className="text-sm text-blue-700">Consultations Today</div>
            </CardContent>
          </Card>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard 
          title="Recent Prescriptions" 
          subtitle="Latest prescription activity"
          icon={<Pill className="w-5 h-5" />}
        >
          <div className="space-y-3">
            {MOCK_PRESCRIPTIONS.slice(0, 3).map(rx => (
              <Card key={rx.id} className="rounded-lg">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{rx.patientName}</div>
                      <div className="text-xs text-gray-500">{rx.id} • {formatDateTime(rx.receivedAt)}</div>
                      <div className="text-xs text-gray-600">{rx.medications[0]?.drug}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(rx.status)}`}>
                      {rx.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionCard>

        <SectionCard 
          title="Low Stock Alerts" 
          subtitle="Items requiring attention"
          icon={<AlertTriangle className="w-5 h-5" />}
        >
          <div className="space-y-3">
            {MOCK_INVENTORY.filter(item => item.currentStock <= item.minStock).map(item => (
              <Card key={item.id} className="rounded-lg">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{item.drug}</div>
                      <div className="text-xs text-gray-500">{item.strength}</div>
                      <div className="text-xs text-red-600">Stock: {item.currentStock} (Min: {item.minStock})</div>
                    </div>
                    <Button className="bg-green-600 text-white text-xs p-1">
                      Reorder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard 
        title="Quick Actions" 
        icon={<Bell className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="bg-blue-600 text-white p-4 h-auto flex flex-col items-center gap-2">
            <Search className="w-6 h-6" />
            <span>Search Prescriptions</span>
          </Button>
          <Button className="bg-green-600 text-white p-4 h-auto flex flex-col items-center gap-2">
            <Package className="w-6 h-6" />
            <span>Inventory Check</span>
          </Button>
          <Button className="bg-purple-600 text-white p-4 h-auto flex flex-col items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            <span>New Consultation</span>
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

// Treatment Episodes Panel (similar to patient portal but from pharmacist perspective)
function TreatmentEpisodesPanel() {
  const PHARMACIST_EPISODES = [
    {
      id: 'T-9001',
      patientName: 'Nangula K.',
      patientId: 'P-2025-0001',
      createdAt: '2025-09-10T08:12',
      status: 'Completed',
      summary: 'Malaria treatment - dispensed ACT as prescribed',
      pharmacistRole: 'Primary',
      medications: ['Artemether-Lumefantrine 20/120mg'],
      timeline: [
        { who: 'pharmacist', time: '2025-09-10T10:00', note: 'Received prescription from Dr. Asha Mwangi' },
        { who: 'pharmacist', time: '2025-09-10T10:15', note: 'Verified dosage and checked drug interactions' },
        { who: 'pharmacist', time: '2025-09-10T10:30', note: 'Dispensed artemether-lumefantrine, provided patient counseling' },
        { who: 'pharmacist', time: '2025-09-10T10:35', note: 'Patient education: take with fatty food, complete full course' }
      ]
    },
    {
      id: 'T-9002',
      patientName: 'Amos N.',
      patientId: 'P-2025-0045',
      createdAt: '2025-08-01T11:00',
      status: 'Ongoing',
      summary: 'Typhoid treatment - monitoring for antibiotic effectiveness',
      pharmacistRole: 'Monitoring',
      medications: ['Ciprofloxacin 500mg', 'Paracetamol 500mg'],
      timeline: [
        { who: 'pharmacist', time: '2025-08-01T14:00', note: 'Dispensed ciprofloxacin and paracetamol' },
        { who: 'pharmacist', time: '2025-08-01T14:10', note: 'Counseled on food interactions and side effects' },
        { who: 'pharmacist', time: '2025-08-05T09:00', note: 'Follow-up call - patient tolerating medication well' }
      ]
    }
  ];

  return (
    <SectionCard 
      title="Treatment Episodes" 
      subtitle="Pharmacy involvement in patient care episodes"
      icon={<Users className="w-5 h-5" />}
    >
      <div className="space-y-4">
        {PHARMACIST_EPISODES.map(ep => (
          <Card key={ep.id} className="rounded-xl">
            <CardContent>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold">{ep.id} - {ep.patientName}</div>
                  <div className="text-sm text-gray-500">{formatDate(ep.createdAt)} • {ep.status}</div>
                  <div className="text-sm text-gray-600 mt-1">{ep.summary}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${ep.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  {ep.pharmacistRole}
                </span>
              </div>
              
              <div className="mb-3">
                <div className="font-medium text-sm">Medications Involved:</div>
                <div className="text-sm text-gray-600">{ep.medications.join(', ')}</div>
              </div>

              <div>
                <div className="font-medium text-sm mb-2">Pharmacy Timeline:</div>
                <div className="space-y-1">
                  {ep.timeline.map((event, idx) => (
                    <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="font-medium">{formatDateTime(event.time)}</div>
                      <div className="text-gray-700">{event.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionCard>
  );
}

// Main Pharmacist Portal Component
export default function PharmacistPortal() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-12">
      <header className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-green-700">MESMTF</div>
            <div className="text-sm text-gray-600">Pharmacist Portal</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Signed in as <strong>{MOCK_PHARMACIST.name}</strong></div>
            <Button className="bg-transparent border">Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-4">
          <TopProfile pharmacist={MOCK_PHARMACIST} />

          <Card className="rounded-2xl">
            <CardContent>
              <div className="space-y-2">
                <button 
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-2 ${tab==='dashboard' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`} 
                  onClick={()=>setTab('dashboard')}
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </button>
                <button 
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-2 ${tab==='prescriptions' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`} 
                  onClick={()=>setTab('prescriptions')}
                >
                  <Pill className="w-4 h-4" />
                  Prescription Queue
                </button>
                <button 
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-2 ${tab==='inventory' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`} 
                  onClick={()=>setTab('inventory')}
                >
                  <Package className="w-4 h-4" />
                  Inventory
                </button>
                <button 
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-2 ${tab==='consultations' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`} 
                  onClick={()=>setTab('consultations')}
                >
                  <MessageSquare className="w-4 h-4" />
                  Consultations
                </button>
                <button 
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-2 ${tab==='episodes' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`} 
                  onClick={()=>setTab('episodes')}
                >
                  <Users className="w-4 h-4" />
                  Treatment Episodes
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent>
              <div className="text-sm">
                <div className="font-medium mb-2">Quick Stats</div>
                <div className="space-y-1 text-gray-600">
                  <div>• {MOCK_PRESCRIPTIONS.filter(rx => rx.status === 'Pending Review').length} pending reviews</div>
                  <div>• {MOCK_INVENTORY.filter(item => item.currentStock <= item.minStock).length} low stock alerts</div>
                  <div>• {MOCK_CONSULTATIONS.length} consultations this week</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent>
              <div className="text-sm text-gray-700">
                <div className="font-medium">Quick Actions</div>
                <div className="mt-2 space-y-2">
                  <Button 
                    onClick={() => setTab('prescriptions')} 
                    className="w-full bg-green-600 text-white flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" /> 
                    Review Queue
                  </Button>
                  <Button 
                    onClick={() => setTab('inventory')} 
                    className="w-full bg-blue-600 text-white flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" /> 
                    Check Inventory
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="lg:col-span-3">
          {tab === 'dashboard' && <DashboardPanel />}
          {tab === 'prescriptions' && <PrescriptionQueuePanel />}
          {tab === 'inventory' && <InventoryPanel />}
          {tab === 'consultations' && <ConsultationsPanel />}
          {tab === 'episodes' && <TreatmentEpisodesPanel />}
        </section>
      </main>

      <footer className="text-center p-6 text-gray-600">© 2025 MESMTF - Pharmacist Portal</footer>
    </div>
  );
}