import { AdminSidebar } from './_components/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-primary/[0.02] dark:bg-primary/[0.03] rounded-full blur-3xl" />
      </div>
      <AdminSidebar />
      <main className="flex-1 ml-64 relative">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
