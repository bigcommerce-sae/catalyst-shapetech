'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { Message } from '~/components/ui/message';

interface Props {
  message: string;
}

export const MessageWrapper = ({ message }: Props) => {
  const pathname = usePathname();

  useEffect(() => {
    const newPath = `${window.location.origin}${pathname}`;

    window.history.replaceState({ action: 'clear history' }, '', newPath);
  }, [pathname]);

  return (
    <Message className="col-span-full mb-8 w-full text-gray-500" variant="success">
      <p>{message}</p>
    </Message>
  );
};
