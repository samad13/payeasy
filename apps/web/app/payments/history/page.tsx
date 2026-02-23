'use client'

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Payment } from '../../../types/payment';
import { getUserPayments } from '../../../services/paymentService';
import { PaymentTable } from '../../../components/payments/PaymentTable';
import { PaymentFilters } from '../../../components/payments/PaymentFilters';
import { ReceiptModal } from '../../../components/payments/ReceiptModal';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [selectedListing, setSelectedListing] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal state
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        // Using a mock user ID for demonstration
        const data = await getUserPayments('mock-user-id');
        setPayments(data);
      } catch (err) {
        setError('Failed to load payment history. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Extract unique listings for the filter dropdown
  const uniqueListings = useMemo(() => {
    return Array.from(new Set(payments.map(p => p.listing_name))).sort();
  }, [payments]);

  // Apply filters
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      // Filter by listing
      if (selectedListing && payment.listing_name !== selectedListing) {
        return false;
      }

      const paymentDate = new Date(payment.created_at);
      
      // Filter by start date
      if (startDate) {
        const start = new Date(startDate);
        // Reset time to start of day for accurate comparison
        start.setHours(0, 0, 0, 0);
        if (paymentDate < start) return false;
      }

      // Filter by end date
      if (endDate) {
        const end = new Date(endDate);
        // Set time to end of day
        end.setHours(23, 59, 59, 999);
        if (paymentDate > end) return false;
      }

      return true;
    });
  }, [payments, selectedListing, startDate, endDate]);

  const handleClearFilters = () => {
    setSelectedListing('');
    setStartDate('');
    setEndDate('');
  };

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8 flex items-start gap-4">
          <Link 
            href="/browse"
            className="flex-none flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-gray-600 hover:text-gray-900 mt-1"
            aria-label="Back to Browse"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
            <p className="mt-2 text-gray-600">View your past transactions and download receipts.</p>
          </div>
        </div>

        <PaymentFilters
          listings={uniqueListings}
          selectedListing={selectedListing}
          startDate={startDate}
          endDate={endDate}
          onListingChange={setSelectedListing}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClearFilters={handleClearFilters}
        />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : (
            <PaymentTable 
              payments={filteredPayments} 
              isLoading={isLoading} 
              onViewReceipt={handleViewReceipt} 
            />
          )}
        </div>

        <ReceiptModal
          payment={selectedPayment}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
