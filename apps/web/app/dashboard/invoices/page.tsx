'use client';

import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { Search, Filter, X } from 'lucide-react';
import useInvoices from '@/hooks/useInvoices';
import Loader from '@/components/Loader';
import InvoiceBox from '@/components/InvoiceBox';

// --- Type Definitions ---
interface FilterState {
  invoiceNumber?: string;
  vendorId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  sortType?: 'date' | 'min' | 'max';
}

// --- Initial State ---
const INITIAL_FILTER_STATE: FilterState = {
  invoiceNumber: '',
  vendorId: '',
  customerId: '',
  startDate: '',
  endDate: '',
  sortType: 'date',
};

// --- Component ---
const InvoicePage: React.FC = () => {
  // --- NEW LOGIC: Staged vs. Applied Filters ---
  // 'stagedFilters' are for the inputs in the dropdown
  const [stagedFilters, setStagedFilters] =
    useState<FilterState>(INITIAL_FILTER_STATE);
  
  // 'appliedFilters' are what's sent to the hook
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(INITIAL_FILTER_STATE);

  const [mainSearchTerm, setMainSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // The hook now *only* listens to 'appliedFilters'
  const {
    data: invoices,
    loading: isInvoicesLoading,
    error: invoicesError,
  } = useInvoices(appliedFilters);

  /**
   * Handles the main search bar "Enter" key press
   */
  const handleMainSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 1. Create the new filters
      const newFilters = {
        ...INITIAL_FILTER_STATE,
        invoiceNumber: mainSearchTerm,
      };
      // 2. Apply them (triggers hook)
      setAppliedFilters(newFilters);
      // 3. Sync the staged filters so the panel is correct if opened
      setStagedFilters(newFilters);
      // 4. Hide panel
      setShowFilters(false);
    }
  };

  /**
   * Handles changes to any input field in the filter panel
   * This ONLY updates the 'stagedFilters', it does not trigger a search.
   */
  const handleFilterInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setStagedFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles the "Apply Filters" button click
   * This copies the staged filters to the applied filters, triggering the hook.
   */
  const handleApplyFilters = () => {
    // 1. Apply the staged filters
    const newFilters = { ...stagedFilters, invoiceNumber: '' };
    setAppliedFilters(newFilters);
    // 2. Clear the main search bar
    setMainSearchTerm('');
    // 3. Hide panel
    setShowFilters(false);
  };

  /**
   * Clears all filters and re-runs the search
   */
  const handleClearFilters = () => {
    setAppliedFilters(INITIAL_FILTER_STATE);
    setStagedFilters(INITIAL_FILTER_STATE);
    setMainSearchTerm('');
    setShowFilters(false);
  };

  /**
   * Helper to render the results
   */
  const renderResults = () => {
    if (isInvoicesLoading) {
      return <Loader className="h-[300px] w-full" />;
    }
    if (invoicesError) {
      return (
        <div className="flex justify-center p-8 text-red-600">
          {/* @ts-ignore */}
          <p>Error: {invoicesError?.message || 'Failed to fetch invoices.'}</p>
        </div>
      );
    }
    if (!invoices || invoices.length === 0) {
      return (
        <div className="flex justify-center p-8 text-gray-500">
          <p>No invoices found.</p>
        </div>
      );
    }
    return invoices.map((invoice: any) => {
      return <InvoiceBox invoice={invoice} key={invoice.invoiceNumber + Math.random() * 1000000} />;
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center px-4 font-sans">
      <div className="w-full">
        {/* ... (Main search input and Filter button) ... */}
        {/* (No changes to this part of the JSX) */}
        <div className="relative flex w-full gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by Invoice Number and press Enter..."
              value={mainSearchTerm}
              onChange={(e) => setMainSearchTerm(e.target.value)}
              onKeyDown={handleMainSearchKeyDown}
              className="w-full rounded-lg border border-gray-300 p-3 pl-10 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 font-medium shadow-sm transition-all duration-200 ${
              showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* --- Absolute Positioned Filter Panel --- */}
        {/* The 'value' prop for all inputs is now 'stagedFilters' */}
        {showFilters && (
          <div className="absolute z-10 mt-2 w-full max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl animate-fade-in-down">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {/* Vendor ID */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-600">
                  Vendor ID
                </label>
                <input
                  type="text"
                  name="vendorId"
                  placeholder="e.g., V-1001"
                  value={stagedFilters.vendorId} // Use stagedFilters
                  onChange={handleFilterInputChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Customer ID */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-600">
                  Customer ID
                </label>
                <input
                  type="text"
                  name="customerId"
                  placeholder="e.g., C-2002"
                  value={stagedFilters.customerId} // Use stagedFilters
                  onChange={handleFilterInputChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Start Date */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-600">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={stagedFilters.startDate} // Use stagedFilters
                  onChange={handleFilterInputChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-600">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={stagedFilters.endDate} // Use stagedFilters
                  onChange={handleFilterInputChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Sort By */}
              <div className="flex flex-col sm:col-span-2">
                <label className="mb-1.5 text-sm font-medium text-gray-600">
                  Sort By
                </label>
                <select
                  name="sortType"
                  value={stagedFilters.sortType} // Use stagedFilters
                  onChange={handleFilterInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="date">Date (Default)</option>
                  <option value="max">Total (High to Low)</option>
                  <option value="min">Total (Low to High)</option>
                </select>
              </div>
            </div>

            {/* Filter Panel Actions */}
            {/* These buttons are now wired up to the correct handlers */}
            <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <X className="mr-2 h-4 w-4" />
                Clear All
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ... (style tag) ... */}
      <style jsx global>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.2s ease-out;
        }
      `}</style>

      {/* --- Results Section (now uses renderResults) --- */}
      <section className="w-full mt-[20px]">{renderResults()}</section>
    </div>
  );
};

export default InvoicePage;