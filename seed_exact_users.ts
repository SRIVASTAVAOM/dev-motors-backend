import { prisma } from './src/config/database.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Setting up exact 20 Team Members across 5 Dealerships...');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('12345678', salt);

  // 1. Five Dealership Locations
  const locationsData = [
    { locationCode: 'LOC_KNP1', name: 'Kanpur Main Dealership', city: 'Kanpur', state: 'Uttar Pradesh' },
    { locationCode: 'LOC_KNP2', name: 'Kanpur City Workshop', city: 'Kanpur', state: 'Uttar Pradesh' },
    { locationCode: 'LOC_ALG', name: 'Aligarh Branch', city: 'Aligarh', state: 'Uttar Pradesh' },
    { locationCode: 'LOC_AGR', name: 'Agra Express Branch', city: 'Agra', state: 'Uttar Pradesh' },
    { locationCode: 'LOC_LKO', name: 'Lucknow Central Hub', city: 'Lucknow', state: 'Uttar Pradesh' },
  ];

  const locations = [];
  for (const loc of locationsData) {
    let l = await prisma.location.findFirst({ where: { locationCode: loc.locationCode } });
    if (!l) {
      l = await prisma.location.create({ data: loc });
    }
    locations.push(l);
  }

  // 2. Prepare 4 Owners, 1 Cashier, 5 Managers, 10 Employees
  const usersToCreate = [
    // --- 4 OWNERS ---
    { employeeId: 'OWN001', name: 'Devendra Sharma (Managing Director)', email: 'devendra@devmotors.com', role: 'OWNER', locIndex: 0 },
    { employeeId: 'OWN002', name: 'Rajesh Gupta (Executive Director)', email: 'rajesh@devmotors.com', role: 'OWNER', locIndex: 0 },
    { employeeId: 'OWN003', name: 'Vikram Singh (Partner)', email: 'vikram@devmotors.com', role: 'OWNER', locIndex: 4 },
    { employeeId: 'OWN004', name: 'Amit Verma (Director Operations)', email: 'amit@devmotors.com', role: 'OWNER', locIndex: 2 },

    // --- 1 CENTRAL CASHIER ---
    { employeeId: 'CASH001', name: 'Suresh Chandra (Chief Cashier & Finance)', email: 'cashier@devmotors.com', role: 'CASHIER', locIndex: 0 },

    // --- 5 MANAGERS ---
    { employeeId: 'MGR001', name: 'Ramesh Yadav (Kanpur Main Manager)', email: 'mgr.kanpur1@devmotors.com', role: 'MANAGER', locIndex: 0 },
    { employeeId: 'MGR002', name: 'Anil Dixit (Kanpur Workshop Manager)', email: 'mgr.kanpur2@devmotors.com', role: 'MANAGER', locIndex: 1 },
    { employeeId: 'MGR003', name: 'Sunil Sharma (Aligarh Branch Manager)', email: 'mgr.aligarh@devmotors.com', role: 'MANAGER', locIndex: 2 },
    { employeeId: 'MGR004', name: 'Pradeep Mishra (Agra Branch Manager)', email: 'mgr.agra@devmotors.com', role: 'MANAGER', locIndex: 3 },
    { employeeId: 'MGR005', name: 'Deepak Tiwari (Lucknow Hub Manager)', email: 'mgr.lucknow@devmotors.com', role: 'MANAGER', locIndex: 4 },

    // --- 10 EMPLOYEES (Sales & Service) ---
    { employeeId: 'EMP001', name: 'Rahul Verma (Sales Executive)', email: 'rahul.v@devmotors.com', role: 'EMPLOYEE', locIndex: 0 },
    { employeeId: 'EMP002', name: 'Vikas Kumar (Service Advisor)', email: 'vikas.k@devmotors.com', role: 'EMPLOYEE', locIndex: 0 },
    { employeeId: 'EMP003', name: 'Mohit Pandey (Sales Executive)', email: 'mohit.p@devmotors.com', role: 'EMPLOYEE', locIndex: 1 },
    { employeeId: 'EMP004', name: 'Sanjay Rawat (Technician Head)', email: 'sanjay.r@devmotors.com', role: 'EMPLOYEE', locIndex: 1 },
    { employeeId: 'EMP005', name: 'Gaurav Dubey (Sales Officer)', email: 'gaurav.d@devmotors.com', role: 'EMPLOYEE', locIndex: 2 },
    { employeeId: 'EMP006', name: 'Manoj Singh (Service Consultant)', email: 'manoj.s@devmotors.com', role: 'EMPLOYEE', locIndex: 2 },
    { employeeId: 'EMP007', name: 'Pooja Saxena (Customer Relations)', email: 'pooja.s@devmotors.com', role: 'EMPLOYEE', locIndex: 3 },
    { employeeId: 'EMP008', name: 'Tarun Mathur (Field Executive)', email: 'tarun.m@devmotors.com', role: 'EMPLOYEE', locIndex: 3 },
    { employeeId: 'EMP009', name: 'Abhishek Jha (Sales Consultant)', email: 'abhishek.j@devmotors.com', role: 'EMPLOYEE', locIndex: 4 },
    { employeeId: 'EMP010', name: 'Karan Malhotra (Service Incharge)', email: 'karan.m@devmotors.com', role: 'EMPLOYEE', locIndex: 4 },
  ];

  for (const u of usersToCreate) {
    const locId = locations[u.locIndex].id;
    const existing = await prisma.user.findFirst({ where: { employeeId: u.employeeId } });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: u.name,
          email: u.email,
          role: u.role as any,
          locationId: locId,
          passwordHash: passwordHash,
        }
      });
    } else {
      await prisma.user.create({
        data: {
          employeeId: u.employeeId,
          name: u.name,
          email: u.email,
          role: u.role as any,
          locationId: locId,
          passwordHash: passwordHash,
        } as any
      });
    }
  }

  console.log('✅ Successfully seeded 4 Owners, 1 Cashier, 5 Managers, 10 Employees!');
}

main().catch(console.error).finally(() => process.exit(0));
