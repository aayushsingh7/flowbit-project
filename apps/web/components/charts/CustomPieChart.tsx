"use client";

import React, { useState } from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Operations", value: 400 },
  { name: "Marketing", value: 300 },
  { name: "Facilities", value: 300 },
];

const COLORS = ["#FFD1A7", "#2B4DED", "#FF9E69"];

const renderActiveShape = (props:any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
  } = props;

  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        dy={8}
        textAnchor="middle"
        fill={fill}
        fontSize={18}
        fontWeight="bold"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 10}
        dy={8}
        textAnchor="middle"
        fill="#333"
        fontSize={16}
      >
        {`Value: ${payload.value}`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8} 
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const CustomPieChart = () => {
 
  const [activeIndex, setActiveIndex] = useState(0);
  //@ts-ignore
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  const isAnimationActive = true;

  return (
    <div className="w-full  p-1 border border-gray-300 rounded-md bg-white col-span-3">
      <div className="p-3">
        {" "}
        <h1 className="text-xl font-bold">Spend by Category</h1>
        <p className="text-gray-400 text-sm font-medium">
            Distribution of spending across different categories.
        </p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart
        >
          <Pie
          // @ts-ignore
            activeIndex={activeIndex} 
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="90%"
            dataKey="value"
            isAnimationActive={isAnimationActive}
            onMouseEnter={onPieEnter} 
            fill="#8884d8" 
          >
  
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          
        </PieChart>
      </ResponsiveContainer>

      <div className="p-3">
        {data.map((d, index:number)=> {
            return <div key={`${d.name}`} className="flex items-center justify-between w-full text-sm mb-[5px]"><div className="flex items-center"><span className="block w-[15px] h-[15px] rounded-[5px] mr-[10px]" style={{background:COLORS[index]}}></span><span className="text-gray-500">{d.name}</span></div> <span>${d.value}.00</span></div>
        })}
      </div>
    </div>
  );
};

export default CustomPieChart;
