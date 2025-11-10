interface TableProps {
  tHead: string[];
  tBody: any[];
}

const Table: React.FC<TableProps> = ({ tHead, tBody }) => {
  console.log({ tHead, tBody });
  return (
    <table className="w-full border-collapse font-sans text-sm">
      <thead className="border-b border-gray-300">
        <tr className="bg-gray-100">
          {tHead.map((heading: string) => {
            return <th key={heading} className="p-3 text-left">{heading}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {tBody.map((body: any) => {
          return (
            <tr key={body.join("")} className="border-b border-gray-300 hover:bg-gray-100">
              {body.map((field: any, index: number) => {
                return tHead[index] == "Net Value" ? (
                  <td  className="p-1 text-center">
                    <span className="px-[15px] py-[2px] border border-gray-300 rounded-[10px]">
                      $ {Number(body[index]).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                ) : (
                  <td className="p-3" key={Math.floor(Math.random() * 100000000)}>{field}</td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
