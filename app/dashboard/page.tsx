'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    conversations: 0,
    wikiPages: 0,
    documents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [conversationsRes, wikiRes, documentsRes] = await Promise.all([
          fetch('/api/conversations'),
          fetch('/api/wiki'),
          fetch('/api/documents'),
        ]);

        if (conversationsRes.ok && wikiRes.ok && documentsRes.ok) {
          const conversations = await conversationsRes.json();
          const wiki = await wikiRes.json();
          const documents = await documentsRes.json();

          setStats({
            conversations: conversations.length,
            wikiPages: wiki.length,
            documents: documents.length,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">
            Active Conversations
          </h3>
          <p className="text-3xl font-bold text-indigo-600">
            {stats.conversations}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Direct and group chats
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">
            Wiki Pages
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.wikiPages}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Knowledge base articles
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">
            Documents
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.documents}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Collaborative documents
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Critical Business Communication Platform
        </h2>
        <p className="text-gray-600 mb-4">
          This platform brings together students and instructors for seamless
          communication and collaboration. Use the navigation menu to:
        </p>
        <ul className="space-y-2 text-gray-600">
          <li>💬 <strong>Messages:</strong> Chat with other students and instructors in real-time</li>
          <li>📚 <strong>Wiki:</strong> Create and share knowledge base articles</li>
          <li>✍️ <strong>Documents:</strong> Collaborate on writing assignments and projects</li>
          <li>👤 <strong>Profile:</strong> Manage your account and preferences</li>
        </ul>
      </div>
    </div>
  );
}
