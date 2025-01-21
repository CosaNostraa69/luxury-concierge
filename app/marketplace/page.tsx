'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  user: {
    name: string;
    rating: number;
  };
}

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`/api/listings?filter=${filter}`);
        const data = await res.json();
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Luxury Marketplace</h1>
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="jewelry">Jewelry</option>
            <option value="cars">Cars</option>
            <option value="watches">Watches</option>
            <option value="real-estate">Real Estate</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link href={`/marketplace/${listing.id}`} key={listing.id}>
              <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                {listing.images[0] && (
                  <div className="aspect-w-16 aspect-h-9">
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      width={400}
                      height={300}
                      className="object-cover w-full h-48"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {listing.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {listing.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-bold">
                      ${listing.price.toLocaleString()}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{listing.user.name}</span>
                      <span className="mx-1">•</span>
                      <span>★ {listing.user.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 