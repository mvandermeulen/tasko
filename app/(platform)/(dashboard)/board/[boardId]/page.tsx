import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { ListContainer } from './_components/list-container';

interface BoardIdPageProps {
  params: Promise<{
    boardId: string;
  }>;
}

const BoardIdPage = async (props: BoardIdPageProps) => {
  const params = await props.params;
  const { orgId } = await auth();

  if (!orgId) {
    redirect('/select-org');
  }

  const lists = await db.list.findMany({
    where: {
      boardId: params.boardId,
      board: {
        orgId,
      },
    },
    include: {
      cards: {
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
    cacheStrategy: { ttl: 30, swr: 60 },
  });

  return (
    <div className='h-full overflow-x-auto p-4'>
      <ListContainer boardId={params.boardId} data={lists} />
    </div>
  );
};

export default BoardIdPage;
