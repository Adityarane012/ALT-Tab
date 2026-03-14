import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function IndexPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.banned) {
        void router.replace('/banned');
      } else {
        void router.replace('/Dashboard');
      }
    } else {
      void router.replace('/Login');
    }
  }, [user, router]);

  return null;
}

