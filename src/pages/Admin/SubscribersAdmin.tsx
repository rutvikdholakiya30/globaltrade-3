import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Trash2, Copy, Check, Users, Download, Search, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/Admin/ConfirmDialog';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string;
  created_at: string;
}

export function SubscribersAdmin() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);
    const { data } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    setSubscribers(data || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('subscribers').delete().eq('id', id);
    setSubscribers(prev => prev.filter(s => s.id !== id));
    setDeleteId(null);
  }

  async function handleBulkDelete() {
    await supabase.from('subscribers').delete().in('id', selectedIds);
    setSubscribers(prev => prev.filter(s => !selectedIds.includes(s.id)));
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  }

  function copyAllEmails() {
    const emails = filtered.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(s => s.id));
    }
  }

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscribers</h1>
          <p className="text-gray-500 mt-1">Unique emails collected from your inquiry form.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4" />
            {subscribers.length} Total
          </div>
          <button
            onClick={copyAllEmails}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-all"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy All Emails'}
          </button>
        </div>
      </div>

      {/* Search & Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setBulkDeleteOpen(true)}
              className="px-5 py-3 bg-red-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Delete {selectedIds.length} Selected
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 font-medium">Loading subscribers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Mail className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">
              {search ? 'No subscribers match your search.' : 'No subscribers yet. They will appear here after the first inquiry.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="p-4 pl-6 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Email</th>
                <th className="p-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Name</th>
                <th className="p-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Source</th>
                <th className="p-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Date Added</th>
                <th className="p-4 pr-6 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((sub, i) => (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "hover:bg-gray-50 transition-colors group",
                    selectedIds.includes(sub.id) && "bg-blue-50"
                  )}
                >
                  <td className="p-4 pl-6">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      checked={selectedIds.includes(sub.id)}
                      onChange={() => toggleSelect(sub.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-sm">
                        {sub.email[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-900 text-sm lowercase">{sub.email}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-sm text-gray-500 font-medium">{sub.name || '—'}</span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {sub.source?.replace('_', ' ') || 'form'}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm text-gray-400 font-medium">
                      {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => setDeleteId(sub.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Single Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Remove Subscriber?"
        message="This email will be removed from your subscriber list. This action cannot be undone."
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedIds.length} Subscribers?`}
        message="All selected emails will be permanently removed from your subscriber list."
      />
    </div>
  );
}
