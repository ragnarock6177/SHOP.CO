'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormValues } from '@/lib/validations/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      sku: '',
      stock: 0,
      status: 'IN_STOCK',
      category: '',
      tags: [],
      images: [''],
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    console.log('Submitted Product:', data);
    // Submit data to API
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            Discard
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
            <Save className="mr-2 h-4 w-4" />
            Save Product
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-none border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic details about the product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Essential Heavyweight Tee"
                  className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-rose-500">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Detailed description of the product..."
                  className="flex min-h-[120px] w-full rounded-md border border-neutral-200 bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
                  {...form.register('description')}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-rose-500">{form.formState.errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
                  {...form.register('price', { valueAsNumber: true })}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-rose-500">{form.formState.errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare at Price ($)</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
                  {...form.register('compareAtPrice', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="e.g. ARV-TS-001"
                  className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
                  {...form.register('sku')}
                />
                {form.formState.errors.sku && (
                  <p className="text-sm text-rose-500">{form.formState.errors.sku.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
                  {...form.register('stock', { valueAsNumber: true })}
                />
                {form.formState.errors.stock && (
                  <p className="text-sm text-rose-500">{form.formState.errors.stock.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-none border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-9 w-full rounded-md border border-neutral-200 bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
                  {...form.register('status')}
                >
                  <option value="IN_STOCK">In Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. Apparel"
                  className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
                  {...form.register('category')}
                />
                {form.formState.errors.category && (
                  <p className="text-sm text-rose-500">{form.formState.errors.category.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
