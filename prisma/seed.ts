import { PrismaClient } from '@prisma/client';
import { INITIAL_NOTES } from '../src/lib/initialData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database with initial atomic notes...');
  for (const note of INITIAL_NOTES) {
    await prisma.note.upsert({
      where: { id: note.id },
      update: {},
      create: {
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        cluster: note.cluster,
        explicitLinks: note.explicitLinks,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      },
    });
  }
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
