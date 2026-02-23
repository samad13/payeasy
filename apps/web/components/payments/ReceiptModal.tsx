'use client'

import React from 'react';
import { Payment } from '../../types/payment';
import { formatDate, formatDateTime } from '../../utils/date';
import { getExplorerUrl } from '../../utils/blockchain';
import { generateReceiptPDF } from './ReceiptPDF';
import { X, Download, ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ payment, isOpen, onClose }: ReceiptModalProps) {
  if (!isOpen || !payment) return null;

  const handleDownload = () => {
    generateReceiptPDF(payment);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />;
      case 'failed':
        return <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />;
      case 'pending':
        return <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-2" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            {getStatusIcon(payment.status)}
            <h2 className="text-2xl font-bold text-gray-900">{payment.amount} XLM</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mt-2 capitalize ${getStatusColor(payment.status)}`}>
              {payment.status}
            </span>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Listing</span>
              <span className="font-medium text-gray-900 text-right">{payment.listing_name}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">{formatDateTime(payment.created_at)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Network</span>
              <span className="font-medium text-gray-900 capitalize">{payment.network}</span>
            </div>

            <div className="py-2">
              <span className="text-gray-500 block mb-1">Transaction Hash</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 break-all font-mono flex-1">
                  {payment.transaction_hash}
                </code>
                <a 
                  href={getExplorerUrl(payment.transaction_hash, payment.network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="View on Blockchain"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm active:scale-[0.98]"
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
