import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Interfaz desactivada por solicitud del usuario
  redirect('/');
  return null;
}
