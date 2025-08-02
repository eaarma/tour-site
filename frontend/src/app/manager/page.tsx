import ManagerItemList from "@/components/manager/ManagerItemList";
import ManagerOrderSection from "@/components/manager/ManagerOrderSection";
import ManagerStatisticsSection from "@/components/manager/ManagerStatisticsSection";
import { Item } from "@/types/types";

const mockItems: Item[] = [
  {
    id: 1,
    title: "Rhodes Beach Escape",
    description: "A relaxing beach tour in Rhodes.",
    imageUrl: "/images/rhodes.jpg",
    price: 120,
  },
  // Add more items as needed
];

export default function ManagerPage() {
  return (
    <div className="p-6">
      <ManagerStatisticsSection />
      <ManagerOrderSection />
      <ManagerItemList items={mockItems} />
    </div>
  );
}
