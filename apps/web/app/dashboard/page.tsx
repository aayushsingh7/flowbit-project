"use client";

import CustomBarChart from "@/components/charts/CustomBarChart";
import CustomPieChart from "@/components/charts/CustomPieChart";
import LineBarComposedChart from "@/components/charts/LineBarComposedChart";
import VerticalComposedChart from "@/components/charts/VerticalComposedChart";
import OverviewCard from "@/components/OverviewCard";
import Table from "@/components/Table";
import useCashOutflow from "@/hooks/useCashOutflow";
import useDashboardOverview from "@/hooks/useDashboardOverview";
import useInvoiceTrends from "@/hooks/useInvoiceTrends";
import useTopVendors from "@/hooks/useTopVendors";
import useVendorInvoiceCounts from "@/hooks/useVendorInvoiceCounts";

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = ({}) => {
  const {
    data: overview,
    loading: isOverviewLoading,
    error: overviewError,
  } = useDashboardOverview();
  const {
    data: topVendors,
    loading: isTopVendorsLoading,
    error: topVendorsError,
  } = useTopVendors();

  const {
    data: cashflow,
    loading: isCashflowLoading,
    error: cashflowError,
  } = useCashOutflow();

  const {
    data: invoiceTrends,
    loading: isInvoiceTrendsLoading,
    error: invoiceTrendsError,
  } = useInvoiceTrends();

  const {
    data: vendorInvoices,
    loading: isVendorInvoicesLoading,
    error: vendorInvoicesError,
  } = useVendorInvoiceCounts();

  if (
    overviewError ||
    topVendorsError ||
    cashflowError ||
    invoiceTrendsError
    // vendorInvoicesError
  ) {
    return <div>Error loading dashboard data.</div>;
  }

  // Assuming 'overview' is your state object from the API
  const overviewCardsData = [
    {
      title: "Total Spend", // Added a title for clarity
      currData: overview.currentMonth.totalSpendYTD,
      compareWith:overview.currentMonth.totalSpend,
      prevData: overview.prevMonth.totalSpend,
      timeLabel:"(YTD)",
      monetary:true
    },
    {
      title: "Invoices Processed",
      currData: overview.currentMonth.totalInvoicesProcessed,
      prevData: overview.prevMonth.totalInvoicesProcessed,
      monetary:false
    },
    {
      title: "Document Uploads",
      currData: overview.currentMonth.documentUploads,
      prevData: overview.prevMonth.documentUploads,
      timeLabel:"This Month",
      monetary:false
    },
    {
      title: "Average Invoice Value",
      currData: overview.currentMonth.averageInvoiceValue,
      prevData: overview.prevMonth.averageInvoiceValue, // Corrected this line
      monetary:true,
      timeLabel:"This Month"
    },
  ];

  console.log({ overview, topVendors, invoiceTrends, cashflow , vendorInvoices});

  return (
    <div className="w-full">
      <section className="grid grid-cols-4 gap-[15px] mb-[15px]">
        {overviewCardsData.map((card, index) => (
          <OverviewCard
            key={index} 
            loading={isOverviewLoading}
            title={card.title} 
            currData={card.currData}
            prevData={card.prevData}
            timeLabel={card.timeLabel}
            monetary={card.monetary}
            compareWith={card.compareWith}
          />
        ))}
      </section>

      <section className="grid grid-cols-2 gap-[15px] mb-[15px]">
        <LineBarComposedChart loading={isInvoiceTrendsLoading} rawData={invoiceTrends} />
        <VerticalComposedChart loading={isTopVendorsLoading} rawData={topVendors} />
      </section>

      <section className="grid grid-cols-10 gap-[15px]">
        <CustomPieChart />
       { //@ts-ignore
        <CustomBarChart loading={isCashflowLoading} />
       }
        <div className="w-full border border-gray-300 rounded-md bg-white col-span-4">
          <div className="p-4">
            {" "}
            <h1 className="text-xl font-bold">Invoices by Vendor</h1>
            <p className="text-gray-400 text-sm font-medium">
              Top vendors by invoice count and net value (2025).
            </p>
          </div>

          <Table tHead={["Vendors", "Invoice (QTY)", "Net Value"]} tBody={vendorInvoices.map((body:any)=> ([body.name, body.invoiceCount, body.totalSpend]))}/>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
