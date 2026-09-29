"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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

      {/* Hero Banner: StatCourt High-Octane Marketplace Sub-header */}
      <section className="bg-primary text-on-primary py-space-md shadow-md border-b-2 border-on-primary-fixed-variant">
        <div className="max-w-7xl mx-auto px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex flex-wrap items-center gap-space-md">
            <Link
              href="/"
              className="inline-flex items-center gap-1 bg-on-primary-fixed-variant px-3 py-1 rounded text-on-primary font-label-caps text-label-caps uppercase font-bold hover:bg-black transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>HOME</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="bg-surface-container-lowest text-primary px-2 py-0.5 rounded font-label-caps text-label-caps uppercase tracking-wider font-extrabold shadow-sm">
                ATHLETE GEAR MARKET
              </span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-fixed font-semibold">
                PEER-TO-PEER VERIFIED
              </span>
            </div>

            <h1 className="font-headline-lg text-headline-lg uppercase tracking-wide text-on-primary drop-shadow-sm">
              StatCourtTH Basketball Gear &amp; Footwear Exchange
            </h1>
          </div>

          {/* Action Cluster */}
          <div className="flex items-center gap-space-md w-full md:w-auto justify-end">
            {isPro ? (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-on-primary-fixed-variant rounded text-primary-fixed font-label-caps text-label-caps uppercase font-bold border border-primary-fixed-dim/30">
                <span
                  className="material-symbols-outlined text-base text-tertiary-fixed-dim"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span>Pro: Unlimited Listings</span>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-on-primary-fixed-variant rounded text-primary-fixed font-label-caps text-label-caps uppercase font-bold border border-primary-fixed-dim/30">
                <span>Free Quota: {myListingsCount}/1 Listing</span>
              </div>
            )}

            <button
              onClick={handleOpenCreateListing}
              className="flex items-center gap-1.5 bg-surface-container-lowest text-primary px-4 py-1.5 rounded font-headline-sm text-headline-sm uppercase font-bold hover:bg-primary-fixed transition-transform active:scale-95 shadow-md"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>POST LISTING / SELL GEAR</span>
            </button>

            {/* Interactive Subscription Tier Switcher */}
            <div
              onClick={toggleSubscriptionTier}
              className="flex items-center bg-inverse-surface rounded overflow-hidden p-0.5 border border-outline text-label-badge font-label-badge cursor-pointer hover:ring-2 hover:ring-primary/40 transition select-none"
              title="Click to toggle between FREE and PRO tier"
            >
              <span
                className={`px-2 py-0.5 uppercase transition ${
                  !isPro ? "bg-slate-700 text-white font-bold rounded" : "text-surface-dim"
                }`}
              >
                FREE
              </span>
              <span
                className={`px-2 py-0.5 rounded uppercase font-bold flex items-center gap-0.5 transition ${
                  isPro
                    ? "bg-tertiary-container text-on-tertiary-container"
                    : "text-surface-dim"
                }`}
              >
                <span
                  className="material-symbols-outlined text-xs"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>{" "}
                PRO
              </span>
              <span className="px-1.5 py-0.5 text-surface-dim uppercase text-[9px]">Plans</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Simulation Status Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-amber-900">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold uppercase text-[10px] shrink-0 border border-amber-300">
              รุ่นทดลอง / DEMO SIMULATION
            </span>
            <span>
              StatCourt Marketplace อยู่ในสถานะทดลองจำลองระบบ (Simulation Mode) — การลงประกาศ การสอบถามสินค้า และระบบ Escrow เป็นข้อมูลตัวอย่างเพื่อทดสอบ User Flow ยังไม่มีระบบชำระเงินจริง
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-800 shrink-0">
            [ SANDBOX WORKSPACE ]
          </span>
        </div>
      </div>

      {/* Verification & Escrow Credential Ribbon */}
      <aside className="bg-surface-container-high border-b border-outline-variant py-space-xs">
        <div className="max-w-7xl mx-auto px-gutter-desktop flex flex-wrap items-center justify-between text-body-sm font-body-sm text-on-surface gap-2">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span
              className="material-symbols-outlined text-primary text-base"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
            <span className="font-bold uppercase tracking-wider text-primary">
              FIBA &amp; TCAS ATHLETE PASS:
            </span>
            <span className="text-secondary">
              All shoes &amp; equipment authenticated via school roster IDs (BCC, Suankularb, Debsirin, Assumption, Bangkok Univ).
            </span>
          </div>
          <button
            onClick={() => setShowEscrowModal(true)}
            className="text-primary font-bold underline hover:text-on-surface uppercase tracking-wider text-label-caps font-label-caps text-left"
          >
            Learn About Escrow Direct Guarantee →
          </button>
        </div>
      </aside>

      {/* Main Marketplace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-gutter-desktop py-space-lg flex flex-col gap-space-lg">
        {/* Filter Bar & Search Sub-Panel */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-sm border border-outline-variant rounded shadow-sm">
          {/* Tactical Filter Tabs */}
          <div className="flex flex-wrap items-center gap-space-xs">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded font-headline-sm text-headline-sm uppercase tracking-wider transition-all duration-150 ${
                    isActive
                      ? "bg-primary text-on-primary font-bold shadow-sm active:scale-95"
                      : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant border border-outline-variant font-medium"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Quick Search Bar */}
          <div className="relative min-w-[280px] lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gear model, school, athlete..."
              className="w-full bg-surface-container-lowest border border-outline-variant pl-9 pr-4 py-1.5 text-body-md font-body-md rounded focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-secondary shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Grid: High-Impact 3-Column Bento/Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-desktop">
          {filteredItems.map((item) => {
            const hasCourtHistory = item.wornByAthletes && item.wornByAthletes.length > 0;
            const primaryAthlete = hasCourtHistory ? item.wornByAthletes[0] : null;
            const additionalCount = hasCourtHistory ? item.wornByAthletes.length - 1 : 0;

            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest border border-outline-variant rounded hover:border-primary transition-all duration-200 hover:shadow-lg flex flex-col overflow-hidden group"
              >
                {/* Card Visual Display Area with Tactical Badges */}
                <div
                  className="relative w-full h-72 overflow-hidden flex items-center justify-center p-space-md"
                  style={{ backgroundColor: item.cardBgColor || "#af101a" }}
                >
                  <img
                    src={item.imageUrls[0]}
                    alt={item.title}
                    className="object-contain w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Condition Badge Top Left */}
                  <div className="absolute top-space-sm left-space-sm bg-inverse-surface text-surface-bright px-2.5 py-0.5 rounded font-label-badge text-label-badge uppercase font-bold tracking-widest border border-outline">
                    {item.condition}
                  </div>

                  {/* Category Chip Top Right */}
                  <div className="absolute top-space-sm right-space-sm bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface px-2 py-0.5 rounded font-label-badge text-label-badge uppercase font-semibold">
                    {item.category}
                  </div>
                </div>

                {/* Spec Data Container */}
                <div className="p-space-md flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-space-xs">
                      <span className="font-headline-sm text-headline-sm uppercase text-secondary font-bold tracking-wider">
                        {item.brand}
                      </span>
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-semibold">
                        Size: {item.size}
                      </span>
                    </div>

                    <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                      {item.title}
                    </h2>

                    {/* Price Callout */}
                    <div className="mt-space-xs flex items-baseline gap-1.5">
                      <span className="font-title-stat text-title-stat text-primary font-bold">
                        ฿{item.priceThb.toLocaleString()}
                      </span>
                      <span className="font-label-caps text-label-caps uppercase text-secondary">
                        THB
                      </span>
                    </div>

                    {/* Verified Athlete Metadata */}
                    <div className="mt-space-sm pt-space-sm border-t border-outline-variant flex items-center justify-between text-body-sm font-body-sm">
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <span
                          className={`material-symbols-outlined text-base shrink-0 ${
                            item.isProSeller ? "text-primary" : "text-secondary"
                          }`}
                          style={
                            item.isProSeller
                              ? { fontVariationSettings: "'FILL' 1" }
                              : undefined
                          }
                        >
                          verified
                        </span>
                        <span className="font-bold text-on-surface truncate">
                          {item.sellerName}
                        </span>
                        <span className="text-secondary text-xs truncate">
                          ({item.sellerSchool})
                        </span>
                      </div>

                      {item.isProSeller ? (
                        <span className="bg-tertiary-container text-on-tertiary-container px-1.5 py-0.5 rounded font-label-badge text-label-badge uppercase font-bold shrink-0">
                          PRO
                        </span>
                      ) : (
                        <span className="bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded font-label-badge text-label-badge uppercase font-bold shrink-0">
                          FREE
                        </span>
                      )}
                    </div>

                    {/* Court History Tag */}
                    {hasCourtHistory && primaryAthlete && (
                      <button
                        onClick={() => setActiveWornByItem(item)}
                        className="mt-space-xs w-full bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 rounded px-2.5 py-1 flex items-center justify-between text-body-sm font-body-sm text-left transition-colors"
                      >
                        <div className="flex items-center gap-1.5 text-primary truncate">
                          <span className="material-symbols-outlined text-sm shrink-0">
                            person
                          </span>
                          <span className="font-semibold truncate">
                            Worn By: {primaryAthlete.name} #{primaryAthlete.jerseyNumber}
                            {additionalCount > 0 && ` (+${additionalCount} more)`}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-sm text-secondary shrink-0">
                          chevron_right
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Bottom Action */}
                  <button
                    onClick={() => handleOpenInquiry(item)}
                    className="mt-space-md w-full bg-inverse-surface hover:bg-primary text-on-primary py-2 rounded font-headline-sm text-headline-sm uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    <span>DIRECT INQUIRY</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Escrow & Authenticity Tactical Bottom Banner */}
        <div className="bg-surface-container-lowest border-2 border-primary/20 rounded p-space-lg flex flex-col md:flex-row items-center justify-between gap-space-lg shadow-sm">
          <div className="flex items-start gap-space-md">
            <div className="w-12 h-12 bg-primary text-on-primary rounded flex items-center justify-center shrink-0 shadow-md">
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                security
              </span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wide">
                StatCourt Peer-to-Peer Escrow Guarantee
              </h3>
              <p className="font-body-md text-body-md text-secondary max-w-2xl mt-0.5 leading-relaxed">
                Funds are locked in verified escrow until buyer confirms athlete ID match and gear condition inspection upon pickup at sanctioned tournament gymnasiums or delivery.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-md shrink-0">
            <div className="text-right">
              <p className="font-label-caps text-label-caps uppercase text-secondary font-bold">
                CERTIFIED DISPATCH
              </p>
              <p className="font-headline-sm text-headline-sm uppercase text-primary font-bold">
                0% COUNTERFEIT RATE
              </p>
            </div>
            <button
              onClick={() => setShowEscrowModal(true)}
              className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded font-headline-sm text-headline-sm uppercase tracking-wider font-bold transition-transform active:scale-95 shadow"
            >
              Read Escrow Terms
            </button>
          </div>
        </div>
      </main>

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
