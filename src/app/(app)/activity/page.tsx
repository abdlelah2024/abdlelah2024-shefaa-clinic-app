
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ActivityLog from "@/components/dashboard/activity-log";
import { ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActivityPage() {
  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            سجل النشاط
          </h1>
          <p className="text-muted-foreground">
            مراقبة جميع الإجراءات والتغييرات التي تتم في النظام.
          </p>
        </div>
         <Button variant="outline">
            <ListFilter className="ml-2 h-4 w-4" />
            تصفية السجل
          </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>أحدث النشاطات</CardTitle>
            <CardDescription>قائمة بآخر الإجراءات التي تمت من قبل المستخدمين.</CardDescription>
        </CardHeader>
        <CardContent>
            <ActivityLog />
        </CardContent>
      </Card>

    </div>
  );
}
