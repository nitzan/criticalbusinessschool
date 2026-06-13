'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  status: string;
  sentAt: string | null;
  updatedAt: string;
  author: { id: string; name: string };
  _count: { deliveries: number };
}

export default function NewsletterPage() {
  const router = useRouter();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newData, setNewData] = useState({ subject: '', content: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [listRes, subsRes] = await Promise.all([
          fetch('/api/newsletter'),
          fetch('/api/newsletter/subscribers?status=SUBSCRIBED'),
        ]);

        if (listRes.status === 401) {
          setForbidden(true);
          return;
        }

        if (listRes.ok) {
          setNewsletters(await listRes.json());
        }
        if (subsRes.ok) {
          const data = await subsRes.json();
          setSubscriberCount(data.subscribedCount);
        }
      } catch (error) {
        console.error('Failed to load newsletters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handleCreate = async () => {
    if (!newData.subject.trim() || !newData.content.trim()) {
      alert('Subject and content are required');
      return;
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        const created = await response.json();
        setShowNewModal(false);
        setNewData({ subject: '', content: '' });
        router.push(`/dashboard/newsletter/${created.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create newsletter');
      }
    } catch (error) {
      console.error('Failed to create newsletter:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Newsletter</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-800">
          Only instructors can manage newsletters.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Newsletter</h1>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/newsletter/subscribers"
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Subscribers
            {subscriberCount !== null && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                {subscriberCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            New Newsletter
          </button>
        </div>
      </div>

      {newsletters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No newsletters yet. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {newsletters.map((n) => (
            <Link
              key={n.id}
              href={`/dashboard/newsletter/${n.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {n.subject}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        n.status === 'SENT'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {n.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{n.content}</p>
                </div>
                <div className="text-right text-xs text-gray-500 ml-4 shrink-0">
                  {n.status === 'SENT' && n.sentAt ? (
                    <span>
                      Sent {new Date(n.sentAt).toLocaleDateString()} ·{' '}
                      {n._count.deliveries} recipients
                    </span>
                  ) : (
                    <span>
                      Updated {new Date(n.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Newsletter
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newData.subject}
                  onChange={(e) =>
                    setNewData({ ...newData, subject: e.target.value })
                  }
                  placeholder="Newsletter subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newData.content}
                  onChange={(e) =>
                    setNewData({ ...newData, content: e.target.value })
                  }
                  placeholder="Write your newsletter..."
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex space-x-2">
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create Draft
              </button>
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
