
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning previous test data ---');
  try {
    await prisma.approval.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.location.deleteMany({});
  } catch (e) {
    console.log('Tables empty or skipping cleanup:', e.message);
  }

  const hashedPassword = await bcrypt.hash('Dev@2026', 10);

  console.log('--- Creating Locations ---');
  const locNames = ['Aligarh Nexa', 'Main Outlet', 'Khair', 'Atrauli', 'Iglas'];
  const locations: Record<string, any> = {};

  for (const name of locNames) {
    const code = name.toLowerCase().replace(/\s+/g, '_');
    locations[name] = await prisma.location.create({
      data: { name, code }
    });
  }

  console.log('--- Creating Owners ---');
  const owners = [
    { id: 'owner_dron', name: 'Dron Agarwal', email: 'dron@devmotors.in' },
    { id: 'owner_sumit', name: 'Sumit Agarwal', email: 'sumit@devmotors.in' },
    { id: 'owner_gaurav_agr', name: 'Gaurav Agarwal', email: 'gaurav.agr@devmotors.in' },
    { id: 'owner_gaurav_sharma', name: 'Gaurav Sharma', email: 'gaurav.sharma@devmotors.in' },
    { id: 'owner_arpit', name: 'Arpit Verma', email: 'arpit@devmotors.in' },
  ];

  for (const o of owners) {
    await prisma.user.create({
      data: {
        id: o.id,
        employeeId: o.id,
        name: o.name,
        email: o.email,
        password: hashedPassword,
        role: 'OWNER',
        status: 'ACTIVE'
      }
    });
  }

  console.log('--- Creating Branch Managers & Cashiers ---');
  const managers = [
    { id: 'nexa_stephen_sm', name: 'St. Stephen Joseph', loc: 'Aligarh Nexa', designation: 'Showroom Manager' },
    { id: 'nexa_dheeraj_wm', name: 'Dheeraj Chaudhary', loc: 'Aligarh Nexa', designation: 'Workshop Manager' },
    { id: 'main_ahmar_gm', name: 'Ahmar Ammar', loc: 'Main Outlet', designation: 'GM Sales' },
    { id: 'main_dinesh_gm', name: 'Dinesh Sharma', loc: 'Main Outlet', designation: 'General Manager' },
    { id: 'khair_pankaj_sm', name: 'Pankaj Verma', loc: 'Khair', designation: 'Showroom Manager' },
    { id: 'khair_dev_wm', name: 'Dev Kumar Baghel', loc: 'Khair', designation: 'Workshop Manager' },
    { id: 'atrauli_raj_sm', name: 'Raj Vardhan', loc: 'Atrauli', designation: 'Showroom Manager' },
    { id: 'atrauli_jai_wm', name: 'Jai Saraswat', loc: 'Atrauli', designation: 'Workshop Manager' },
    { id: 'iglas_nitesh_sm', name: 'Nitesh Pal', loc: 'Iglas', designation: 'Showroom Manager' },
    { id: 'iglas_rahul_wm', name: 'Rahul', loc: 'Iglas', designation: 'Workshop Manager' },
  ];

  for (const m of managers) {
    await prisma.user.create({
      data: {
        id: m.id,
        employeeId: m.id,
        name: m.name,
        email: `${m.id}@devmotors.in`,
        password: hashedPassword,
        role: 'MANAGER',
        locationId: locations[m.loc].id,
        status: 'ACTIVE'
      }
    });
  }

  const cashiers = [
    { id: 'nexa_shivam_acc', name: 'Shivam', loc: 'Aligarh Nexa' },
    { id: 'khair_rohit_acc', name: 'Rohit', loc: 'Khair' },
    { id: 'atrauli_sumit_acc', name: 'Sumit', loc: 'Atrauli' },
    { id: 'iglas_grish_acc', name: 'Grish Sharma', loc: 'Iglas' },
    { id: 'iglas_gaurav_cashier', name: 'Gaurav Sharma (Cashier)', loc: 'Iglas' },
  ];

  for (const c of cashiers) {
    await prisma.user.create({
      data: {
        id: c.id,
        employeeId: c.id,
        name: c.name,
        email: `${c.id}@devmotors.in`,
        password: hashedPassword,
        role: 'CASHIER',
        locationId: locations[c.loc].id,
        status: 'ACTIVE'
      }
    });
  }

  console.log('--- Creating Employees Mapped to Managers ---');
  const employees = [
    { id: 'nexa_muneesh_bsm', name: 'Muneesh Kumar (BSM)', loc: 'Aligarh Nexa', mgr: 'nexa_stephen_sm' },
    { id: 'nexa_akash_bsm', name: 'Akash Sharma (BSM)', loc: 'Aligarh Nexa', mgr: 'nexa_stephen_sm' },
    { id: 'nexa_sunny_spare', name: 'Sunny (Spare Parts)', loc: 'Aligarh Nexa', mgr: 'nexa_dheeraj_wm' },
    { id: 'nexa_santosh_spare', name: 'Santosh (Spare Parts)', loc: 'Aligarh Nexa', mgr: 'nexa_dheeraj_wm' },
    
    { id: 'main_radha_ccm', name: 'Radha Pal (CCM)', loc: 'Main Outlet', mgr: 'main_ahmar_gm' },
    { id: 'main_gyanendra_bsm', name: 'Gyanendra Singhle (BSM)', loc: 'Main Outlet', mgr: 'main_ahmar_gm' },
    { id: 'main_sunil_spare', name: 'Sunil Sharma (Spare Parts)', loc: 'Main Outlet', mgr: 'main_dinesh_gm' },

    { id: 'khair_rajendra_bm', name: 'Rajendra Dubey (Bodyshop Mgr)', loc: 'Khair', mgr: 'khair_pankaj_sm' },

    { id: 'atrauli_yogesh_bsm', name: 'Yogesh Kumar (BSM)', loc: 'Atrauli', mgr: 'atrauli_raj_sm' },

    { id: 'iglas_birendra_emp', name: 'Birendra Tiwari', loc: 'Iglas', mgr: 'iglas_nitesh_sm' },
    { id: 'iglas_shibli_rec', name: 'Shibli (Receptionist)', loc: 'Iglas', mgr: 'iglas_nitesh_sm' },
    { id: 'iglas_bablu_can', name: 'Bablu Canteen', loc: 'Iglas', mgr: 'iglas_nitesh_sm' },
  ];

  for (const e of employees) {
    await prisma.user.create({
      data: {
        id: e.id,
        employeeId: e.id,
        name: e.name,
        email: `${e.id}@devmotors.in`,
        password: hashedPassword,
        role: 'EMPLOYEE',
        locationId: locations[e.loc].id,
        managerId: e.mgr,
        status: 'ACTIVE'
      }
    });
  }

  console.log('✅ ALL USERS, MANAGERS, OWNERS, AND CASHIERS SEEDED SUCCESSFULLY!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
