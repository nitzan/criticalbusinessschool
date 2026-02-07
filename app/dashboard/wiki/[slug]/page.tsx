'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function WikiDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [page, setPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/wiki/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setPage(data);
        setEditedContent(data.content);
      } else if (response.status === 404) {
        router.push('/dashboard/wiki');
      }
    } catch (error) {
      console.error('Failed to fetch wiki page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) {
      alert('Content cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/wiki/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      });

      if (response.ok) {
        const updatedPage = await response.json();
        setPage(updatedPage);
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update page');
      }
    } catch (error) {
      console.error('Failed to update wiki page:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Page not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{page.title}</h1>
        <p className="text-gray-500">
          By {page.user.name} • Updated{' '}
          {new Date(page.updatedAt).toLocaleDateString()}
        </p>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={20}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedContent(page.content);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-6 prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{page.content}</p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Edit
            </button>
          </div>
        </>
      )}

      <div className="mt-8 pt-8 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Versions</h3>
        {page.versions && page.versions.length > 0 ? (
          <div className="space-y-2">
            {page.versions.map((version: any, index: number) => (
              <div
                key={version.id}
                className="px-4 py-2 bg-gray-50 rounded border border-gray-200"
              >
                <p className="text-sm text-gray-600">
                  Version {page.versions.length - index} •{' '}
                  {new Date(version.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No version history</p>
        )}
      </div>
    </div>
  );
}
