interface LoaderProps {
    className:string;
}

const Loader: React.FC<LoaderProps> = ({className}) => {
  return (
    <div className={`flex items-center justify-center w-[100%] ${className}`}>
      <span className="loader"></span>
    </div>
  );
};

export default Loader;
