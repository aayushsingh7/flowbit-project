"use client";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Loader from "../Loader";



interface LineBarComposedChartInterface {
  loading:boolean;
  rawData:any[];
}

const CustomToolTip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border border-gray-200 rounded-md shadow-sm min-w-[200px]">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-gray-600 text-sm w-full flex justify-between">
          Invoice Count:{" "}
          <span className="font-medium text-blue-500">{data.invoiceCount}</span>
        </p>
        <p className="text-gray-600 text-sm w-full flex justify-between">
          {data.totalSpend < 0 ? "Credit Amount: " : "Total Spend: "}
          <span className={`font-medium text-blue-500 `} >
           $ {Math.abs(data.totalSpend).toLocaleString() + ".00"}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const LineBarComposedChart:React.FC<LineBarComposedChartInterface> = ({loading,rawData}) => {
  const month = ["Jan", "Fed", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const data = rawData.map((d:any,index:number)=> ({name:month[index],invoiceCount:d.invoiceCount,totalSpend:Number(d.totalSpend),fixedBar:20}))
  return (
    <div className="w-full h-full p-1 border border-gray-300 rounded-md bg-white">
      <div className="p-3">
        {" "}
        <h1 className="text-xl font-bold">
          Invoice Volume + Value Trend
        </h1>
        <p className="text-gray-400 text-sm font-medium">
          Invoice count and total spend over 12 months (2025).
        </p>
      </div>
       {loading ?<Loader className="h-[400px]"/>:  
      <ResponsiveContainer
        width="100%"
        height={400}
        style={{ marginLeft: "-20px"}}
      >
            <ComposedChart
            height={"100%"}
          data={data}
        >
          {/* <CartesianGrid stroke="#f5f5f5" /> */}
          <XAxis
            dataKey="name"
            style={{ fontSize: "13px"}}
            axisLine={false}
            tickLine={false}
            
          />
          <YAxis
            style={{ fontSize: "14px" }}
            axisLine={false}
            tickLine={false}
          />
          
          <Tooltip content={<CustomToolTip />} />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="rgba(235, 237, 252, 0.59)" />
            </linearGradient>
          </defs>

           <defs>
            <linearGradient id="barActiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EBEDFC00" />
              <stop offset="100%" stopColor="rgba(207, 211, 239, 1)" />
            </linearGradient>
          </defs>

          <Bar
            dataKey="fixedBar"
            barSize={35}
            fill="url(#barGradient)"
            radius={[4, 4, 0, 0]}
            activeBar={{fill:"url(#barActiveGradient)"}}
            
          />

          <Line
            type="monotone"
            dataKey="invoiceCount"
            stroke="#1B1464"
            strokeWidth={2}
            dot={{ r: 3, stroke: "#1B1464", fill: "#1B1464" }}
          />
        </ComposedChart>
      </ResponsiveContainer> }
    </div>
  );
};

export default LineBarComposedChart;
