import { useEffect, useState } from 'react';

// Define the shape of the props
interface UseInvoicesProps {
  vendorId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  sortType?: 'date' | 'min' | 'max';
  invoiceNumber?: string;
}

const useInvoices = ({
  vendorId,
  customerId,
  startDate,
  endDate,
  page = undefined,
  sortType,
  invoiceNumber,
}: UseInvoicesProps) => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<any>(null); 
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const API_URL = new URL(`${process.env.NEXT_PUBLIC_API_URL}/invoices`);
    const params = API_URL.searchParams;
    if (customerId) params.append('customerId', customerId);
    if (vendorId) params.append('vendorId', vendorId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (page) params.append('page', page.toString());
    if (sortType && sortType !== 'date') params.append('sortType', sortType);
    if (invoiceNumber) params.append('invoiceNumber', invoiceNumber);
    async function fetchInvoices() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(API_URL.toString());
        if (!res.ok) {
          throw new Error(`Failed to fetch invoices: ${res.statusText}`);
        }
        const fetchedData = await res.json();
        setData(fetchedData.data || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    void fetchInvoices();
  }, [customerId, vendorId, page, sortType, endDate, startDate, invoiceNumber]);

  return { data, loading, error };
};

export default useInvoices;