import { useEffect, useState } from "react";

const useDashboardOverview = () => {
  const [data, setData] = useState<any>({
    currentMonth: {
      totalSpend: 0,
      totalInvoicesProcessed: 0,
      documentUploads: 0,
      averageInvoiceValue: 0,
    },
    prevMonth: {
      totalSpend: 0,
      totalInvoicesProcessed: 0,
      documentUploads: 0,
      averageInvoiceValue: 0,
    },
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchDashboardOverview() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`);
        if (!res.ok) throw new Error("Failed to fetch vendors");
        const fetchedData = await res.json();
        setData(fetchedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    void fetchDashboardOverview();
  }, []);

  return { data, loading, error };
};

export default useDashboardOverview;
