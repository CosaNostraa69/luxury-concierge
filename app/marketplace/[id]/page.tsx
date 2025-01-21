'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    rating: number;
  };
}

export default function ListingDetail() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactModal, setContactModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${id}`);
        const data = await res.json();
        setListing(data);
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: listing?.user.id,
          content: message,
        }),
      });
      setMessage('');
      setContactModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Listing not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {listing.images.map((image, index) => (
            <div key={index} className="relative aspect-w-16 aspect-h-9">
              <Image
                src={image}
                alt={`${listing.title} - Image ${index + 1}`}
                width={800}
                height={600}
                className="rounded-lg object-cover"
              />
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
            <p className="mt-2 text-2xl text-blue-600">${listing.price.toLocaleString()}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            <p className="mt-2 text-gray-600">{listing.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Details</h2>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-500">Category</dt>
                <dd className="text-sm font-medium text-gray-900">{listing.category}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Listed by</dt>
                <dd className="text-sm font-medium text-gray-900">{listing.user.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Listed on</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {session && (
            <button
              onClick={() => setContactModal(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Contact Seller
            </button>
          )}
        </div>
      </div>

      {contactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Contact Seller</h2>
            <form onSubmit={handleContact}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                rows={4}
                placeholder="Write your message..."
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setContactModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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