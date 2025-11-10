import { useEffect, useState } from "react";

const useVendorInvoiceCounts = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchVendorInvoiceCounts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/top-by-invoice`)
        if(!res.ok) throw new Error("Failed to fetch vendors")
        const fetchedData = await res.json();
        setData(fetchedData)
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    void fetchVendorInvoiceCounts();
  }, []);

  return { data, loading, error };
};

export default useVendorInvoiceCounts;
