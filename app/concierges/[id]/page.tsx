'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface Concierge {
  id: string;
  name: string;
  specialties: string[] | null;
  rating: number;
  bio: string;
  image?: string;
  reviews?: Review[];
}

export default function ConciergeProfile() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [concierge, setConcierge] = useState<Concierge | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageModal, setMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConciergeData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/concierges/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch concierge data');
        }
        const data = await res.json();
        setConcierge(data);
      } catch (error) {
        console.error('Error fetching concierge data:', error);
        setError('Error loading concierge profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchConciergeData();
    }
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError('You must be logged in to send messages');
      return;
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: id,
          content: message,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      setMessage('');
      setMessageModal(false);
      // Optionally show success message
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!concierge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Concierge not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center">
            <Image
              src={concierge.image || '/default-avatar.png'}
              alt={concierge.name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900">{concierge.name}</h1>
              <div className="flex items-center mt-2">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-gray-600">{concierge.rating || 0}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {concierge.specialties && concierge.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            {session && session.user?.id !== concierge.id && (
              <button
                onClick={() => setMessageModal(true)}
                className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Contact
              </button>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-gray-600">{concierge.bio || 'No bio available'}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
            <div className="space-y-4">
              {concierge.reviews && concierge.reviews.length > 0 ? (
                concierge.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">
                          {review.user.name}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {messageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Send Message to {concierge.name}</h2>
            <form onSubmit={handleSendMessage}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={4}
                placeholder="Write your message..."
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setMessageModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}