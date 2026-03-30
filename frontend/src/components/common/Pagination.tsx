type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  return (
    <div className="flex justify-between items-center pt-4">
      <button
        className="btn btn-sm"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>

      <span className="text-sm">
        Page {totalPages === 0 ? 0 : page + 1} / {totalPages}
      </span>

      <button
        className="btn btn-sm"
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
