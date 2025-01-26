'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Specialty {
  id: string;
  name: string;
}

interface Concierge {
  id: string;
  name: string;
  specialties: Specialty[] | null; // Mise à jour du type
  rating: number;
  bio: string;
  image?: string;
  reviewCount: number;
}

export default function Concierges() {
  const [concierges, setConcierges] = useState<Concierge[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState('all');

  useEffect(() => {
    const fetchConcierges = async () => {
      try {
        const res = await fetch(`/api/concierges?specialty=${specialty}`);
        const data = await res.json();
        setConcierges(data);
      } catch (error) {
        console.error('Error fetching concierges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConcierges();
  }, [specialty]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find a Concierge</h1>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Specialties</option>
          <option value="jewelry">Jewelry</option>
          <option value="cars">Cars</option>
          <option value="watches">Watches</option>
          <option value="real-estate">Real Estate</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {concierges.map((concierge) => (
            <Link href={`/concierges/${concierge.id}`} key={concierge.id}>
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center mb-4">
                  <Image
                    src={concierge.image || '/default-avatar.png'}
                    alt={concierge.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {concierge.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>★ {concierge.rating || 0}</span>
                      <span className="mx-1">•</span>
                      <span>{concierge.reviewCount || 0} reviews</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {concierge.bio || 'No bio available'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {concierge.specialties && Array.isArray(concierge.specialties) && concierge.specialties.map((specialty) => (
                    <span
                      key={specialty.id} // Utilisation de l'ID unique
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {specialty.name} {/* Utilisation du nom de la spécialité */}
                    </span>
                  ))}
                  {(!concierge.specialties || !Array.isArray(concierge.specialties) || concierge.specialties.length === 0) && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      No specialties listed
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}