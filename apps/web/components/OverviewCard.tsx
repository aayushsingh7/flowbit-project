import { IoIosTrendingUp } from "react-icons/io";
import Skeleton from "./Skeleton";
import calculatePercentage from "@/utils/calculatePercentage";

interface OverviewCardProps {
  loading: boolean;
  title: string;
  currData: number;
  prevData: number;
  monetary: boolean;
  compareWith?: number;
  timeLabel?: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  monetary,
  loading,
  currData,
  prevData,
  title,
  timeLabel,
  compareWith,
}) => {
  const compare = monetary
    ? calculatePercentage(compareWith || currData, prevData)
    : (compareWith || currData) - prevData;
  return (
    <div className="border border-gray-300 p-4 rounded-[10px] flex items-start justify-between">
      <div>
        <span className="mb-[15px] block">{title}</span>
        {loading ? (
          <Skeleton className="h-[38px] w-[150px]" />
        ) : (
          <h2 className="text-2xl font-bold">
          {monetary
  ? `$ ${Number(currData).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  : currData.toLocaleString()
}

          </h2>
        )}
        {loading ? (
          <Skeleton className="h-[15px] mt-[5px] w-[120px]" />
        ) : (
          <p className="text-gray-400 text-md mt-[2px] font-medium">
            <span
              className={`${
                compare == 0
                  ? "text-gray-400"
                  : compare < 0
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {monetary ? `${compare}%` : `${compare > 0 ? "+" : ""}${compare}`}{" "}
            </span>{" "}
            from last month
          </p>
        )}
      </div>

      <div className="flex items-end flex-col justify-between h-[100%]">
        <span className="text-gray-400 text-sm">{timeLabel}</span>
        {compare != 0 && <IoIosTrendingUp
          className={`text-[40px]  ${
            compare < 0 ? "text-red-500 rotate-[70deg]" : "text-green-500"
          }`}
        />}
      </div>
    </div>
  );
};

export default OverviewCard;
