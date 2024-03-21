import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const { orgId, userId } = auth();

    if (!orgId || !userId)
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });

    const card = await db.card.findUnique({
      where: {
        id: params.cardId,
        list: {
          board: {
            orgId,
          },
        },
      },
      include: {
        list: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    return new NextResponse(JSON.stringify(error), { status: 500 });
  }
}
