'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
        setEditedTitle(data.title);
        setEditedContent(data.content);
      } else if (response.status === 404) {
        router.push('/dashboard/documents');
      }
    } catch (error) {
      console.error('Failed to fetch document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedTitle.trim() || !editedContent.trim()) {
      alert('Title and content cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTitle, content: editedContent }),
      });

      if (response.ok) {
        const updatedDoc = await response.json();
        setDocument(updatedDoc);
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update document');
      }
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Document not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-4xl font-bold text-gray-900 outline-none border-b-2 border-indigo-500 w-full"
          />
        ) : (
          <h1 className="text-4xl font-bold text-gray-900">{document.title}</h1>
        )}
        <p className="text-gray-500 mt-2">
          By {document.owner.name} • Updated{' '}
          {new Date(document.updatedAt).toLocaleDateString()}
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
                setEditedTitle(document.title);
                setEditedContent(document.content);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="whitespace-pre-wrap text-gray-700">{document.content}</p>
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

      {document.collaborators.length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaborators</h3>
          <div className="space-y-2">
            {document.collaborators.map((collab: any) => (
              <div
                key={collab.id}
                className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                  {collab.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{collab.user.name}</p>
                  <p className="text-xs text-gray-500">{collab.user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
