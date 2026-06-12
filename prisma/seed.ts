import * as dotenv from 'dotenv';
import { PrismaService } from '../src/prisma/prisma.service';
import { createUser } from '../src/modules/user/services/create';

// Sync service imports (Required to populate master data tables so employee foreign keys don't fail)
import { createDepartment } from '../src/modules/department/services/create';
import { createDivision } from '../src/modules/division/services/create';
import { createOffice } from '../src/modules/office/services/create';
import { createUnit } from '../src/modules/unit/services/create';
import { createPositionGroup } from '../src/modules/positiongroup/services/create';
import { createPositionCode } from '../src/modules/positioncode/services/create';
import { createPosition } from '../src/modules/position/services/create';
import { createProvince } from '../src/modules/province/services/create';
import { createDistrict } from '../src/modules/district/services/create';
import { createVillage } from '../src/modules/village/services/create';

dotenv.config();

async function main() {
  const prisma = new PrismaService();

  console.log('Start seeding...');

  try {
    // 1. Seed Roles
    console.log('Seeding roles...');
    const roles = [
      { id: 1, name: 'Super Admin', description: '' },
      { id: 2, name: 'Admin Call Center', description: '' },
      { id: 3, name: 'Staff Call Center', description: '' },
      { id: 4, name: 'Admin Branch', description: '' },
      { id: 5, name: 'Staff Branch', description: '' },
      { id: 6, name: 'EDL APP', description: '' },
    ];
    for (const r of roles) {
      await prisma.role.upsert({
        where: { id: r.id },
        update: { name: r.name, description: r.description },
        create: { id: r.id, name: r.name, description: r.description },
      });
    }

    // 2. Sync Master Data sequentially (handling dependencies)
    // This is REQUIRED because Employee creation references these tables via Foreign Keys.
    console.log('Syncing departments...');
    await createDepartment(prisma);

    console.log('Syncing divisions...');
    await createDivision(prisma);

    console.log('Syncing offices...');
    await createOffice(prisma);

    console.log('Syncing units...');
    await createUnit(prisma);

    console.log('Syncing position groups...');
    await createPositionGroup(prisma);

    console.log('Syncing position codes...');
    await createPositionCode(prisma);

    console.log('Syncing positions...');
    await createPosition(prisma);

    console.log('Syncing provinces...');
    await createProvince(prisma);

    console.log('Syncing districts...');
    await createDistrict(prisma);

    console.log('Syncing villages...');
    await createVillage(prisma);

    // 3. Seed User
    console.log('Seeding user 40607...');
    const result = await createUser(prisma, {
      username: '40607',
      roleId: 1,
    });

    console.log(
      'Seeding completed successfully:',
      JSON.stringify(result, null, 2),
    );
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
