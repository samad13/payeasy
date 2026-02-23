'use client'

import React from 'react';
import { Payment } from '../../types/payment';
import { formatDate } from '../../utils/date';
import { getExplorerUrl } from '../../utils/blockchain';
import { FileText, ExternalLink, ArrowRight, Download } from 'lucide-react';
import { generateReceiptPDF } from './ReceiptPDF';

interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
  onViewReceipt: (payment: Payment) => void;
}

const StatusBadge = ({ status }: { status: Payment['status'] }) => {
  const styles = {
    completed: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export function PaymentTable({ payments, isLoading, onViewReceipt }: PaymentTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow animate-pulse">
        <div className="h-12 bg-gray-200 rounded-t-lg mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 mx-4 mb-2 rounded"></div>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-100">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <FileText size={48} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No payments found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Listing Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount (XLM)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction Hash
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Download
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.listing_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {payment.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(payment.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  <a 
                    href={getExplorerUrl(payment.transaction_hash, payment.network)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-blue-600 transition-colors group"
                    title="View on Stellar Expert"
                  >
                    {payment.transaction_hash.slice(0, 8)}...{payment.transaction_hash.slice(-8)}
                    <ExternalLink size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      generateReceiptPDF(payment);
                    }}
                    className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                    title="Download Receipt PDF"
                  >
                    <Download size={18} />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onViewReceipt(payment)}
                    className="text-blue-600 hover:text-blue-900 flex items-center justify-end gap-1 ml-auto"
                  >
                    Receipt
                    <ArrowRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
