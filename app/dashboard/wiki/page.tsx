'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  user: any;
  updatedAt: string;
}

export default function WikiPage() {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageData, setNewPageData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchPages();
  }, [searchQuery]);

  const fetchPages = async () => {
    try {
      const url = new URL('/api/wiki', window.location.origin);
      if (searchQuery) {
        url.searchParams.set('search', searchQuery);
      }
      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (error) {
      console.error('Failed to fetch wiki pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!newPageData.title.trim() || !newPageData.content.trim()) {
      alert('Title and content are required');
      return;
    }

    try {
      const response = await fetch('/api/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPageData),
      });

      if (response.ok) {
        const newPage = await response.json();
        setPages([newPage, ...pages]);
        setShowNewPageModal(false);
        setNewPageData({ title: '', content: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create page');
      }
    } catch (error) {
      console.error('Failed to create wiki page:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Wiki</h1>
        <button
          onClick={() => setShowNewPageModal(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          New Page
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pages..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery ? 'No pages found' : 'No wiki pages yet. Create one to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/dashboard/wiki/${page.slug}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {page.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {page.content}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>By {page.user.name}</span>
                <span>
                  {new Date(page.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New Page Modal */}
      {showNewPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Wiki Page
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newPageData.title}
                  onChange={(e) =>
                    setNewPageData({ ...newPageData, title: e.target.value })
                  }
                  placeholder="Page title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newPageData.content}
                  onChange={(e) =>
                    setNewPageData({
                      ...newPageData,
                      content: e.target.value,
                    })
                  }
                  placeholder="Page content"
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex space-x-2">
              <button
                onClick={handleCreatePage}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewPageModal(false)}
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
