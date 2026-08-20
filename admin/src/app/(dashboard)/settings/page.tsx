export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your store preferences.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-[400px] rounded-xl border border-slate-200 border-dashed dark:border-slate-200">
        <p className="text-slate-500">Settings Configuration Placeholder</p>
      </div>
    </div>
  );
}
