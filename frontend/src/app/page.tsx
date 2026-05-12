import HomePageClient from "@/components/home/HomePageClient";
import { getHomepageServerData } from "@/lib/home/getHomepageServerData";
import { getPublicStorefrontOrFallback } from "@/lib/storefront/publicStorefront";
import { buildStoreMetadata } from "@/lib/storefront/storeSeo";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const storefront = await getPublicStorefrontOrFallback();

  return buildStoreMetadata({ storefront });
}

export default async function Home() {
  const homepageData = await getHomepageServerData();

  return <HomePageClient initialData={homepageData} />;
}
