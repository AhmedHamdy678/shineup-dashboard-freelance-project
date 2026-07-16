import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalResults, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const start = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalResults);

  return (
    <div className="flex items-center justify-between px-6 py-4 text-sm text-gray-500">
      <span>النتائج: {start} - {end} من {totalResults}</span>
      <div className="flex items-center gap-2" dir="ltr">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-md disabled:text-gray-300 disabled:hover:bg-transparent text-gray-600 hover:bg-gray-100 transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              page === currentPage ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-md disabled:text-gray-300 disabled:hover:bg-transparent text-gray-600 hover:bg-gray-100 transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
