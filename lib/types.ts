export interface Procedure {
  name: string;
  dur: string;
  price: string;
  image: string;
  tag: string;
  desc: string;
}

export interface Appointment {
  id: string;
  procedure: string;
  image: string;
  date: string;
  time: string;
  patient: string;
  email: string;
  phone: string;
  price: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
  createdAt: string;
}

export interface ModalState {
  step: number;
  procIdx: number;
  selDate: Date | null;
  selTime: string | null;
  formData: {
    name: string;
    phone: string;
    email: string;
    obs: string;
  };
  payMethod: 'card' | 'pix';
}
