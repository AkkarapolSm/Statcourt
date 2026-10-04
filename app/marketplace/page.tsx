"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import MarketStorefront from "@/components/market/MarketStorefront";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { mockMarketplaceItems } from "@/lib/db/seed-data";
import { MarketplaceItem } from "@/lib/types";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import PricingModal from "@/components/premium/PricingModal";
import { getMaxMarketplaceItems } from "@/lib/permissions";

export default function MarketplacePage() {
  const { currentUser, toggleSubscriptionTier } = useAuthStore();
  const isPro = currentUser.tier === "PRO";
  const maxListings = getMaxMarketplaceItems(currentUser.tier);

  const [items, setItems] = useState<MarketplaceItem[]>(mockMarketplaceItems);
  const [myListingsCount, setMyListingsCount] = useState<number>(1);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);
  const [showEscrowModal, setShowEscrowModal] = useState(false);

  // New listing form states
  const [newTitle, setNewTitle] = useState("");
  const [newBrand, setNewBrand] = useState("Nike");
  const [newModel, setNewModel] = useState("");
  const [newSize, setNewSize] = useState("US 10.5");
  const [newCondition, setNewCondition] = useState<MarketplaceItem["condition"]>("Mint 9.5/10");
  const [newPrice, setNewPrice] = useState("2500");
  const [newCategory, setNewCategory] = useState<MarketplaceItem["category"]>("Footwear");

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeInquiryItem, setActiveInquiryItem] = useState<MarketplaceItem | null>(null);
  const [activeWornByItem, setActiveWornByItem] = useState<MarketplaceItem | null>(null);

  // Inquiry form states
  const [buyerName, setBuyerName] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [pickupLocation, setPickupLocation] = useState("Siam Square / BTS Siam");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySent, setInquirySent] = useState(false);

  const categories = [
    { id: "ALL", label: "All Equipment" },
    { id: "Footwear", label: "Footwear" },
    { id: "Protective Braces", label: "Protective Braces" },
    { id: "Training Equipment", label: "Training Equipment" },
    { id: "Uniforms", label: "Uniforms" },
  ];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesBrand = item.brand.toLowerCase().includes(query);
        const matchesModel = item.model.toLowerCase().includes(query);
        const matchesSeller = item.sellerName.toLowerCase().includes(query);
        const matchesSchool = item.sellerSchool.toLowerCase().includes(query);
        if (!matchesTitle && !matchesBrand && !matchesModel && !matchesSeller && !matchesSchool) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedCategory, searchQuery]);

  const handleOpenCreateListing = () => {
    if (!isPro && myListingsCount >= maxListings) {
      setShowQuotaWarning(true);
      return;
    }
    setIsCreateListingOpen(true);
  };

  const handleCreateListingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice.trim()) return;

    const newItem: MarketplaceItem = {
      id: `mkt-item-${Date.now()}`,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerSchool:
        currentUser.role === "ATHLETE"
          ? "Bangkok Christian College"
          : "StatCourt Verified Academy",
      isSellerVerified: true,
      isProSeller: isPro,
      title: newTitle.trim(),
      brand: newBrand.trim(),
      model: newModel.trim() || newTitle.trim(),
      size: newSize.trim(),
      condition: newCondition,
      priceThb: parseFloat(newPrice) || 2000,
      isSold: false,
      category: newCategory,
      cardBgColor: newCategory === "Footwear" ? "#af101a" : "#e5eeff",
      imageUrls: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      ],
      wornByAthletes: [
        {
          id: currentUser.id,
          name: currentUser.name,
          team: "BCC",
          jerseyNumber: 7,
          position: "POINT_GUARD",
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);
    setMyListingsCount((prev) => prev + 1);
    setIsCreateListingOpen(false);
    setNewTitle("");
    setNewModel("");
  };

  const handleOpenInquiry = (item: MarketplaceItem) => {
    setActiveInquiryItem(item);
    setInquirySent(false);
    setInquiryMessage(
      `Hello ${item.sellerName}, I am interested in purchasing your ${item.title} (Size: ${item.size}). Is it still available for direct inspection/escrow pickup?`
    );
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      setActiveInquiryItem(null);
      setInquirySent(false);
      setBuyerName("");
      setBuyerContact("");
    }, 2000);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-primary selection:text-on-primary">
      {/* Top Global Header (Shared Component: Navbar) */}
      <Navbar />

      <MarketStorefront
        items={filteredItems} categories={categories} selectedCategory={selectedCategory}
        onCategory={setSelectedCategory} searchQuery={searchQuery} onSearch={setSearchQuery}
        onCreate={handleOpenCreateListing} onInquiry={handleOpenInquiry} onHistory={setActiveWornByItem}
        onTerms={() => setShowEscrowModal(true)} onPricing={() => setIsPricingModalOpen(true)}
        isPro={isPro} quota={`${myListingsCount}/${maxListings === Infinity ? "ไม่จำกัด" : maxListings}`}
      />
      {/* Escrow Terms Dialog */}
      {showEscrowModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-primary text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  security
                </span>
                <h3 className="font-headline-md text-headline-md uppercase text-on-surface">
                  Peer-to-Peer Escrow Guarantee
                </h3>
              </div>
              <button
                onClick={() => setShowEscrowModal(false)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body-md text-on-surface">
              <div className="p-3 bg-surface-container-low rounded border border-outline-variant/60 space-y-1">
                <span className="font-bold text-primary font-headline-sm uppercase text-sm block">
                  1. Sanctioned Tournament Pickup
                </span>
                <p className="text-secondary text-body-sm">
                  Buyers may inspect sneakers and gear in person at designated BSAT tournament tables (Nimibutr, Thai-Japan Dindaeng, etc.) with table staff witnessing authenticity.
                </p>
              </div>

              <div className="p-3 bg-surface-container-low rounded border border-outline-variant/60 space-y-1">
                <span className="font-bold text-primary font-headline-sm uppercase text-sm block">
                  2. Student-Athlete ID Verification
                </span>
                <p className="text-secondary text-body-sm">
                  All sellers are authenticated through official school athletic directories (BCC, Debsirin, Suankularb, Assumption). Roster numbers and player tags are permanently archived.
                </p>
              </div>

              <div className="p-3 bg-surface-container-low rounded border border-outline-variant/60 space-y-1">
                <span className="font-bold text-primary font-headline-sm uppercase text-sm block">
                  3. 100% Refund Protection
                </span>
                <p className="text-secondary text-body-sm">
                  If the gear does not match described condition (e.g. traction wear, sole separation, counterfeit replica), payment release is withheld and immediately refunded.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowEscrowModal(false)}
                className="bg-primary hover:bg-primary-container text-on-primary px-5 py-2 rounded font-headline-sm text-headline-sm uppercase font-bold"
              >
                I Understand &amp; Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Worn-By Verified Athletes Modal */}
      {activeWornByItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">
                  sports_basketball
                </span>
                <h3 className="font-headline-md text-headline-md uppercase text-on-surface">
                  Verified Court History
                </h3>
              </div>
              <button
                onClick={() => setActiveWornByItem(null)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="text-body-sm text-secondary">
              Gear Item:{" "}
              <span className="font-bold text-on-surface">{activeWornByItem.title}</span>
            </div>

            <div className="space-y-3">
              {activeWornByItem.wornByAthletes.map((ath) => (
                <div
                  key={ath.id}
                  className="p-3 bg-surface-container-low rounded border border-outline-variant/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary text-on-primary font-headline-md text-lg flex items-center justify-center font-bold">
                      #{ath.jerseyNumber}
                    </div>
                    <div>
                      <div className="font-headline-sm text-sm uppercase text-on-surface font-bold">
                        {ath.name}
                      </div>
                      <div className="text-body-sm text-secondary">
                        {ath.team} • {ath.position.replace("_", " ")}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/athlete/${ath.id}`}
                    className="bg-surface-container-lowest hover:bg-surface-container text-primary font-headline-sm text-xs uppercase px-3 py-1.5 rounded border border-outline-variant font-bold transition-colors"
                  >
                    View Card
                  </Link>
                </div>
              ))}
            </div>

            <div className="pt-2 text-body-sm text-secondary text-center">
              Anchored to official FIBA LiveStats tournament scoresheets &amp; game film.
            </div>
          </div>
        </div>
      )}

      {/* Direct Inquiry Modal */}
      {activeInquiryItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div>
                <span className="bg-primary text-on-primary px-2 py-0.5 rounded font-label-badge text-label-badge uppercase font-bold tracking-wider">
                  DIRECT ATHLETE INQUIRY
                </span>
                <h3 className="font-headline-md text-headline-md uppercase text-on-surface mt-1">
                  Contact {activeInquiryItem.sellerName}
                </h3>
              </div>
              <button
                onClick={() => setActiveInquiryItem(null)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {inquirySent ? (
              <div className="py-8 text-center space-y-2">
                <span
                  className="material-symbols-outlined text-primary text-5xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <h4 className="font-headline-md text-headline-md uppercase text-on-surface">
                  Inquiry Transmitted Successfully!
                </h4>
                <p className="text-body-sm text-secondary">
                  Athlete will receive courtside dispatch notification via SMS / Line.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3.5">
                <div className="p-3 bg-surface-container-low rounded border border-outline-variant/60 flex items-center justify-between text-body-sm">
                  <span className="text-secondary truncate max-w-[240px] font-semibold">
                    {activeInquiryItem.title}
                  </span>
                  <span className="font-title-stat text-lg text-primary font-bold">
                    ฿{activeInquiryItem.priceThb.toLocaleString()} THB
                  </span>
                </div>

                <div>
                  <label className="font-label-caps uppercase text-secondary font-bold block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Somchai Srivichai"
                    className="w-full text-body-md p-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="font-label-caps uppercase text-secondary font-bold block mb-1">
                    Contact Phone / Line ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerContact}
                    onChange={(e) => setBuyerContact(e.target.value)}
                    placeholder="e.g. 081-234-5678 or LineID: athlete_th"
                    className="w-full text-body-md p-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="font-label-caps uppercase text-secondary font-bold block mb-1">
                    Proposed Pickup / Delivery Method
                  </label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full text-body-md p-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Siam Square / BTS Siam">
                      In-Person: Siam Square / BTS Siam (Bangkok)
                    </option>
                    <option value="Mega Bangna">In-Person: Mega Bangna</option>
                    <option value="Nimibutr Stadium">
                      In-Person: Nimibutr Stadium (Tournament Venue)
                    </option>
                    <option value="Kerry Express / Flash Express">
                      Postal: Kerry Express / Flash Express
                    </option>
                  </select>
                </div>

                <div>
                  <label className="font-label-caps uppercase text-secondary font-bold block mb-1">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full text-body-md p-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveInquiryItem(null)}
                    className="px-4 py-2 rounded text-body-sm font-semibold text-secondary hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded font-headline-sm uppercase font-bold bg-primary hover:bg-primary-container text-on-primary flex items-center gap-1.5 shadow"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>SEND INQUIRY</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Freemium Quota Limit Warning Modal */}
      {showQuotaWarning && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-primary font-bold">
                  !
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">
                    FREE TIER LISTING LIMIT REACHED
                  </h3>
                  <span className="font-label-badge text-label-badge text-secondary uppercase">
                    QUOTA: 1 / 1 ACTIVE LISTING
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowQuotaWarning(false)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-2 text-body-sm text-secondary leading-relaxed">
              <p>
                บัญชี <strong>สายฟรี (Free Plan)</strong> สามารถลงประกาศขายอุปกรณ์บาสเกตบอลได้สูงสุด <strong>1 รายการ</strong> ในเวลาเดียวกัน
              </p>
              <div className="bg-surface-container-high border border-outline-variant/60 rounded p-3 text-on-surface space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-primary font-headline-sm uppercase">
                  <span>สิทธิประโยชน์ PRO ATHLETE (199 THB/เดือน)</span>
                </div>
                <ul className="list-disc list-inside text-body-sm space-y-0.5 text-secondary">
                  <li>ลงขายอุปกรณ์บาสได้ไม่จำกัด (Unlimited Listings)</li>
                  <li>ตราสัญลักษณ์ VERIFIED PRO SELLER สีทอง เพิ่มความน่าเชื่อถือ</li>
                  <li>ดันประกาศขึ้นหน้าแรกในตำแหน่ง Priority Featured</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 font-headline-sm text-headline-sm uppercase font-bold">
              <button
                onClick={() => setShowQuotaWarning(false)}
                className="px-4 py-2 rounded text-secondary hover:bg-surface-container"
              >
                ไว้คราวหลัง
              </button>
              <button
                onClick={() => {
                  setShowQuotaWarning(false);
                  setIsPricingModalOpen(true);
                }}
                className="px-5 py-2 rounded bg-primary hover:bg-primary-container text-on-primary shadow flex items-center gap-1.5"
              >
                <span>อัปเกรดเป็น PRO (199 THB)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Gear Listing Modal */}
      {isCreateListingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">add_box</span>
                <div>
                  <h3 className="font-headline-md text-headline-md uppercase text-on-surface">
                    POST NEW BASKETBALL GEAR LISTING
                  </h3>
                  <span className="font-label-badge text-label-badge text-secondary uppercase">
                    PEER-TO-PEER ATHLETE EQUIPMENT
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCreateListingOpen(false)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateListingSubmit} className="space-y-3 text-body-md">
              <div>
                <label className="font-label-caps uppercase text-secondary font-bold block mb-1">
                  Listing Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Nike Kobe 6 Protro All-Star"
                  className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-caps uppercase text-secondary font-bold block mb-1">
                    Brand *
                  </label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Nike">Nike</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Adidas">Adidas</option>
                    <option value="Puma">Puma</option>
                    <option value="Under Armour">Under Armour</option>
                    <option value="Li-Ning">Li-Ning</option>
                    <option value="Rigorer">Rigorer</option>
                    <option value="ANTA">ANTA</option>
                    <option value="Zamst">Zamst</option>
                    <option value="McDavid">McDavid</option>
                    <option value="Grand Sport">Grand Sport</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-caps uppercase text-secondary font-bold block mb-1">
                    Model / Edition
                  </label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. Kobe 6 Protro"
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-label-caps uppercase text-secondary font-bold block mb-1">
                    Size *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="US 10.5"
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="font-label-caps uppercase text-secondary font-bold block mb-1">
                    Condition *
                  </label>
                  <select
                    value={newCondition}
                    onChange={(e) =>
                      setNewCondition(e.target.value as MarketplaceItem["condition"])
                    }
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Mint 9.5/10">Mint 9.5/10</option>
                    <option value="Good 8.5/10">Good 8.5/10</option>
                    <option value="Used 7/10">Used 7/10</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-caps uppercase text-secondary font-bold block mb-1">
                    Price (THB) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps uppercase text-secondary font-bold block mb-1">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as MarketplaceItem["category"])
                  }
                  className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Footwear">Footwear (Basketball Shoes)</option>
                  <option value="Protective Braces">Protective Braces (Knee/Ankle)</option>
                  <option value="Training Equipment">Training Equipment</option>
                  <option value="Uniforms">Uniforms &amp; Apparel</option>
                </select>
              </div>

              <div className="pt-3 border-t border-outline-variant flex items-center justify-between">
                <span className="text-body-sm text-secondary">
                  Seller: {currentUser.name} ({isPro ? "PRO" : "FREE"})
                </span>
                <div className="flex items-center gap-2 font-headline-sm uppercase font-bold">
                  <button
                    type="button"
                    onClick={() => setIsCreateListingOpen(false)}
                    className="px-4 py-2 rounded text-secondary hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-primary hover:bg-primary-container text-on-primary shadow"
                  >
                    PUBLISH LISTING
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pricing Comparison Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        defaultPerspective="ATHLETE"
      />

      {/* Global Web Footer */}
      <Footer />
    </div>
  );
}
