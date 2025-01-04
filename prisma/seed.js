import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Create default categories
  const categories = ["General", "Work", "Personal"];

  // Create categories in the database
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category },
      update: {}, // No updates, just ensure the category exists
      create: { name: category, description: category },
    });
  }

  // Create an initial admin user
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASS; // This should be a secure password in production

  var salt = bcrypt.genSaltSync(10);
  var hashedPassword = bcrypt.hashSync(adminPassword, salt);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail }, // Use email to identify the user for upsert
    update: {}, // No updates, just ensure the admin user exists
    create: {
      firstName: "Initial",
      lastName: "Admin",
      email: adminEmail, // Make sure email is provided
      password: hashedPassword,
      userType: "ADMIN",
      salt: salt, // Salt can be generated with bcrypt if needed
      isActive: true,
      joinDate: new Date(),
      lastLogin: new Date(),
    },
  });

  console.log("Seeded default categories and admin user successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
