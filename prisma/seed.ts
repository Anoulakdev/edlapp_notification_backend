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
      { id: 5, name: 'Staff District', description: '' },
      { id: 6, name: 'EDL APP', description: '' },
    ];
    for (const r of roles) {
      await prisma.role.upsert({
        where: { id: r.id },
        update: { name: r.name, description: r.description },
        create: { id: r.id, name: r.name, description: r.description },
      });
    }

    console.log('Seeding meter status...');
    const meterStatus = [
      {
        id: 1,
        edlapp: 'ລໍຖ້າຮັບເລື່ອງຈາກ Call Center',
        callcenter: 'ລໍຖ້າຮັບເລື່ອງ',
      },
      {
        id: 2,
        edlapp: 'ລໍຖ້າຮັບເອກະສານຈາກສາຂາແຂວງ',
        callcenter: 'ລໍຖ້າຮັບເອກະສານ',
      },
      { id: 3, edlapp: 'ຮັບເອກະສານສຳເລັດ', callcenter: 'ຮັບເອກະສານສຳເລັດ' },
    ];
    for (const r of meterStatus) {
      await prisma.meterStatus.upsert({
        where: { id: r.id },
        update: { edlapp: r.edlapp, callcenter: r.callcenter },
        create: { id: r.id, edlapp: r.edlapp, callcenter: r.callcenter },
      });
    }

    console.log('Seeding source type...');
    const sourceType = [
      { id: 1, name: 'EDLAPP', description: '' },
      { id: 2, name: 'Call Center', description: '' },
    ];
    for (const r of sourceType) {
      await prisma.sourceType.upsert({
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
    const usersToSeed = [
      { username: '40607', roleId: 1 },
      { username: '39853', roleId: 2 },
      { username: '44653', roleId: 6 },
    ];

    const results: any[] = [];
    for (const user of usersToSeed) {
      console.log(`Seeding user ${user.username}...`);
      const existingUser = await prisma.user.findUnique({
        where: { username: user.username },
      });

      if (!existingUser) {
        const result = await createUser(prisma, user);
        results.push(result);
      } else {
        console.log(`User ${user.username} already exists, skipping.`);
      }
    }

    console.log(
      'Seeding completed successfully:',
      JSON.stringify(results, null, 2),
    );
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

//npx prisma db seed
