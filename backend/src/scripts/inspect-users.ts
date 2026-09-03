import prisma from "../lib/prisma.js";

async function inspect() {
  const users = await prisma.user.findMany({
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  console.log("=== CURRENT DATABASE USERS ===");
  users.forEach((u) => {
    const roles = u.userRoles.map((ur) => ur.role.name).join(", ");
    console.log(`- ID: ${u.id} | Email: ${u.email} | Status: ${u.status} | Roles: [${roles}]`);
  });

  const roles = await prisma.role.findMany({
    include: { rolePermissions: { include: { permission: true } } },
  });
  console.log("=== CURRENT ROLES ===");
  roles.forEach((r) => {
    console.log(`- Role: ${r.name} (${r.description}) | Permissions: ${r.rolePermissions.length}`);
  });
}

inspect()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
