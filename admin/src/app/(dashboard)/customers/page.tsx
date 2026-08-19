export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your customer directory.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-[400px] rounded-xl border border-neutral-200 border-dashed dark:border-neutral-800">
        <p className="text-neutral-500">Customers Directory Placeholder</p>
      </div>
    </div>
  );
}
