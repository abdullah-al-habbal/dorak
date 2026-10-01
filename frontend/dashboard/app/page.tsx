import { redirect } from 'next/navigation';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';
export default function Home() {
  redirect(APP_ROUTES.login);
}
