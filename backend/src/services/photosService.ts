import { prisma } from "@/lib/prisma";

export class PhotosService {
  async getPhotos(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where: { activity: { trailFramesUserId: userId } },
        include: {
          activity: {
            select: { name: true, startDate: true, sportType: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.photo.count({
        where: { activity: { trailFramesUserId: userId } },
      }),
    ]);

    return { photos, total, page, totalPages: Math.ceil(total / limit) };
  }
}
