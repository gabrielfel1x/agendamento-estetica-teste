'use client';

import { useModal } from '@/lib/modal-context';

interface Props {
  procIdx?: number;
  className?: string;
  children: React.ReactNode;
}

export default function OpenModalButton({ procIdx, className, children }: Props) {
  const { openModal } = useModal();
  return (
    <button className={className} onClick={() => openModal(procIdx)}>
      {children}
    </button>
  );
}
