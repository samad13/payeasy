import { jsPDF } from "jspdf";
import { Payment } from "../../types/payment";
import { formatDate } from "../../utils/date";

export const generateReceiptPDF = (payment: Payment) => {
  const doc = new jsPDF();
  
  // Add Payeasy Logo (Placeholder)
  doc.setFontSize(22);
  doc.setTextColor(0, 102, 204); // Primary Blue
  doc.text("Payeasy", 20, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Payment Receipt", 20, 30);
  
  // Draw a line
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Receipt Details
  doc.setFontSize(12);
  
  const startY = 50;
  const lineHeight = 10;
  
  doc.text(`Receipt ID: ${payment.id}`, 20, startY);
  doc.text(`Date: ${formatDate(payment.created_at)}`, 20, startY + lineHeight);
  doc.text(`Status: ${payment.status.toUpperCase()}`, 20, startY + lineHeight * 2);
  
  doc.text(`Listing: ${payment.listing_name}`, 20, startY + lineHeight * 4);
  doc.text(`Amount: ${payment.amount} XLM`, 20, startY + lineHeight * 5);
  doc.text(`Network: ${payment.network}`, 20, startY + lineHeight * 6);
  
  // Transaction Hash (Wrapped if too long)
  doc.text("Transaction Hash:", 20, startY + lineHeight * 8);
  doc.setFontSize(10);
  doc.text(payment.transaction_hash, 20, startY + lineHeight * 9);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Thank you for using Payeasy.", 20, 280);
  
  // Save
  doc.save(`receipt-${payment.transaction_hash}.pdf`);
};

interface ReceiptPDFProps {
  payment: Payment;
  className?: string;
}

export default function ReceiptPDFButton({ payment, className }: ReceiptPDFProps) {
  return (
    <button
      onClick={() => generateReceiptPDF(payment)}
      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
    >
      Download Receipt PDF
    </button>
  );
}
