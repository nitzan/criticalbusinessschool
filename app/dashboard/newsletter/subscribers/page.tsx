'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: string;
  createdAt: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribedCount, setSubscribedCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const url = new URL(
          '/api/newsletter/subscribers',
          window.location.origin
        );
        if (search) url.searchParams.set('search', search);
        if (statusFilter) url.searchParams.set('status', statusFilter);

        const response = await fetch(url.toString());
        if (response.status === 401) {
          setForbidden(true);
          return;
        }
        if (response.ok) {
          const data = await response.json();
          setSubscribers(data.subscribers);
          setSubscribedCount(data.subscribedCount);
        }
      } catch (error) {
        console.error('Failed to fetch subscribers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscribers();
  }, [search, statusFilter]);

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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Subscribers</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-800">
          Only instructors can view subscribers.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-4xl font-bold text-gray-900">Subscribers</h1>
        <Link
          href="/dashboard/newsletter"
          className="text-indigo-600 hover:text-indigo-700 text-sm"
        >
          ← Back to newsletters
        </Link>
      </div>
      <p className="text-gray-500 mb-8">
        {subscribedCount} active subscriber{subscribedCount === 1 ? '' : 's'}
      </p>

      <div className="flex items-center space-x-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">All</option>
          <option value="SUBSCRIBED">Subscribed</option>
          <option value="UNSUBSCRIBED">Unsubscribed</option>
        </select>
      </div>

      {subscribers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No subscribers found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-3 text-gray-900">{s.email}</td>
                  <td className="px-6 py-3 text-gray-600">{s.name || '—'}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        s.status === 'SUBSCRIBED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
