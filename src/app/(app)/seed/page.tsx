
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { seedDatabase } from '@/lib/services';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SeedStatus = 'idle' | 'loading' | 'success' | 'error';

export default function SeedPage() {
  const [status, setStatus] = useState<SeedStatus>('idle');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSeed = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const result = await seedDatabase();
      setStatus('success');
      setMessage(result);
      toast({
        title: 'نجاح',
        description: 'تم زرع البيانات بنجاح في قاعدة البيانات.',
        variant: 'default',
      });
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء زرع البيانات.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center p-4 md:p-8" dir="rtl">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">زرع بيانات قاعدة البيانات</CardTitle>
          <CardDescription>
            انقر على الزر أدناه لتعبئة قاعدة بيانات Firestore بالبيانات الأولية (المستخدمين، الأطباء، المرضى، إلخ).
            <br />
            <strong className="text-destructive">تحذير:</strong> سيؤدي هذا إلى الكتابة فوق أي بيانات موجودة بنفس المعرفات.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button onClick={handleSeed} disabled={status === 'loading'} className="w-full max-w-xs">
            {status === 'loading' && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {status === 'loading' ? 'جاري الزرع...' : 'بدء زرع البيانات'}
          </Button>

          {status === 'success' && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-green-100 p-3 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-red-100 p-3 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
