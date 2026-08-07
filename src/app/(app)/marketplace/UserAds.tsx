"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, DollarSign } from "lucide-react";
import { getFileURL } from "@/lib/content-store";

interface UserAd {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  imageId: string | null;
  sellerUsername: string;
  sellerName: string;
  sellerAvatar: string;
  createdAt: number;
}

export default function UserAds() {
  const [ads, setAds] = useState<UserAd[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("voxel_ads") || "[]");
      setAds(stored.sort((a: UserAd, b: UserAd) => b.createdAt - a.createdAt));
    } catch {
      setAds([]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (ads.length === 0) return;
    const urls: Record<string, string> = {};
    Promise.all(
      ads
        .filter((ad) => ad.imageId)
        .map(async (ad) => {
          const url = await getFileURL(ad.imageId!);
          if (url) urls[ad.imageId!] = url;
        }),
    ).then(() => setImageUrls(urls));
  }, [ads]);

  if (!loaded || ads.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vox-orange/30 to-vox-pink/30 flex items-center justify-center">
          <ShoppingBag className="w-4 h-4 text-vox-orange" />
        </div>
        <div>
          <h2 className="text-white font-bold text-sm">User Listings</h2>
          <p className="text-[11px] text-vox-muted">Posted by the community</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {ads.map((ad, i) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="glass rounded-2xl overflow-hidden touch-feedback card-hover group"
          >
            {/* Image */}
            <div className="relative aspect-square bg-white/[0.04]">
              {ad.imageId && imageUrls[ad.imageId] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrls[ad.imageId]} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-vox-muted" />
                </div>
              )}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-vox-orange/80 text-white text-[9px] font-bold uppercase">
                {ad.category}
              </div>
            </div>

            {/* Info */}
            <div className="p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm font-semibold text-white truncate">{ad.title}</p>
              {ad.description && (
                <p className="text-[10px] text-vox-muted mt-0.5 line-clamp-2">{ad.description}</p>
              )}
              <div className="flex items-center gap-1 mt-1.5">
                <DollarSign className="w-3 h-3 text-vox-green" />
                <span className="text-sm font-bold text-vox-green">{ad.price}</span>
              </div>
              <Link
                href={`/profile/${ad.sellerUsername}`}
                className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/[0.06]"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-vox-purple to-vox-pink p-[1px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ad.sellerAvatar} alt={ad.sellerName} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="text-[10px] text-vox-muted truncate">{ad.sellerName}</span>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
