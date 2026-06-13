'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function UnsubscribeInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus('error');
        setMessage('This unsubscribe link is missing its token.');
        return;
      }

      try {
        const response = await fetch(
          `/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(
            data.email
              ? `${data.email} has been unsubscribed.`
              : 'You have been unsubscribed.'
          );
        } else {
          setStatus('error');
          setMessage(data.error || 'Could not process your request.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Could not process your request.');
      }
    };

    run();
  }, [token]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Unsubscribe</h1>
      {status === 'loading' ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div
          className={`rounded-lg p-6 ${
            status === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Suspense fallback={null}>
        <UnsubscribeInner />
      </Suspense>
    </div>
  );
}
