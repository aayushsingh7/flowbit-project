'use client';

import React from 'react';
import {
  Building,
  User,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// --- Type Definitions ---

/**
 * Defines the shape of the nested objects within the Invoice.
 */
type InvoicePayment = {
  dueDate: string | null;
};

type InvoiceParty = {
  name: string;
};

/**
 * Defines the main Invoice data structure based on your example.
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string; // ISO String
  invoiceTotal: string; // String number
  isCreditNote: boolean;
  vendor: InvoiceParty;
  customer: InvoiceParty;
  payment: InvoicePayment;
}

/**
 * Props for the InvoiceBox component.
 */
interface InvoiceBoxProps {
  invoice: Invoice;
}

// --- Helper Functions ---

/**
 * Formats an ISO date string into a more readable format.
 * @param dateString The ISO date string.
 * @returns A formatted date (e.g., "Nov 04, 2025").
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};


/**
 * A professional card component to display invoice summary details.
 */
const InvoiceBox: React.FC<InvoiceBoxProps> = ({ invoice }) => {
  const {
    invoiceNumber,
    invoiceDate,
    invoiceTotal,
    isCreditNote,
    vendor,
    customer,
    payment,
  } = invoice;

  const isCredit = isCreditNote;
  const totalColor = isCredit ? 'text-green-600' : 'text-red-700';
  const badgeColor = isCredit
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';
  const BadgeIcon = isCredit ? CheckCircle : AlertCircle;

  return (
    <div className="w-full mb-[10px] rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between border-b-[2px] border-gray-200 pb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Invoice</p>
          <p className="text-xl font-bold text-gray-800">{invoiceNumber}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${badgeColor}`}
        >
          <BadgeIcon className="h-3.5 w-3.5" />
          {isCredit ? 'Credit Note' : 'Invoice'}
        </span>
      </div>

      <div className="my-5 space-y-4">
        <div className="flex items-start gap-3">
          <Building className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
          <div>
            <p className="text-xs font-medium text-gray-500">From (Vendor)</p>
            <p className="text-base font-semibold text-gray-900">
              {vendor.name}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <User className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
          <div>
            <p className="text-xs font-medium text-gray-500">To (Customer)</p>
            <p className="text-base font-semibold text-gray-900">
              {customer.name}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs font-medium text-gray-500">Issued</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(invoiceDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs font-medium text-gray-500">Due Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {payment.dueDate ? formatDate(payment.dueDate) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className={`text-3xl font-bold ${totalColor}`}>
              $ {Math.abs(Number(invoiceTotal)).toLocaleString(undefined,{minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBox