
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { User } from '@/lib/types';


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if already authenticated
    if (typeof window !== 'undefined' && localStorage.getItem('authenticated') === 'true') {
      router.replace('/');
    }
  }, [router]);


  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Now fetch user profile from Firestore
        const q = query(collection(db, "users"), where("email", "==", firebaseUser.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setError("لم يتم العثور على ملف تعريف المستخدم.");
            return;
        }
        
        const userDoc = querySnapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() } as User;

        if (typeof window !== 'undefined') {
            localStorage.setItem('authenticated', 'true');
            localStorage.setItem('user', JSON.stringify(userData));
            router.push('/');
        }

    } catch (error: any) {
        console.error("Login Error:", error);
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        } else {
            setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        }
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <Stethoscope className="mx-auto h-12 w-12 text-primary" />
            <h1 className="font-headline text-3xl font-bold">
              أهلاً بك في <br/> <span className="text-primary">مركز د. أحمد قايد سالم</span>
            </h1>
            <p className="text-base text-muted-foreground">
              أدخل بياناتك للوصول إلى حسابك
            </p>
          </div>
          <Card>
            <CardHeader>
                <CardTitle>تسجيل دخول الموظفين</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4" onSubmit={handleLogin}>
                    <div className="grid gap-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="example@clinic.com"
                        required
                        dir="ltr"
                        className="text-left"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </div>
                    <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">كلمة المرور</Label>
                        <Link
                        href="/forgot-password"
                        className="mr-auto inline-block text-sm underline"
                        >
                        نسيت كلمة المرور؟
                        </Link>
                    </div>
                    <Input 
                        id="password" 
                        type="password" 
                        required 
                        dir="ltr"
                        className="text-left"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full text-lg" size="lg">
                        تسجيل الدخول
                    </Button>
                </form>
            </CardContent>
          </Card>
           <div className="relative my-4">
                <Separator />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-background text-sm text-muted-foreground">
                    أو
                </div>
            </div>
             <div className="text-center p-6 border rounded-lg bg-card">
                 <h3 className="text-lg font-semibold mb-2">هل أنت مريض؟</h3>
                 <p className="text-base text-muted-foreground mb-4">
                    قم بحجز موعدك مباشرة من هنا بكل سهولة.
                </p>
                <Button asChild variant="secondary" className="w-full text-lg" size="lg">
                   <Link href="/book">حجز موعد جديد</Link>
                </Button>
            </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1080x1920.png"
          alt="Image"
          width="1920"
          height="1080"
          data-ai-hint="clinic interior"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
