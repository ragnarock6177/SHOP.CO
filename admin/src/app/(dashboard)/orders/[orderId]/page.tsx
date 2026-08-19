import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Order {params.orderId}</h1>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-[400px] rounded-xl border border-neutral-200 border-dashed dark:border-neutral-800">
        <p className="text-neutral-500">Order Timeline Placeholder</p>
      </div>
    </div>
  );
}
