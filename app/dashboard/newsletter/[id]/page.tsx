'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Delivery {
  id: string;
  status: string;
  error: string | null;
  sentAt: string | null;
  subscriber: { id: string; email: string; name: string | null };
}

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  status: string;
  sentAt: string | null;
  author: { id: string; name: string };
  deliveries: Delivery[];
  stats: { total: number; sent: number; failed: number; pending: number };
}

export default function NewsletterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ subject: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchNewsletter = async () => {
    try {
      const response = await fetch(`/api/newsletter/${id}`);
      if (response.ok) {
        const data: Newsletter = await response.json();
        setNewsletter(data);
        setForm({ subject: data.subject, content: data.content });
      } else if (response.status === 401) {
        router.push('/dashboard/newsletter');
      } else if (response.status === 404) {
        router.push('/dashboard/newsletter');
      }
    } catch (error) {
      console.error('Failed to load newsletter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    if (!form.subject.trim() || !form.content.trim()) {
      alert('Subject and content are required');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`/api/newsletter/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save newsletter:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (
      !confirm(
        'Send this newsletter to all active subscribers? This cannot be undone.'
      )
    ) {
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch(`/api/newsletter/${id}/send`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Newsletter sent. ${data.sent} delivered, ${data.failed} failed.`);
        await fetchNewsletter();
      } else {
        alert(data.error || 'Failed to send');
      }
    } catch (error) {
      console.error('Failed to send newsletter:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this newsletter permanently?')) {
      return;
    }
    try {
      const response = await fetch(`/api/newsletter/${id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/dashboard/newsletter');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Failed to delete newsletter:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!newsletter) {
    return null;
  }

  const isSent = newsletter.status === 'SENT';

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/dashboard/newsletter"
          className="text-indigo-600 hover:text-indigo-700 text-sm"
        >
          ← Back to newsletters
        </Link>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isSent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {newsletter.status}
        </span>
      </div>

      {isSent ? (
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {newsletter.subject}
          </h1>
          <p className="text-gray-600 whitespace-pre-wrap">{newsletter.content}</p>
          {newsletter.sentAt && (
            <p className="text-xs text-gray-400 mt-6">
              Sent {new Date(newsletter.sentAt).toLocaleString()}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={14}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="mt-6 flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send to Subscribers'}
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition ml-auto"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {newsletter.stats.total > 0 && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {newsletter.stats.sent}
              </div>
              <div className="text-xs text-gray-500">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {newsletter.stats.failed}
              </div>
              <div className="text-xs text-gray-500">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {newsletter.stats.total}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {newsletter.deliveries.map((d) => (
              <div
                key={d.id}
                className="flex justify-between items-center py-2 text-sm"
              >
                <span className="text-gray-700">
                  {d.subscriber.name
                    ? `${d.subscriber.name} (${d.subscriber.email})`
                    : d.subscriber.email}
                </span>
                <span
                  className={
                    d.status === 'SENT'
                      ? 'text-green-600'
                      : d.status === 'FAILED'
                      ? 'text-red-600'
                      : 'text-gray-400'
                  }
                  title={d.error || undefined}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
