import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateRegistermeterDto } from '../dto/update-registermeter.dto';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export async function updateRegisterMeter(
  prisma: PrismaService,
  id: number,
  updateRegistermeterDto: UpdateRegistermeterDto,
) {
  const registermeter = await prisma.registerMeter.findUnique({
    where: { id },
  });
  if (!registermeter) throw new NotFoundException('registerMeter not found');

  const oldBillImg = registermeter.billNearImg || '';

  if (
    updateRegistermeterDto.billNearImg &&
    updateRegistermeterDto.billNearImg !== oldBillImg
  ) {
    const oldFilePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'registermeter',
      oldBillImg,
    );

    fs.access(oldFilePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error('Error deleting old icon:', err);
          }
        });
      }
    });
  } else {
    updateRegistermeterDto.billNearImg = oldBillImg || undefined;
  }

  const oldIdcardImg = registermeter.idcardImg || '';

  if (
    updateRegistermeterDto.idcardImg &&
    updateRegistermeterDto.idcardImg !== oldIdcardImg
  ) {
    const oldFilePath = path.resolve(
      process.env.UPLOAD_BASE_PATH || '',
      'registermeter',
      oldIdcardImg,
    );

    fs.access(oldFilePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error('Error deleting old icon:', err);
          }
        });
      }
    });
  } else {
    updateRegistermeterDto.idcardImg = oldIdcardImg || undefined;
  }

  return await prisma.registerMeter.update({
    where: { id },
    data: {
      ...updateRegistermeterDto,
      billNearImg: updateRegistermeterDto.billNearImg || null,
      idcardImg: updateRegistermeterDto.idcardImg || null,
      lat:
        updateRegistermeterDto.lat !== undefined &&
        updateRegistermeterDto.lat !== null
          ? Number(updateRegistermeterDto.lat)
          : undefined,
      lng:
        updateRegistermeterDto.lng !== undefined &&
        updateRegistermeterDto.lng !== null
          ? Number(updateRegistermeterDto.lng)
          : undefined,
      provinceId:
        updateRegistermeterDto.provinceId !== undefined &&
        updateRegistermeterDto.provinceId !== null
          ? Number(updateRegistermeterDto.provinceId)
          : undefined,
      districtId:
        updateRegistermeterDto.districtId !== undefined &&
        updateRegistermeterDto.districtId !== null
          ? Number(updateRegistermeterDto.districtId)
          : undefined,
      villageId:
        updateRegistermeterDto.villageId !== undefined &&
        updateRegistermeterDto.villageId !== null
          ? Number(updateRegistermeterDto.villageId)
          : undefined,
    },
  });
}
