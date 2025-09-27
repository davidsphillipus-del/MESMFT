const axios = require('axios')

const newUsers = [
  // 12 Patients
  { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@email.com', password: 'healthcare123', role: 'PATIENT' },
  { firstName: 'Bob', lastName: 'Williams', email: 'bob.williams@email.com', password: 'healthcare123', role: 'PATIENT' },
  { firstName: 'Carol', lastName: 'Davis', email: 'carol.davis@email.com', password: 'healthcare123', role: 'PATIENT' },
  { firstName: 'David', lastName: 'Miller', email: 'david.miller@email.com', password: 'healthcare123', role: 'PATIENT' },
  { firstName: 'Emma', lastName: 'Wilson', email: 'emma.wilson@email.com', password: 'healthcare123', role: 'PATIENT' },
  { firstName: 'Frank', lastName: 'Moore', email: 'frank.moore@email.com', password: 'healthcare123', role: 'PATIENT' },
  { firstName: 'Grace', lastName: 'Taylor', email: 'grace.taylor@email.com', password: 'healthcare123', role: 'PATIENT' },
  { firstName: 'Henry', lastName: 'Anderson', email: 'henry.anderson@email.com', password: 'healthcare123', role: 'PATIENT' },
  { firstName: 'Ivy', lastName: 'Thomas', email: 'ivy.thomas@email.com', password: 'healthcare123', role: 'PATIENT' },
  { firstName: 'Jack', lastName: 'Jackson', email: 'jack.jackson@email.com', password: 'healthcare123', role: 'PATIENT' },
  { firstName: 'Kate', lastName: 'White', email: 'kate.white@email.com', password: 'healthcare123', role: 'PATIENT' },
  { firstName: 'Leo', lastName: 'Harris', email: 'leo.harris@email.com', password: 'healthcare123', role: 'PATIENT' },
  
  // 8 Others (2 doctors, 2 nurses, 2 pharmacists, 1 receptionist, 1 admin)
  { firstName: 'Dr. Sarah', lastName: 'Connor', email: 'dr.sarah.connor@email.com', password: 'healthcare123', role: 'DOCTOR' },
  { firstName: 'Dr. James', lastName: 'Bond', email: 'dr.james.bond@email.com', password: 'healthcare123', role: 'DOCTOR' },
  { firstName: 'Nurse Mary', lastName: 'Poppins', email: 'nurse.mary.poppins@email.com', password: 'healthcare123', role: 'NURSE' },
  { firstName: 'Nurse John', lastName: 'Doe', email: 'nurse.john.doe@email.com', password: 'healthcare123', role: 'NURSE' },
  { firstName: 'Pharmacist Anna', lastName: 'Smith', email: 'pharmacist.anna.smith@email.com', password: 'healthcare123', role: 'PHARMACIST' },
  { firstName: 'Pharmacist Tom', lastName: 'Brown', email: 'pharmacist.tom.brown@email.com', password: 'healthcare123', role: 'PHARMACIST' },
  { firstName: 'Receptionist Lisa', lastName: 'Green', email: 'receptionist.lisa.green@email.com', password: 'healthcare123', role: 'RECEPTIONIST' },
  { firstName: 'Admin Mike', lastName: 'Admin', email: 'admin.mike.admin@email.com', password: 'healthcare123', role: 'ADMIN' }
]

async function addUsers() {
  console.log('🔄 Adding 20 new users...')
  
  for (const user of newUsers) {
    try {
      const response = await axios.post('http://localhost:5001/api/v1/auth/register', user)
      console.log(`✅ Added ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`)
    } catch (error) {
      if (error.response?.data?.message === 'User already exists') {
        console.log(`⚠️  ${user.firstName} ${user.lastName} already exists - ${user.email}`)
      } else {
        console.log(`❌ Failed to add ${user.firstName} ${user.lastName}: ${error.response?.data?.message || error.message}`)
      }
    }
  }
  
  console.log('\n🎉 User addition completed!')
  console.log('\n📧 User Emails (password: healthcare123):')
  console.log('\n👥 PATIENTS (12):')
  newUsers.filter(u => u.role === 'PATIENT').forEach(u => console.log(`   📧 ${u.email}`))
  console.log('\n🩺 DOCTORS (2):')
  newUsers.filter(u => u.role === 'DOCTOR').forEach(u => console.log(`   📧 ${u.email}`))
  console.log('\n👩‍⚕️ NURSES (2):')
  newUsers.filter(u => u.role === 'NURSE').forEach(u => console.log(`   📧 ${u.email}`))
  console.log('\n💊 PHARMACISTS (2):')
  newUsers.filter(u => u.role === 'PHARMACIST').forEach(u => console.log(`   📧 ${u.email}`))
  console.log('\n🏥 RECEPTIONISTS (1):')
  newUsers.filter(u => u.role === 'RECEPTIONIST').forEach(u => console.log(`   📧 ${u.email}`))
  console.log('\n👨‍💼 ADMINS (1):')
  newUsers.filter(u => u.role === 'ADMIN').forEach(u => console.log(`   📧 ${u.email}`))
}

addUsers()
