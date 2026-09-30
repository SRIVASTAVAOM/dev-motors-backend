"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVICE_OWNER_IDS = exports.SALES_OWNER_IDS = exports.SALES_EMPLOYEE_IDS = exports.SALES_MEMBER_KEYWORDS = void 0;
exports.getDepartment = getDepartment;
exports.isSalesOwner = isSalesOwner;
exports.isServiceOwner = isServiceOwner;
exports.getOwnerQueryForDepartment = getOwnerQueryForDepartment;
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
exports.SALES_MEMBER_KEYWORDS = [
    'stephen',
    'ahmar',
    'pankaj',
    'raj vardhan',
    'nitesh pal',
    'nitesh',
    'shibli',
];
exports.SALES_EMPLOYEE_IDS = [
    'nexa_stephen_sm',
    'main_ahmar_gm',
    'khair_pankaj_sm',
    'atrauli_raj_sm',
    'iglas_nitesh_sm',
    'iglas_shibli_rec',
];
exports.SALES_OWNER_IDS = [
    'owner_sumit',
    'owner_gaurav_sharma',
];
exports.SERVICE_OWNER_IDS = [
    'owner_arpit',
    'owner_dron',
];
/**
 * Determines whether a user or expense belongs to Sales or Service.
 * Default is 'Service'.
 */
function getDepartment(userOrExpense) {
    if (!userOrExpense)
        return 'Service';
    // If already explicitly set
    if (userOrExpense.department === 'Sales' || userOrExpense.department === 'Service') {
        return userOrExpense.department;
    }
    // Extract candidate strings from expense or user
    const emp = userOrExpense.employee || userOrExpense.user || userOrExpense;
    const empId = (userOrExpense.employeeId ||
        emp.employeeId ||
        emp.id ||
        '').toString().toLowerCase().trim();
    const name = (emp.name ||
        userOrExpense.employeeName ||
        userOrExpense.userName ||
        (typeof userOrExpense.employee === 'string' ? userOrExpense.employee : '') ||
        '').toString().toLowerCase().trim();
    const email = (emp.email || '').toString().toLowerCase().trim();
    // Match by exact ID
    for (const id of exports.SALES_EMPLOYEE_IDS) {
        if (empId === id || empId.includes(id)) {
            return 'Sales';
        }
    }
    // Match by keyword in name / email / ID
    for (const keyword of exports.SALES_MEMBER_KEYWORDS) {
        const compact = keyword.replace(/\s+/g, '');
        if (name.includes(keyword) ||
            email.includes(compact) ||
            empId.includes(compact)) {
            return 'Sales';
        }
    }
    return 'Service';
}
/**
 * Checks if the user is a Sales Owner (Sumit Agarwal or Gaurav Sharma).
 */
function isSalesOwner(user) {
    if (!user)
        return false;
    const empId = (user.employeeId || user.id || '').toString().toLowerCase().trim();
    const name = (user.name || '').toString().toLowerCase().trim();
    return (empId === 'owner_sumit' ||
        empId === 'owner_gaurav_sharma' ||
        name.includes('sumit') ||
        name.includes('gaurav sharma'));
}
/**
 * Checks if the user is a Service Owner (Arpit Verma or Drona Agarwal).
 */
function isServiceOwner(user) {
    if (!user)
        return false;
    const empId = (user.employeeId || user.id || '').toString().toLowerCase().trim();
    const name = (user.name || '').toString().toLowerCase().trim();
    return (empId === 'owner_arpit' ||
        empId === 'owner_dron' ||
        name.includes('arpit') ||
        name.includes('dron'));
}
/**
 * Returns Prisma query filter for finding the appropriate Department Owners.
 */
function getOwnerQueryForDepartment(dept) {
    if (dept === 'Sales') {
        return {
            role: 'OWNER',
            status: 'ACTIVE',
            OR: [
                { employeeId: { in: exports.SALES_OWNER_IDS } },
                { name: { contains: 'Sumit', mode: 'insensitive' } },
                { name: { contains: 'Gaurav Sharma', mode: 'insensitive' } },
            ],
        };
    }
    else {
        return {
            role: 'OWNER',
            status: 'ACTIVE',
            OR: [
                { employeeId: { in: exports.SERVICE_OWNER_IDS } },
                { name: { contains: 'Arpit', mode: 'insensitive' } },
                { name: { contains: 'Dron', mode: 'insensitive' } },
            ],
        };
    }
}
