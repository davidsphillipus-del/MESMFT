#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 MESMTF Project Verification\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'index.html',
  'src/main.tsx',
  'src/App.tsx',
  'src/styles/global.css',
  'src/styles/components.module.css',
  'src/styles/layout.module.css'
];

const requiredDirectories = [
  'src',
  'src/components',
  'src/components/ui',
  'src/components/layout',
  'src/contexts',
  'src/pages',
  'src/services',
  'src/styles'
];

console.log('📁 Checking project structure...');

let allFilesExist = true;
let allDirsExist = true;

// Check directories
requiredDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ Directory: ${dir}`);
  } else {
    console.log(`❌ Missing directory: ${dir}`);
    allDirsExist = false;
  }
});

// Check files
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ File: ${file}`);
  } else {
    console.log(`❌ Missing file: ${file}`);
    allFilesExist = false;
  }
});

console.log('\n📦 Checking package.json dependencies...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    'lucide-react'
  ];

  const requiredDevDeps = [
    '@types/react',
    '@types/react-dom',
    '@vitejs/plugin-react',
    'typescript',
    'vite'
  ];

  console.log('Dependencies:');
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ Missing dependency: ${dep}`);
    }
  });

  console.log('\nDev Dependencies:');
  requiredDevDeps.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.devDependencies[dep]}`);
    } else {
      console.log(`❌ Missing dev dependency: ${dep}`);
    }
  });

} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

console.log('\n🧩 Checking component files...');

const componentFiles = [
  'src/components/ui/Button.tsx',
  'src/components/ui/Input.tsx',
  'src/components/ui/Card.tsx',
  'src/components/ui/Badge.tsx',
  'src/components/layout/Header.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/TopProfile.tsx',
  'src/components/layout/SectionCard.tsx',
  'src/components/layout/Navigation.tsx',
  'src/components/layout/StatsGrid.tsx',
  'src/components/ProtectedRoute.tsx'
];

componentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Component: ${file}`);
  } else {
    console.log(`❌ Missing component: ${file}`);
  }
});

console.log('\n📄 Checking page files...');

const pageFiles = [
  'src/pages/LandingPage.tsx',
  'src/pages/LoginPage.tsx',
  'src/pages/RegisterPage.tsx',
  'src/pages/AboutPage.tsx',
  'src/pages/PatientPortal.tsx',
  'src/pages/DoctorPortal.tsx',
  'src/pages/NursePortal.tsx',
  'src/pages/ReceptionistPortal.tsx',
  'src/pages/PharmacistPortal.tsx',
  'src/pages/EducationBot.tsx',
  'src/pages/DiagnosisBot.tsx',
  'src/pages/NotFoundPage.tsx'
];

pageFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Page: ${file}`);
  } else {
    console.log(`❌ Missing page: ${file}`);
  }
});

console.log('\n🔧 Checking service files...');

const serviceFiles = [
  'src/services/mockApi.ts',
  'src/services/diagnosisService.ts',
  'src/contexts/AuthContext.tsx'
];

serviceFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Service: ${file}`);
  } else {
    console.log(`❌ Missing service: ${file}`);
  }
});

console.log('\n📊 Project Statistics:');

function countFiles(dir, extension) {
  let count = 0;
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      if (file.isDirectory()) {
        count += countFiles(path.join(dir, file.name), extension);
      } else if (file.name.endsWith(extension)) {
        count++;
      }
    });
  }
  return count;
}

const tsxFiles = countFiles('src', '.tsx');
const tsFiles = countFiles('src', '.ts');
const cssFiles = countFiles('src', '.css');

console.log(`📝 TypeScript React files: ${tsxFiles}`);
console.log(`📝 TypeScript files: ${tsFiles}`);
console.log(`🎨 CSS files: ${cssFiles}`);
console.log(`📁 Total files: ${tsxFiles + tsFiles + cssFiles}`);

console.log('\n🎯 Project Status Summary:');

if (allDirsExist && allFilesExist) {
  console.log('✅ Project structure is complete!');
  console.log('✅ All required files are present');
  console.log('✅ Ready for development');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Start development server: npm run dev');
  console.log('3. Open browser to http://localhost:5173');
  console.log('4. Test with demo credentials (see README.md)');
  
} else {
  console.log('❌ Project structure is incomplete');
  console.log('❌ Some required files or directories are missing');
  console.log('❌ Please check the missing items above');
}

console.log('\n📚 Documentation:');
console.log('- README.md: Complete project documentation');
console.log('- Component test: src/test/ComponentTest.tsx');
console.log('- Demo credentials: password123 for any user email');

console.log('\n🔐 Security Notes:');
console.log('- This is a demo/development version');
console.log('- Uses mock authentication (not production-ready)');
console.log('- All passwords are "password123" for testing');

console.log('\n✨ MESMTF Project Verification Complete!\n');
