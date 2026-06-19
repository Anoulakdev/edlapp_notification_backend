import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProblemdocDto } from '../dto/create-problemdoc.dto';
import * as fs from 'fs';
import * as path from 'path';

export async function createProblemDoc(
  prisma: PrismaService,
  createProblemdocDto: CreateProblemdocDto,
  Docfilename?: string,
) {
  try {
    return await prisma.problemDoc.create({
      data: {
        ...createProblemdocDto,
        problemtypeId: Number(createProblemdocDto.problemtypeId),
        lat: Number(createProblemdocDto.lat),
        lng: Number(createProblemdocDto.lng),
        provinceId: Number(createProblemdocDto.provinceId),
        districtId: Number(createProblemdocDto.districtId),
        villageId: Number(createProblemdocDto.villageId),
        sourcetypeId: Number(createProblemdocDto.sourcetypeId),
        createdById: Number(createProblemdocDto.createdById),
        problemImg: Docfilename || null,
      },
    });
  } catch (error) {
    if (Docfilename) {
      const filePath = path.resolve(
        process.env.UPLOAD_BASE_PATH || '',
        'problem',
        Docfilename,
      );

      try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        await fs.promises.unlink(filePath);
      } catch (fsError) {
        console.error('Error deleting uploaded icon:', fsError);
      }
    }
    throw error;
  }
}
