import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function IndexPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      void router.replace('/Dashboard');
    } else {
      void router.replace('/Login');
    }
  }, [user, router]);

  return null;
}

