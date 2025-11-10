"use client";

import {
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import Loader from "../Loader";
import React from "react";

interface VerticalComposedChartInterface {
  loading:boolean;
  rawData:any[];
}

//@ts-ignore
const CustomTooltip = ({ active, payload, label }) => {
  console.log("verical", {active,payload, label})
  if (active && payload && payload.length) {
    const value = payload[0].value.toLocaleString("en-US");
    return (
      <div className="bg-white border border-gray-200 shadow-md rounded-lg p-3">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-gray-500 text-sm">
          Vendor Spend:{" "}
          <span className="font-semibold text-blue-500">$ {Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </p>
      </div>
    );
  }
  return null;
};

const VerticalComposedChart:React.FC<VerticalComposedChartInterface> = ({loading,rawData}) => {
  
const tickFormatter = (value: string, index: number) => {
   const limit = 10; // put your maximum character
   if (value.length < limit) return value;
   return `${value.substring(0, limit)}...`;
};



  const data = rawData.map((d:any)=> ({name:d.name, amt:d.totalSpend}))
  return (
    <div className="w-full p-1 border border-gray-300 rounded-md bg-white">
      <div className="p-3">
        <h1 className="text-xl font-bold">Vendor Spend Overview</h1>
        <p className="text-gray-400 text-sm font-medium">
          Top vendor spend performance (All Time)
        </p>
      </div>
    {loading ? <Loader className="h-[400px]"/> : 
      <ResponsiveContainer
        width="98%"
        height={400}
        style={{ marginLeft: "-10px" }}
      >
        <ComposedChart layout="vertical"  data={data}>
          <defs>
            <linearGradient id="vendorGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d1c4f5" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#1B1464" stopOpacity={1} />
            </linearGradient>
          </defs>

          {/* <CartesianGrid stroke="blue" vertical={false} /> */}
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            fontSize={14}
            tickFormatter={(value:number)=> "$" + value}
          />

          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            width={120}
            fontSize={13}
            className="text-ellipsis"
            tickFormatter={tickFormatter}
          />

          <Tooltip content={
            //@ts-ignore
            <CustomTooltip />} />

          <Bar
            dataKey="amt"
            barSize={30}
            fill="#BDBCD6"
            radius={[0, 6, 6, 0]}
            background
            activeBar={{fill:"#1B1464", enableBackground:"#000000"}}
          />
           {/* <ReferenceLine y={0} stroke="#000" /> */}
        </ComposedChart>
      </ResponsiveContainer>}
    </div>
  );
};

export default VerticalComposedChart;
