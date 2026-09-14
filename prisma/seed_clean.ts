
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Exact Organization Structure ---');

  // Hardcoded bcrypt hash for "Dev@2026"
  const passValue = '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1l5QkO6qOefqj6lqMvK3MvMh7p7xey';

  // 1. Locations
  const branchData = [
    { name: 'Aligarh Nexa', code: 'LOC_NEXA', city: 'Aligarh', state: 'Uttar Pradesh' },
    { name: 'Main Outlet', code: 'LOC_MAIN', city: 'Aligarh', state: 'Uttar Pradesh' },
    { name: 'Khair', code: 'LOC_KHAIR', city: 'Khair', state: 'Uttar Pradesh' },
    { name: 'Atrauli', code: 'LOC_ATRAULI', city: 'Atrauli', state: 'Uttar Pradesh' },
    { name: 'Iglas', code: 'LOC_IGLAS', city: 'Iglas', state: 'Uttar Pradesh' }
  ];

  const locMap: Record<string, string> = {};

  for (const b of branchData) {
    const loc = await prisma.location.upsert({
      where: { locationCode: b.code },
      update: { name: b.name, city: b.city, state: b.state },
      create: {
        name: b.name,
        locationCode: b.code,
        city: b.city,
        state: b.state
      }
    });
    locMap[b.name] = loc.id;
  }

  // 2. Owners (Global access - no single location restriction)
  const owners = [
    { id: 'owner_dron', name: 'Drona Agarwal', email: 'dron@devmotors.in' },
    { id: 'owner_sumit', name: 'Sumit Agarwal', email: 'sumit@devmotors.in' },
    { id: 'owner_gaurav_agr', name: 'Gaurav Agarwal', email: 'gaurav.agr@devmotors.in' },
    { id: 'owner_gaurav_sharma', name: 'Gaurav Sharma', email: 'gaurav.sharma@devmotors.in' },
    { id: 'owner_arpit', name: 'Arpit Verma', email: 'arpit@devmotors.in' },
  ];

  for (const o of owners) {
    const data: any = {
      employeeId: o.id,
      name: o.name,
      email: o.email,
      role: 'OWNER',
      status: 'ACTIVE'
    };
    data['passwordHash'] = passValue;

    await prisma.user.upsert({
      where: { employeeId: o.id },
      update: data,
      create: { id: o.id, ...data }
    });
  }

  // 3. Managers
  const managers = [
    { id: 'nexa_stephen_sm', name: 'St. Stephen Joseph', loc: 'Aligarh Nexa' },
    { id: 'nexa_dheeraj_wm', name: 'Dheeraj Chaudhary', loc: 'Aligarh Nexa' },
    { id: 'main_ahmar_gm', name: 'Ahmar Ammar', loc: 'Main Outlet' },
    { id: 'main_dinesh_gm', name: 'Dinesh Sharma', loc: 'Main Outlet' },
    { id: 'khair_pankaj_sm', name: 'Pankaj Verma', loc: 'Khair' },
    { id: 'khair_dev_wm', name: 'Dev Kumar Baghel', loc: 'Khair' },
    { id: 'atrauli_raj_sm', name: 'Raj Vardhan', loc: 'Atrauli' },
    { id: 'atrauli_jai_wm', name: 'Jai Saraswat', loc: 'Atrauli' },
    { id: 'iglas_nitesh_sm', name: 'Nitesh Pal', loc: 'Iglas' },
    { id: 'iglas_rahul_wm', name: 'Rahul', loc: 'Iglas' },
  ];

  for (const m of managers) {
    const data: any = {
      employeeId: m.id,
      name: m.name,
      email: `${m.id}@devmotors.in`,
      role: 'MANAGER',
      locationId: locMap[m.loc],
      status: 'ACTIVE'
    };
    data['passwordHash'] = passValue;

    await prisma.user.upsert({
      where: { employeeId: m.id },
      update: data,
      create: { id: m.id, ...data }
    });
  }

  // 4. Cashiers & Accountants
  const cashiers = [
    { id: 'nexa_shivam_acc', name: 'Shivam', loc: 'Aligarh Nexa' },
    { id: 'khair_rohit_acc', name: 'Rohit', loc: 'Khair' },
    { id: 'atrauli_sumit_acc', name: 'Sumit', loc: 'Atrauli' },
    { id: 'iglas_grish_acc', name: 'Grish Sharma', loc: 'Iglas' },
    { id: 'iglas_gaurav_cashier', name: 'Gaurav Sharma', loc: 'Iglas' },
  ];

  for (const c of cashiers) {
    const data: any = {
      employeeId: c.id,
      name: c.name,
      email: `${c.id}@devmotors.in`,
      role: 'CASHIER',
      locationId: locMap[c.loc],
      status: 'ACTIVE'
    };
    data['passwordHash'] = passValue;

    await prisma.user.upsert({
      where: { employeeId: c.id },
      update: data,
      create: { id: c.id, ...data }
    });
  }

  // 5. Employees Mapped to Specific Managers
  const employees = [
    { id: 'nexa_muneesh_bsm', name: 'Muneesh Kumar', loc: 'Aligarh Nexa', mgr: 'nexa_stephen_sm' },
    { id: 'nexa_akash_bsm', name: 'Akash Sharma', loc: 'Aligarh Nexa', mgr: 'nexa_stephen_sm' },
    { id: 'nexa_sunny_spare', name: 'Sunny', loc: 'Aligarh Nexa', mgr: 'nexa_dheeraj_wm' },
    { id: 'nexa_santosh_spare', name: 'Santosh', loc: 'Aligarh Nexa', mgr: 'nexa_dheeraj_wm' },
    { id: 'main_radha_ccm', name: 'Radha Pal', loc: 'Main Outlet', mgr: 'main_ahmar_gm' },
    { id: 'main_gyanendra_bsm', name: 'Gyanendra Singhle', loc: 'Main Outlet', mgr: 'main_ahmar_gm' },
    { id: 'main_sunil_spare', name: 'Sunil Sharma', loc: 'Main Outlet', mgr: 'main_dinesh_gm' },
    { id: 'khair_rajendra_bm', name: 'Rajendra Dubey', loc: 'Khair', mgr: 'khair_pankaj_sm' },
    { id: 'atrauli_yogesh_bsm', name: 'Yogesh Kumar', loc: 'Atrauli', mgr: 'atrauli_raj_sm' },
    { id: 'iglas_birendra_emp', name: 'Birendra Tiwari', loc: 'Iglas', mgr: 'iglas_nitesh_sm' },
    { id: 'iglas_shibli_rec', name: 'Shibli', loc: 'Iglas', mgr: 'iglas_nitesh_sm' },
    { id: 'iglas_bablu_can', name: 'Bablu Canteen', loc: 'Iglas', mgr: 'iglas_nitesh_sm' },
  ];

  for (const e of employees) {
    const data: any = {
      employeeId: e.id,
      name: e.name,
      email: `${e.id}@devmotors.in`,
      role: 'EMPLOYEE',
      locationId: locMap[e.loc],
      managerId: e.mgr,
      status: 'ACTIVE'
    };
    data['passwordHash'] = passValue;

    await prisma.user.upsert({
      where: { employeeId: e.id },
      update: data,
      create: { id: e.id, ...data }
    });
  }

  console.log('✅ DATABASE SEED COMPLETE: All Users and Hierarchy Seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
