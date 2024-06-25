import { PrismaClient, Permission } from '@prisma/client';
import { get, start } from 'prompt';
import { DEFAULT_PASSWORD } from 'src/config/const';
import { hashPassword } from 'src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  start();
  get(['firstName', 'lastName', 'phoneNumber'], async function (err, result) {
    if (err) throw err;
    const { firstName, lastName, phoneNumber } = result;

    const user = await prisma.user.create({
      data: {
        firstName: firstName.toString(),
        lastName: lastName.toString(),
        phoneNumber: phoneNumber.toString(),
        isSuperAdmin: true,
        permissions: Object.values(Permission),
        password: await hashPassword(DEFAULT_PASSWORD),
      },
    });

    console.log('Superadmin created:', user);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
