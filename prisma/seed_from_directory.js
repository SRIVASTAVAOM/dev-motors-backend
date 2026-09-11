const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('=== SEEDING FULL DIRECTORY FROM PDF ===');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Dev@2026', salt);

  // 1. Locations
  const locationsData = [
    { code: 'LOC_NEXA', name: 'Aligarh Nexa', city: 'Aligarh', state: 'Uttar Pradesh' },
    { code: 'LOC_MAIN', name: 'Main Outlet', city: 'Aligarh', state: 'Uttar Pradesh' },
    { code: 'LOC_KHAIR', name: 'Khair', city: 'Khair', state: 'Uttar Pradesh' },
    { code: 'LOC_ATRAULI', name: 'Atrauli', city: 'Atrauli', state: 'Uttar Pradesh' },
    { code: 'LOC_IGLAS', name: 'Iglas', city: 'Iglas', state: 'Uttar Pradesh' },
  ];

  const locMap = {};
  for (const loc of locationsData) {
    const upserted = await prisma.location.upsert({
      where: { locationCode: loc.code },
      update: { name: loc.name, city: loc.city, state: loc.state, isActive: true },
      create: { locationCode: loc.code, name: loc.name, city: loc.city, state: loc.state, isActive: true },
    });
    locMap[loc.name] = upserted.id;
    console.log(`Location ready: ${loc.name} (${upserted.id})`);
  }

  // 2. Directory Users
  const users = [
    // --- OWNERS (Global) ---
    { id: 'owner_dron', name: 'Drona Agarwal', email: 'dron@devmotors.in', role: 'OWNER', loc: null },
    { id: 'owner_sumit', name: 'Sumit Agarwal', email: 'sumit@devmotors.in', role: 'OWNER', loc: null },
    { id: 'owner_gaurav_agr', name: 'Gaurav Agarwal', email: 'gaurav.agr@devmotors.in', role: 'OWNER', loc: null },
    { id: 'owner_gaurav_sharma', name: 'Gaurav Sharma', email: 'gaurav.sharma@devmotors.in', role: 'OWNER', loc: null },
    { id: 'owner_arpit', name: 'Arpit Verma', email: 'arpit@devmotors.in', role: 'OWNER', loc: null },

    // --- ALIGARH NEXA ---
    { id: 'nexa_stephen_sm', name: 'St. Stephen Joseph', email: 'nexa_stephen_sm@devmotors.in', role: 'MANAGER', loc: 'Aligarh Nexa' },
    { id: 'nexa_dheeraj_wm', name: 'Dheeraj Chaudhary', email: 'nexa_dheeraj_wm@devmotors.in', role: 'MANAGER', loc: 'Aligarh Nexa' },
    { id: 'nexa_shivam_acc', name: 'Shivam', email: 'nexa_shivam_acc@devmotors.in', role: 'CASHIER', loc: 'Aligarh Nexa' },
    { id: 'nexa_muneesh_bsm', name: 'Muneesh Kumar', email: 'nexa_muneesh_bsm@devmotors.in', role: 'EMPLOYEE', loc: 'Aligarh Nexa' },
    { id: 'nexa_akash_bsm', name: 'Akash Sharma', email: 'nexa_akash_bsm@devmotors.in', role: 'EMPLOYEE', loc: 'Aligarh Nexa' },
    { id: 'nexa_sunny_spare', name: 'Sunny', email: 'nexa_sunny_spare@devmotors.in', role: 'EMPLOYEE', loc: 'Aligarh Nexa' },
    { id: 'nexa_santosh_spare', name: 'Santosh', email: 'nexa_santosh_spare@devmotors.in', role: 'EMPLOYEE', loc: 'Aligarh Nexa' },

    // --- MAIN OUTLET ---
    { id: 'main_ahmar_gm', name: 'Ahmar Ammar', email: 'main_ahmar_gm@devmotors.in', role: 'MANAGER', loc: 'Main Outlet' },
    { id: 'main_dinesh_gm', name: 'Dinesh Sharma', email: 'main_dinesh_gm@devmotors.in', role: 'MANAGER', loc: 'Main Outlet' },
    { id: 'main_radha_ccm', name: 'Radha Pal', email: 'main_radha_ccm@devmotors.in', role: 'EMPLOYEE', loc: 'Main Outlet' },
    { id: 'main_gyanendra_bsm', name: 'Gyanendra Singhle', email: 'main_gyanendra_bsm@devmotors.in', role: 'EMPLOYEE', loc: 'Main Outlet' },
    { id: 'main_sunil_spare', name: 'Sunil Sharma', email: 'main_sunil_spare@devmotors.in', role: 'EMPLOYEE', loc: 'Main Outlet' },

    // --- KHAIR ---
    { id: 'khair_pankaj_sm', name: 'Pankaj Verma', email: 'khair_pankaj_sm@devmotors.in', role: 'MANAGER', loc: 'Khair' },
    { id: 'khair_dev_wm', name: 'Dev Kumar Baghel', email: 'khair_dev_wm@devmotors.in', role: 'MANAGER', loc: 'Khair' },
    { id: 'khair_rohit_acc', name: 'Rohit', email: 'khair_rohit_acc@devmotors.in', role: 'CASHIER', loc: 'Khair' },
    { id: 'khair_rajendra_bm', name: 'Rajendra Dubey', email: 'khair_rajendra_bm@devmotors.in', role: 'EMPLOYEE', loc: 'Khair' },

    // --- ATRAULI ---
    { id: 'atrauli_raj_sm', name: 'Raj Vardhan', email: 'atrauli_raj_sm@devmotors.in', role: 'MANAGER', loc: 'Atrauli' },
    { id: 'atrauli_jai_wm', name: 'Jai Saraswat', email: 'atrauli_jai_wm@devmotors.in', role: 'MANAGER', loc: 'Atrauli' },
    { id: 'atrauli_sumit_acc', name: 'Sumit', email: 'atrauli_sumit_acc@devmotors.in', role: 'CASHIER', loc: 'Atrauli' },
    { id: 'atrauli_yogesh_bsm', name: 'Yogesh Kumar', email: 'atrauli_yogesh_bsm@devmotors.in', role: 'EMPLOYEE', loc: 'Atrauli' },

    // --- IGLAS ---
    { id: 'iglas_nitesh_sm', name: 'Nitesh Pal', email: 'iglas_nitesh_sm@devmotors.in', role: 'MANAGER', loc: 'Iglas' },
    { id: 'iglas_rahul_wm', name: 'Rahul', email: 'iglas_rahul_wm@devmotors.in', role: 'MANAGER', loc: 'Iglas' },
    { id: 'iglas_grish_acc', name: 'Grish Sharma', email: 'iglas_grish_acc@devmotors.in', role: 'CASHIER', loc: 'Iglas' },
    { id: 'iglas_gaurav_cashier', name: 'Gaurav Sharma', email: 'iglas_gaurav_cashier@devmotors.in', role: 'CASHIER', loc: 'Iglas' },
    { id: 'iglas_birendra_emp', name: 'Birendra Tiwari', email: 'iglas_birendra_emp@devmotors.in', role: 'EMPLOYEE', loc: 'Iglas' },
    { id: 'iglas_shibli_rec', name: 'Shibli', email: 'iglas_shibli_rec@devmotors.in', role: 'EMPLOYEE', loc: 'Iglas' },
    { id: 'iglas_bablu_can', name: 'Bablu Canteen', email: 'iglas_bablu_can@devmotors.in', role: 'EMPLOYEE', loc: 'Iglas' },
  ];

  let seededCount = 0;
  for (const u of users) {
    const locId = u.loc ? locMap[u.loc] : null;

    await prisma.user.upsert({
      where: { employeeId: u.id },
      update: {
        name: u.name,
        email: u.email,
        role: u.role,
        locationId: locId,
        passwordHash: passwordHash,
        status: 'ACTIVE',
      },
      create: {
        id: u.id,
        employeeId: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        locationId: locId,
        passwordHash: passwordHash,
        status: 'ACTIVE',
      },
    });
    seededCount++;
    console.log(`Synced user [${u.role}]: ${u.name} (${u.id}) -> ${u.loc || 'Global'}`);
  }

  console.log(`\n🎉 Successfully synced all ${seededCount} users from PDF directory!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
