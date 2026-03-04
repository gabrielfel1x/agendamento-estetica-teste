'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import SchedulingModal from '@/components/modal/SchedulingModal';

interface ModalCtx {
  openModal: (procIdx?: number) => void;
}

const ModalContext = createContext<ModalCtx>({ openModal: () => {} });

export function ModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialProc, setInitialProc] = useState<number | undefined>();

  const openModal = (procIdx?: number) => {
    setInitialProc(procIdx);
    setOpen(true);
  };

  return (
    <ModalContext.Provider value={{ openModal }}>
      {children}
      <SchedulingModal
        isOpen={open}
        onClose={() => setOpen(false)}
        initialProc={initialProc}
      />
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
