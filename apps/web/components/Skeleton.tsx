interface SkeletonProps {
 className:string;
}

const Skeleton: React.FC<SkeletonProps> = ({className}) => {
  return (
    <div role="status" className={`max-w-sm animate-pulse`}>
      <div className={`bg-gray-300 rounded-[10px] ${className}`}></div>
    </div>
  );
};

export default Skeleton;
