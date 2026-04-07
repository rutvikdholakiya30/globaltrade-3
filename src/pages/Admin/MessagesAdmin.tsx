import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Trash2, Calendar, User, MessageSquare, Search, X, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { ContactMessage } from '@/types';

export function MessagesAdmin() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (data) setMessages(data);
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (!error) {
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) return;
    setSendingReply(true);
    try {
      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedMessage.email,
          subject: selectedMessage.subject || 'Your Inquiry',
          message: replyMessage,
        }),
      });
      if (response.ok) {
        setReplySuccess(true);
        setReplyMessage('');
        setTimeout(() => setReplySuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-600">Manage incoming messages from potential partners.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Message List */}
        <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            ))
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Mail className="h-12 w-12 text-gray-100 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No messages found.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={cn(
                  "w-full text-left p-6 rounded-2xl border transition-all group",
                  selectedMessage?.id === msg.id 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                    : "bg-white border-gray-100 hover:border-blue-200 shadow-sm"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className={cn("font-bold truncate", selectedMessage?.id === msg.id ? "text-white" : "text-gray-900")}>
                    {msg.name}
                  </p>
                  <span className={cn("text-[10px] font-medium", selectedMessage?.id === msg.id ? "text-blue-100" : "text-gray-400")}>
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className={cn("text-xs line-clamp-1", selectedMessage?.id === msg.id ? "text-blue-50" : "text-gray-500")}>
                  {msg.subject || 'No Subject'}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden h-full flex flex-col"
              >
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold">
                      {selectedMessage.name[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedMessage.name}</h2>
                      <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-8 flex-grow space-y-8 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Received on {new Date(selectedMessage.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Sender: {selectedMessage.name}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</h3>
                    <p className="text-lg font-bold text-gray-900">{selectedMessage.subject || 'No Subject'}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message</h3>
                    <div className="bg-gray-50 p-6 rounded-3xl text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-gray-50 bg-gray-50/50 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Send a Reply</h3>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={4}
                      className="w-full bg-white border border-gray-200 px-6 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-gray-900"
                      placeholder="Type your response here..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleReply}
                      disabled={sendingReply || !replyMessage.trim()}
                      className={cn(
                        "flex-grow py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                        replySuccess 
                          ? "bg-emerald-500 text-white" 
                          : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
                      )}
                    >
                      {sendingReply ? (
                        'Sending...'
                      ) : replySuccess ? (
                        <><CheckCircle2 className="h-5 w-5" /> Reply Sent!</>
                      ) : (
                        <><Send className="h-5 w-5" /> Send Reply via SMTP</>
                      )}
                    </button>
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                      className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
                      title="Open in Mail Client"
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[500px] bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center">
                <Mail className="h-16 w-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Select a message to read</h3>
                <p className="text-gray-400 mt-2">Choose an inquiry from the list to view full details and reply.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
