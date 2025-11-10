import React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Loader from "../Loader";

const data = [
  {
    name: "0-7 days",
    amt: 0,
  },
  {
    name: "8-30 days",
    amt: 0,
  },
  {
    name: "31-60 days",
    amt: 0,
  },
  {
    name: "60+ days",
    amt: 0,
  },
].map((d: any) => ({ ...d, max: 5000 }));

interface CustomBarChartInterface {
  loading: boolean;
  rawData: any[];
}

//@ts-ignore
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value.toLocaleString("en-US");
    return (
      <div className="bg-white border border-gray-200 shadow-md rounded-lg p-3">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-gray-500 text-sm">
          Estimated Cash Outflow:{" "}
          <span className="font-semibold text-blue-500">$ {value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarChart: React.FC<CustomBarChartInterface> = ({
  loading,
  rawData,
}) => {
  return (
    <div className="w-full p-1 border border-gray-300 rounded-md bg-white col-span-3">
      <div className="p-3">
        {" "}
        <h1 className="text-xl font-bold">Cash Outflow Forecast </h1>
        <p className="text-gray-400 text-sm font-medium mb-[10px]">
          Expected payment obligations grouped by due date ranges.
        </p>
      </div>
      {loading ? (
        <Loader className="h-[300px]" />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 10, 
              bottom: 5,
            }}
          >
            <XAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              fontSize={12}
            />
            <YAxis
              type="number"
              axisLine={false}
              tickLine={false}
              fontSize={13}
              domain={[0, 5000]}
              tickFormatter={(value) => "$" + value}
            />
            <Tooltip           
              content={
                //@ts-ignore
                <CustomTooltip />
              }
              cursor={{ fill: "#f3f4f6" }}
            />

            <Bar
              barSize={80}
              dataKey="amt"
              fill="#1B1464"
              background
              radius={[6, 6, 6, 6]}
              activeBar={{ fill: "#130e49ff" }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CustomBarChart;
