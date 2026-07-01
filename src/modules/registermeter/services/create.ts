import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { CreateRegistermeterDto } from '../dto/create-registermeter.dto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Helper function to delete uploaded files on transaction failure
 */
async function deleteUploadedFile(filename?: string) {
  if (!filename) return;

  const filePath = path.resolve(
    process.env.UPLOAD_BASE_PATH || '',
    'registermeter',
    filename,
  );

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    await fs.promises.unlink(filePath);
  } catch (err) {
    console.error(`Error deleting uploaded file at ${filePath}:`, err);
  }
}

export async function createRegistermeter(
  prisma: PrismaService,
  user: AuthUser,
  createRegistermeterDto: CreateRegistermeterDto,
) {
  try {
    const roleId = user.roleId;

    // Determine IDs based on user roles
    // Role 6: Customer, Role 2/3: Staff/Officer
    const sourcetypeId = (roleId === 2 || roleId === 3) ? 2 : 1;
    const meterStatusId = (roleId === 2 || roleId === 3) ? 2 : 1;

    // Resolve creator ID
    let createdById = user.id;
    if (roleId !== 2 && roleId !== 3 && createRegistermeterDto.createdById) {
      const parsedId = Number(createRegistermeterDto.createdById);
      if (!isNaN(parsedId)) {
        createdById = parsedId;
      }
    }

    // Resolve optional float coordinates safely to avoid NaN
    const lat = createRegistermeterDto.lat !== undefined && createRegistermeterDto.lat !== null
      ? Number(createRegistermeterDto.lat)
      : null;
    const lng = createRegistermeterDto.lng !== undefined && createRegistermeterDto.lng !== null
      ? Number(createRegistermeterDto.lng)
      : null;

    const parsedLat = lat !== null && !isNaN(lat) ? lat : null;
    const parsedLng = lng !== null && !isNaN(lng) ? lng : null;

    return await prisma.$transaction(async (tx) => {
      const registerMeter = await tx.registerMeter.create({
        data: {
          ...createRegistermeterDto,
          lat: parsedLat,
          lng: parsedLng,
          provinceId: Number(createRegistermeterDto.provinceId),
          districtId: Number(createRegistermeterDto.districtId),
          villageId: Number(createRegistermeterDto.villageId),
          meterStatusId,
          sourcetypeId,
          createdById,
          billNearImg: createRegistermeterDto.billNearImg || '',
          idcardImg: createRegistermeterDto.idcardImg || '',
        },
      });

      if (roleId === 2 || roleId === 3) {
        await tx.userAcceptMeter.create({
          data: {
            meterId: registerMeter.id,
            userCallId: user.id,
          },
        });
      }

      return registerMeter;
    });
  } catch (error) {
    // Clean up uploaded files in case of database insertion error
    await deleteUploadedFile(createRegistermeterDto?.billNearImg);
    await deleteUploadedFile(createRegistermeterDto?.idcardImg);
    throw error;
  }
}
