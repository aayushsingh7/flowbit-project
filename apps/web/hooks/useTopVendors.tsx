import { useEffect, useState } from "react";

const useTopVendors = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchTopVendors() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/top10`)
        if(!res.ok) throw new Error("Failed to fetch vendors")
        const fetchedData = await res.json();
        setData(fetchedData)
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    void fetchTopVendors();
  }, []);

  return { data, loading, error };
};

export default useTopVendors;
