'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Document {
  id: string;
  title: string;
  content: string;
  owner: any;
  collaborators: any[];
  updatedAt: string;
  ownerId: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocData, setNewDocData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocData.title.trim() || !newDocData.content.trim()) {
      alert('Title and content are required');
      return;
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDocData),
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments([newDoc, ...documents]);
        setShowNewDocModal(false);
        setNewDocData({ title: '', content: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create document');
      }
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(documents.filter((d) => d.id !== docId));
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
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
        <h1 className="text-4xl font-bold text-gray-900">Documents</h1>
        <button
          onClick={() => setShowNewDocModal(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          New Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No documents yet. Create one to start writing and collaborating!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link href={`/dashboard/documents/${doc.id}`}>
                    <h3 className="text-lg font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                      {doc.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    By {doc.owner.name} • Updated{' '}
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {doc.ownerId === doc.owner.id && (
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {doc.content}
              </p>
              {doc.collaborators.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Collaborators:</span>
                  <div className="flex space-x-1">
                    {doc.collaborators.slice(0, 3).map((collab) => (
                      <span
                        key={collab.id}
                        className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs"
                      >
                        {collab.user.name}
                      </span>
                    ))}
                    {doc.collaborators.length > 3 && (
                      <span className="text-gray-500">
                        +{doc.collaborators.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Document Modal */}
      {showNewDocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Document
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newDocData.title}
                  onChange={(e) =>
                    setNewDocData({ ...newDocData, title: e.target.value })
                  }
                  placeholder="Document title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newDocData.content}
                  onChange={(e) =>
                    setNewDocData({
                      ...newDocData,
                      content: e.target.value,
                    })
                  }
                  placeholder="Document content"
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex space-x-2">
              <button
                onClick={handleCreateDocument}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewDocModal(false)}
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
