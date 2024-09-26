import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear un nuevo usuario
  const newUser = await prisma.user.create({
    data: {
      email: 'testuser@example.com',
      password: 'securepassword', // En un caso real, deberías encriptar la contraseña
    },
  });

  console.log('Nuevo usuario creado:', newUser);

  // Obtener todos los usuarios
  const allUsers = await prisma.user.findMany();
  console.log('Todos los usuarios:', allUsers);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
