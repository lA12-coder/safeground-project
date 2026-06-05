import { AdminSidebar } from './_components/AdminSidebar'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f6f5f1]">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 relative">
        <div className="sticky top-0 z-30 lg:hidden border-b bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="font-serif text-lg font-bold text-[#8a3d08]">
              SafeGround Admin
            </Link>
            <div className="flex items-center gap-3 text-sm font-semibold text-[#6f5b4e]">
              <Link href="/admin/providers" className="hover:text-[#8a3d08]">Providers</Link>
              <Link href="/admin/moderation" className="hover:text-[#8a3d08]">Moderation</Link>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 sm:px-4 lg:px-6 lg:py-4 mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
