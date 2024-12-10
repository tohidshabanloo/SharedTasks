// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if the token is in localStorage
    const token = localStorage.getItem('token');

    // If token does not exist, redirect to login page
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div style={{ textAlign: 'right', direction: 'rtl' }}>
      <h1>به اپلیکیشن تسک‌های مشترک خوش آمدید</h1>
      <p>شما وارد شده‌اید و می‌توانید تسک‌های خود را مدیریت کنید.</p>
      {/* محتویات صفحه اصلی اینجا قرار می‌گیرد */}
    </div>
  );
}
