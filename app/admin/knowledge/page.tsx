'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Search, FileText, Loader2, Database, BookOpen } from 'lucide-react';

type KBEntry = {
  id: number;
  content: string;
  category: string;
  source: string | null;
  created_at: string;
};

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [tableMissing, setTableMissing] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (search) params.set('search', search);
      if (category) params.set('category', category);

      const res = await fetch(`/api/admin/knowledge?${params}`);
      const data = await res.json();
      if (res.ok) {
        setEntries(data.data ?? []);
        setTotal(data.total ?? 0);
        setTableMissing(false);
      } else if (data?.tableMissing) {
        setEntries([]);
        setTotal(0);
        setTableMissing(true);
      }
    } catch {
      showToast('Failed to load knowledge base', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, [page, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEntries();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category || 'uploaded');

      const res = await fetch('/api/admin/knowledge/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message, 'success');
        fetchEntries();
      } else {
        showToast(data.error ?? 'Upload failed', 'error');
      }
    } catch {
      showToast('Upload error', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleInit = async () => {
    setInitializing(true);
    try {
      const res = await fetch('/api/admin/knowledge/init', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        setTableMissing(false);
        fetchEntries();
      } else if (data.hint) {
        showToast('Open Supabase SQL Editor and run the migration', 'error');
      } else {
        showToast(data.error ?? 'Init failed', 'error');
      }
    } catch {
      showToast('Failed to initialize', 'error');
    } finally {
      setInitializing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry?')) return;
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/knowledge', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showToast('Entry deleted', 'success');
        fetchEntries();
      }
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const categories = [...new Set(entries.map((e) => e.category))];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#2c241f]">Knowledge Base</h1>
          <p className="text-xs text-[#6f5b4e] mt-0.5">
            {total} entries &middot; Powers AI responses via RAG
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#92400E]" />
          <span className="text-xs font-medium text-[#6f5b4e]">
            {total} chunks
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a8a7d]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search entries..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#e5e0db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#92400E]/20"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#f6f5f1] text-[#6f5b4e] rounded-md text-xs font-semibold hover:bg-[#e5e0db]"
              >
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#92400E]" />
            </div>
          ) : entries.length === 0 && !tableMissing ? (
            <div className="text-center py-12 text-[#6f5b4e]">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No knowledge base entries yet</p>
              <p className="text-xs mt-1">Upload a file above to seed the AI knowledge base</p>
            </div>
          ) : tableMissing ? (
            <div className="text-center py-12 text-[#6f5b4e]">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-[#92400E]">Database table not found</p>
              <p className="text-xs mt-1 mb-4">The <code className="bg-[#f6f5f1] px-1 rounded">knowledge_base</code> table needs to be created</p>
              <button
                onClick={handleInit}
                disabled={initializing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#92400E] text-white rounded-md text-xs font-semibold hover:bg-[#a04e14] disabled:opacity-50"
              >
                {initializing ? 'Setting up...' : 'Setup Knowledge Base Table'}
              </button>
              <p className="text-xs mt-3 text-[#9a8a7d]">
                Or run the SQL in <code className="bg-[#f6f5f1] px-1 rounded">supabase/migrations/02_add_knowledge_base.sql</code> via Supabase SQL Editor
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-lg border border-[#e5e0db] shadow-sm"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#f6f5f1] text-[#6f5b4e] uppercase">
                            {entry.category}
                          </span>
                          {entry.source && (
                            <span className="text-[10px] text-[#9a8a7d] truncate">
                              {entry.source}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm text-[#2c241f] leading-relaxed ${
                          expandedId !== entry.id ? 'line-clamp-3' : ''
                        }`}>
                          {entry.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                          className="p-1.5 text-[#9a8a7d] hover:text-[#2c241f] rounded"
                          title={expandedId === entry.id ? 'Collapse' : 'Expand'}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          className="p-1.5 text-[#9a8a7d] hover:text-red-600 rounded disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === entry.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {total > 50 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs bg-white border border-[#e5e0db] rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-[#6f5b4e]">
                Page {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 50 >= total}
                className="px-3 py-1.5 text-xs bg-white border border-[#e5e0db] rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#2c241f] mb-1">Upload File</h3>
            <p className="text-xs text-[#6f5b4e] mb-4">
              Upload .txt, .pdf, or .docx to train the AI
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#6f5b4e] block mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. recovery_guide, policy"
                  className="w-full px-3 py-2 text-sm border border-[#e5e0db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#92400E]/20"
                />
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-md text-sm font-semibold cursor-pointer transition-all ${
                  uploading
                    ? 'bg-[#92400E]/50 text-white'
                    : 'bg-[#92400E] text-white hover:bg-[#a04e14]'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload & Train
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e0db] shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#2c241f] mb-2">How It Works</h3>
            <ul className="space-y-2 text-xs text-[#6f5b4e]">
              <li className="flex gap-2">
                <span className="text-[#92400E] font-bold">1.</span>
                Upload a file with recovery information
              </li>
              <li className="flex gap-2">
                <span className="text-[#92400E] font-bold">2.</span>
                Text is extracted and split into chunks
              </li>
              <li className="flex gap-2">
                <span className="text-[#92400E] font-bold">3.</span>
                Each chunk gets an AI embedding (vector)
              </li>
              <li className="flex gap-2">
                <span className="text-[#92400E] font-bold">4.</span>
                When users chat, the AI searches these vectors
              </li>
              <li className="flex gap-2">
                <span className="text-[#92400E] font-bold">5.</span>
                The AI answers using ONLY the uploaded content
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
