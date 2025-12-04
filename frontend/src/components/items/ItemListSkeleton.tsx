import ItemCardSkeleton from "./ItemCardSkeleton";

export function ItemListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, idx) => (
          <ItemCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}
