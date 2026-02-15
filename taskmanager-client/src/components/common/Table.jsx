import { ChevronUp, ChevronDown } from 'lucide-react';

const Table = ({
  columns,
  data,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  isLoading,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon,
}) => {
  const handleSort = (field) => {
    if (!onSort || !field) return;
    onSort(field);
  };

  if (isLoading) {
    return (
      <div className="table-container">
        <div className="p-12 text-center">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <div className="p-12 text-center">
          {EmptyIcon && <EmptyIcon className="h-12 w-12 mx-auto text-slate-300 mb-3" />}
          <p className="text-slate-500 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="bg-slate-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                  col.sortable ? 'cursor-pointer hover:text-slate-700 select-none' : ''
                } ${col.className || ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                  {col.sortable && sortField === col.key && (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, idx) => (
            <tr
              key={row.id || row.taskId || row.userId || row.teamId || idx}
              className={`transition-colors ${
                onRowClick
                  ? 'hover:bg-primary-50/50 cursor-pointer'
                  : 'hover:bg-slate-50'
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-6 py-4 text-sm ${col.cellClassName || ''}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
