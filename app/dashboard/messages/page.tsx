'use client';

import { useEffect, useState } from 'react';

interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  users: any[];
  messages: any[];
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newConversationModal, setNewConversationModal] = useState(false);
  const [newParticipants, setNewParticipants] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0) {
          setSelectedConversation(data[0].id);
          fetchMessages(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const response = await fetch(
        `/api/conversations/${selectedConversation}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageInput }),
        }
      );

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setMessageInput('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const participantIds = newParticipants
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      if (participantIds.length === 0) return;

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds,
          isGroup: participantIds.length > 1,
        }),
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversations([...conversations, newConversation]);
        setSelectedConversation(newConversation.id);
        setNewConversationModal(false);
        setNewParticipants('');
        fetchMessages(newConversation.id);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
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
    <div className="flex h-full bg-gray-100">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <button
            onClick={() => setNewConversationModal(true)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            New Message
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv.id);
                  fetchMessages(conv.id);
                }}
                className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-indigo-50 transition ${
                  selectedConversation === conv.id ? 'bg-indigo-50' : ''
                }`}
              >
                <p className="font-semibold text-gray-900">{conv.name}</p>
                <p className="text-sm text-gray-500">
                  {conv.messages.length > 0
                    ? conv.messages[0].content.substring(0, 40) + '...'
                    : 'No messages'}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {conversations.find((c) => c.id === selectedConversation)?.name}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start space-x-3"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                    {msg.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {msg.user.name}
                    </p>
                    <p className="text-gray-700 bg-gray-100 px-3 py-2 rounded-lg rounded-tl-none inline-block">
                      {msg.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {newConversationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Start New Conversation
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter user IDs separated by commas to start a conversation.
            </p>
            <input
              type="text"
              value={newParticipants}
              onChange={(e) => setNewParticipants(e.target.value)}
              placeholder="e.g., user1, user2, user3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreateConversation}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create
              </button>
              <button
                onClick={() => setNewConversationModal(false)}
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
