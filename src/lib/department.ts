export type Department = 'Sales' | 'Service';

/**
 * 1. Sales Department Team:
 *    - Members: Stephen, Ahmar, Pankaj, Raj Vardhan, Nitesh Pal, Shibli.
 *    - Approval Flow: Member -> Sales Manager -> Sales Owners (Sumit Agrwal & Gaurav Sharma).
 *    - Category Label: "Sales"
 *
 * 2. Service Department Team:
 *    - Members: All other users/employees not listed in the Sales team belong to Service by default.
 *    - Approval Flow: Member -> Service Manager -> Service Owners (Arpit Verma & Drona Agrwal).
 *    - Category Label: "Service"
 */

export const SALES_MEMBER_KEYWORDS = [
  'stephen',
  'ahmar',
  'pankaj',
  'raj vardhan',
  'nitesh pal',
  'nitesh',
  'shibli',
];

export const SALES_EMPLOYEE_IDS = [
  'nexa_stephen_sm',
  'main_ahmar_gm',
  'khair_pankaj_sm',
  'atrauli_raj_sm',
  'iglas_nitesh_sm',
  'main_shibli_rec',
  'iglas_shibli_rec',
];

export const SALES_OWNER_IDS = [
  'owner_sumit',
  'owner_gaurav_sharma',
];

export const SERVICE_OWNER_IDS = [
  'owner_arpit',
  'owner_dron',
];

/**
 * Determines whether a user or expense belongs to Sales or Service.
 * Default is 'Service'.
 */
export function getDepartment(userOrExpense: any): Department {
  if (!userOrExpense) return 'Service';

  // If already explicitly set
  if (userOrExpense.department === 'Sales' || userOrExpense.department === 'Service') {
    return userOrExpense.department;
  }

  // Extract candidate strings from expense or user
  const emp = userOrExpense.employee || userOrExpense.user || userOrExpense;
  const empId = (
    userOrExpense.employeeId ||
    emp.employeeId ||
    emp.id ||
    ''
  ).toString().toLowerCase().trim();

  const name = (
    emp.name ||
    userOrExpense.employeeName ||
    userOrExpense.userName ||
    (typeof userOrExpense.employee === 'string' ? userOrExpense.employee : '') ||
    ''
  ).toString().toLowerCase().trim();

  const email = (emp.email || '').toString().toLowerCase().trim();

  // Match by exact ID
  for (const id of SALES_EMPLOYEE_IDS) {
    if (empId === id || empId.includes(id)) {
      return 'Sales';
    }
  }

  // Match by keyword in name / email / ID
  for (const keyword of SALES_MEMBER_KEYWORDS) {
    const compact = keyword.replace(/\s+/g, '');
    if (
      name.includes(keyword) ||
      email.includes(compact) ||
      empId.includes(compact)
    ) {
      return 'Sales';
    }
  }

  return 'Service';
}

/**
 * Checks if the user is a Sales Owner (Sumit Agarwal or Gaurav Sharma).
 */
export function isSalesOwner(user: any): boolean {
  if (!user) return false;
  const empId = (user.employeeId || user.id || '').toString().toLowerCase().trim();
  const name = (user.name || '').toString().toLowerCase().trim();

  return (
    empId === 'owner_sumit' ||
    empId === 'owner_gaurav_sharma' ||
    name.includes('sumit') ||
    name.includes('gaurav sharma')
  );
}

/**
 * Checks if the user is a Service Owner (Arpit Verma or Drona Agarwal).
 */
export function isServiceOwner(user: any): boolean {
  if (!user) return false;
  const empId = (user.employeeId || user.id || '').toString().toLowerCase().trim();
  const name = (user.name || '').toString().toLowerCase().trim();

  return (
    empId === 'owner_arpit' ||
    empId === 'owner_dron' ||
    name.includes('arpit') ||
    name.includes('dron')
  );
}

/**
 * Returns Prisma query filter for finding the appropriate Department Owners.
 */
export function getOwnerQueryForDepartment(dept: Department) {
  if (dept === 'Sales') {
    return {
      role: 'OWNER' as const,
      status: 'ACTIVE' as const,
      OR: [
        { employeeId: { in: SALES_OWNER_IDS } },
        { name: { contains: 'Sumit', mode: 'insensitive' as const } },
        { name: { contains: 'Gaurav Sharma', mode: 'insensitive' as const } },
      ],
    };
  } else {
    return {
      role: 'OWNER' as const,
      status: 'ACTIVE' as const,
      OR: [
        { employeeId: { in: SERVICE_OWNER_IDS } },
        { name: { contains: 'Arpit', mode: 'insensitive' as const } },
        { name: { contains: 'Dron', mode: 'insensitive' as const } },
      ],
    };
  }
}
