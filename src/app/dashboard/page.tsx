"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export type LifecycleState = "repurchase" | "zonk" | "wishlist" | "testing";

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  state: LifecycleState;
  score?: number;
  repurchaseCount?: number;
  zonkTags?: string[];
  sensoryNotes: string;
  price: number;
  purchaseUrl?: string;
  coolingDays?: string;
  testingDays?: string;
  testingProgress?: number;
  savedAmount?: number;
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "p1",
    name: "Kopi Toraja Sapan",
    category: "☕ Biji Kopi",
    state: "repurchase",
    score: 9.5,
    repurchaseCount: 4,
    sensoryNotes: "Medium roast, fruity acidity, chocolate finish. Rasio 1:15, 93°C.",
    price: 89000,
    purchaseUrl: "https://tokopedia.com",
  },
  {
    id: "p2",
    name: "Decant Sauvage EDT 10ml",
    category: "🌸 Parfum",
    state: "zonk",
    score: 3.2,
    zonkTags: ["SPL Lemah", "Aroma Apek"],
    sensoryNotes: "Dry down flat setelah 2 jam. Proyeksi lemah di cuaca tropis.",
    price: 45000,
    savedAmount: 45000,
  },
  {
    id: "p3",
    name: "Somethinc Niacinamide 10%",
    category: "🧴 Skincare",
    state: "testing",
    testingDays: "Hari ke-5 dari 14 hari observasi",
    testingProgress: 36,
    sensoryNotes: "pH 5.5, tekstur watery cepat meresap. Belum ada tanda breakout.",
    price: 79000,
  },
  {
    id: "p4",
    name: "Keripik Tempe Malang",
    category: "🍿 Makanan & Snack",
    state: "repurchase",
    score: 9.0,
    repurchaseCount: 2,
    sensoryNotes: "Renyah maksimal, bumbu tidak berlebihan, aftertaste gurih alami.",
    price: 25000,
    purchaseUrl: "https://shopee.co.id",
  },
  {
    id: "p5",
    name: "Sony WF-1000XM5",
    category: "🎧 Gadget & Audio",
    state: "wishlist",
    coolingDays: "Jeda 7 Hari — Sisa 3 Hari",
    sensoryNotes: "Target evaluasi: kenyamanan eartips & baterai ANC saat commuting.",
    price: 3299000,
  },
  {
    id: "p6",
    name: "Sunscreen Skin Aqua UV Moisture Milk",
    category: "🧴 Skincare",
    state: "zonk",
    score: 4.1,
    zonkTags: ["White Cast", "Bikin Lengket"],
    sensoryNotes: "White cast jelas di kulit sawo matang. Terasa gerah setelah 1 jam outdoor.",
    price: 52000,
    savedAmount: 52000,
  },
];

const PRESET_CATEGORIES = [
  "Semua",
  "☕ Biji Kopi",
  "🧴 Skincare",
  "🍿 Makanan & Snack",
  "🎧 Gadget & Audio",
  "🌸 Parfum",
];

export default function DashboardPage() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [filterState, setFilterState] = useState<LifecycleState | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new item
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("☕ Biji Kopi");
  const [formState, setFormState] = useState<LifecycleState>("wishlist");
  const [formPrice, setFormPrice] = useState("");
  const [formScore, setFormScore] = useState("9.0");
  const [formNotes, setFormNotes] = useState("");
  const [formTags, setFormTags] = useState("");

  // Calculated Stats
  const stats = useMemo(() => {
    const repurchase = products.filter((p) => p.state === "repurchase").length;
    const zonk = products.filter((p) => p.state === "zonk").length;
    const wishlist = products.filter((p) => p.state === "wishlist").length;
    const testing = products.filter((p) => p.state === "testing").length;
    const totalSaved = products
      .filter((p) => p.state === "zonk")
      .reduce((acc, curr) => acc + (curr.savedAmount || curr.price || 0), 0);
    return { repurchase, zonk, wishlist, testing, totalSaved };
  }, [products]);

  // Filtered List
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCat =
        selectedCategory === "Semua" || item.category === selectedCategory;
      const matchState = filterState === "all" || item.state === filterState;
      return matchCat && matchState;
    });
  }, [products, selectedCategory, filterState]);

  // Actions
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const priceNum = parseInt(formPrice.replace(/[^0-9]/g, "")) || 0;
    const scoreNum = parseFloat(formScore) || 8.0;

    const newItem: ProductItem = {
      id: "prod_" + Date.now(),
      name: formName.trim(),
      category: formCategory,
      state: formState,
      price: priceNum,
      sensoryNotes: formNotes.trim() || "Catatan evaluasi konsumsi pribadi.",
      score: formState === "repurchase" ? scoreNum : formState === "zonk" ? 4.0 : undefined,
      repurchaseCount: formState === "repurchase" ? 1 : undefined,
      zonkTags:
        formState === "zonk"
          ? formTags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      savedAmount: formState === "zonk" ? priceNum : undefined,
      coolingDays: formState === "wishlist" ? "Jeda 7 Hari — Masa Pendinginan" : undefined,
      testingDays: formState === "testing" ? "Hari ke-1 dari 14 hari observasi" : undefined,
      testingProgress: formState === "testing" ? 10 : undefined,
    };

    setProducts([newItem, ...products]);
    setIsModalOpen(false);

    // Reset Form
    setFormName("");
    setFormPrice("");
    setFormNotes("");
    setFormTags("");
  };

  const updateProductState = (
    id: string,
    newState: LifecycleState,
    extraUpdates?: Partial<ProductItem>
  ) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        let score = item.score;
        let repurchaseCount = item.repurchaseCount;
        let savedAmount = item.savedAmount;

        if (newState === "repurchase") {
          score = score && score >= 8.5 ? score : 9.0;
          repurchaseCount = (repurchaseCount || 0) + 1;
        } else if (newState === "zonk") {
          score = score && score < 5 ? score : 3.5;
          savedAmount = item.price;
        }

        return {
          ...item,
          state: newState,
          score,
          repurchaseCount,
          savedAmount,
          ...extraUpdates,
        };
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-linen text-espresso flex flex-col font-sans">
      {/* 1. EDITORIAL HEADER */}
      <header className="sticky top-0 z-40 bg-linen/90 backdrop-blur-md border-b border-espresso/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-espresso text-linen flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              J
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-tight text-espresso leading-none block">
                JEPIN
              </span>
              <span className="text-[11px] text-espresso-light font-medium tracking-tight">
                Jejak Pintar &bull; Ledger Konsumsi
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-sage hover:bg-sage-deep text-white font-medium text-xs sm:text-sm transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>+ Tambah Barang / Wishlist</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-ecru border-2 border-espresso/20 flex items-center justify-center text-xs font-bold font-serif text-espresso">
              NA
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
        {/* 2. ZONK SAVINGS RECAP BAR */}
        <div className="bg-sage-deep text-linen rounded-xl p-6 sm:p-7 shadow-sm border border-sage-deep/30 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold text-linen/70 mb-1">
              Audit Penghematan Otomatis
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Rp {stats.totalSaved.toLocaleString("id-ID")}
            </div>
            <div className="text-xs sm:text-sm text-linen/80 mt-1">
              Modal terselamatkan dari <span className="font-semibold underline">{stats.zonk} produk zonk</span> yang berhasil kamu blacklist &amp; cegah beli ulang.
            </div>
          </div>
          <button
            onClick={() => {
              setFilterState("zonk");
              setSelectedCategory("Semua");
            }}
            className="self-start sm:self-center px-4 py-2 rounded-lg bg-linen text-sage-deep font-semibold text-xs hover:bg-ecru transition-colors shadow-xs"
          >
            Lihat Daftar Zonk &rarr;
          </button>
        </div>

        {/* 3. FOUR PILLARS CLASSIFICATION GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setFilterState(filterState === "repurchase" ? "all" : "repurchase")}
            className={`text-left p-4 rounded-xl border bg-ecru/80 transition-all cursor-pointer ${
              filterState === "repurchase"
                ? "ring-2 ring-sage border-sage bg-ecru shadow-sm"
                : "border-espresso/10 hover:border-espresso/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="num-badge bg-linen text-sage-deep border-sage">01</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sage/15 text-sage-deep">
                {stats.repurchase} Item
              </span>
            </div>
            <div className="font-serif font-bold text-sm text-espresso">Wajib Beli Lagi</div>
            <div className="text-[11px] text-espresso-light mt-0.5">Skor ≥ 9.0 / Repeat buy</div>
          </button>

          <button
            onClick={() => setFilterState(filterState === "zonk" ? "all" : "zonk")}
            className={`text-left p-4 rounded-xl border bg-ecru/80 transition-all cursor-pointer ${
              filterState === "zonk"
                ? "ring-2 ring-terracotta border-terracotta bg-ecru shadow-sm"
                : "border-espresso/10 hover:border-espresso/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="num-badge bg-linen text-terracotta border-terracotta">02</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-terracotta/15 text-terracotta">
                {stats.zonk} Item
              </span>
            </div>
            <div className="font-serif font-bold text-sm text-espresso">Terbukti Zonk</div>
            <div className="text-[11px] text-espresso-light mt-0.5">Blacklist / Hindari</div>
          </button>

          <button
            onClick={() => setFilterState(filterState === "wishlist" ? "all" : "wishlist")}
            className={`text-left p-4 rounded-xl border bg-ecru/80 transition-all cursor-pointer ${
              filterState === "wishlist"
                ? "ring-2 ring-amber border-amber bg-ecru shadow-sm"
                : "border-espresso/10 hover:border-espresso/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="num-badge bg-linen text-amber-deep border-amber">03</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber/15 text-amber-deep">
                {stats.wishlist} Item
              </span>
            </div>
            <div className="font-serif font-bold text-sm text-espresso">Wishlist Terencana</div>
            <div className="text-[11px] text-espresso-light mt-0.5">Cooling-off jeda 7 hari</div>
          </button>

          <button
            onClick={() => setFilterState(filterState === "testing" ? "all" : "testing")}
            className={`text-left p-4 rounded-xl border bg-ecru/80 transition-all cursor-pointer ${
              filterState === "testing"
                ? "ring-2 ring-indigo border-indigo bg-ecru shadow-sm"
                : "border-espresso/10 hover:border-espresso/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="num-badge bg-linen text-indigo border-indigo">04</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo/15 text-indigo">
                {stats.testing} Item
              </span>
            </div>
            <div className="font-serif font-bold text-sm text-espresso">Sedang Diuji</div>
            <div className="text-[11px] text-espresso-light mt-0.5">Masa observasi 14 hari</div>
          </button>
        </div>

        {/* 4. HORIZONTAL CATEGORY FILTER */}
        <div className="flex items-center justify-between gap-4 mb-6 overflow-x-auto pb-2">
          <div className="flex items-center gap-2">
            {PRESET_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-espresso text-linen shadow-xs"
                    : "bg-ecru text-espresso-light hover:text-espresso border border-espresso/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {(filterState !== "all" || selectedCategory !== "Semua") && (
            <button
              onClick={() => {
                setFilterState("all");
                setSelectedCategory("Semua");
              }}
              className="text-xs font-semibold text-terracotta hover:underline whitespace-nowrap"
            >
              Reset Filter &times;
            </button>
          )}
        </div>

        {/* 5. PRODUCT CARDS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-ecru/40 rounded-2xl border border-dashed border-espresso/20">
            <p className="font-serif font-semibold text-lg text-espresso mb-1">
              Tidak ada produk pada kategori/siklus ini
            </p>
            <p className="text-xs text-espresso-light mb-4">
              Tambahkan produk baru atau atur kembali filter di atas.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-sage text-white font-medium text-xs hover:bg-sage-deep"
            >
              + Tambah Barang Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="bg-ecru rounded-xl p-5 shadow-sm border border-espresso/10 flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div>
                  {/* Card Header & Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-medium text-espresso-light bg-linen px-2.5 py-1 rounded-md border border-espresso/10">
                      {item.category}
                    </span>
                    {item.state === "repurchase" && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-sage/15 text-sage-deep flex items-center gap-1 border border-sage/20">
                        <span>✓ Wajib Beli</span>
                        {item.repurchaseCount && (
                          <span className="text-[10px] bg-sage text-white px-1.5 rounded-full">
                            {item.repurchaseCount}x
                          </span>
                        )}
                      </span>
                    )}
                    {item.state === "zonk" && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-terracotta/15 text-terracotta border border-terracotta/20">
                        ✕ Terbukti Zonk
                      </span>
                    )}
                    {item.state === "wishlist" && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber/15 text-amber-deep border border-amber/20">
                        ⏳ Wishlist Terencana
                      </span>
                    )}
                    {item.state === "testing" && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo/15 text-indigo border border-indigo/20">
                        🧪 Sedang Diuji
                      </span>
                    )}
                  </div>

                  {/* Title & Price */}
                  <h3 className="font-serif font-bold text-lg text-espresso mb-1">
                    {item.name}
                  </h3>
                  <div className="text-sm font-semibold text-espresso-light mb-3">
                    Rp {item.price.toLocaleString("id-ID")}
                  </div>

                  {/* Zonk Tags */}
                  {item.zonkTags && item.zonkTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.zonkTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded bg-terracotta/10 text-terracotta"
                        >
                          [{tag}]
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Testing Progress Bar */}
                  {item.state === "testing" && (
                    <div className="mb-3 bg-linen p-2.5 rounded-lg border border-espresso/10">
                      <div className="flex justify-between text-xs text-espresso-light font-medium mb-1.5">
                        <span>{item.testingDays || "Observasi"}</span>
                        <span>{item.testingProgress || 35}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-espresso/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo rounded-full transition-all"
                          style={{ width: `${item.testingProgress || 35}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Wishlist Cooling Info */}
                  {item.state === "wishlist" && (
                    <div className="mb-3 text-xs bg-amber/10 text-amber-deep px-3 py-2 rounded-lg font-medium border border-amber/20">
                      {item.coolingDays || "Jeda perenungan 7 hari aktif"}
                    </div>
                  )}

                  {/* Sensory Notes */}
                  <div className="bg-linen p-3 rounded-lg border border-espresso/5 mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-espresso-light mb-1">
                      Catatan Sensoris &amp; Evaluasi:
                    </div>
                    <p className="text-xs text-espresso leading-relaxed italic">
                      "{item.sensoryNotes}"
                    </p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-espresso/10 flex flex-col gap-2">
                  {/* Status-specific action buttons */}
                  {item.state === "wishlist" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateProductState(item.id, "repurchase", {
                            score: 9.2,
                            sensoryNotes: item.sensoryNotes + " (Lolos verifikasi worth to buy!)",
                          })
                        }
                        className="flex-1 py-1.5 rounded-md bg-sage hover:bg-sage-deep text-white text-xs font-semibold transition-colors"
                      >
                        ✓ Worth to Buy
                      </button>
                      <button
                        onClick={() =>
                          updateProductState(item.id, "testing", {
                            testingDays: "Hari ke-1 dari 14 hari observasi",
                            testingProgress: 10,
                          })
                        }
                        className="flex-1 py-1.5 rounded-md bg-indigo hover:bg-cobalt text-white text-xs font-semibold transition-colors"
                      >
                        🧪 Beli &amp; Uji
                      </button>
                    </div>
                  )}

                  {item.state === "testing" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateProductState(item.id, "repurchase", {
                            score: 9.3,
                            sensoryNotes: item.sensoryNotes + " (Hasil uji: Sangat memuaskan!)",
                          })
                        }
                        className="flex-1 py-1.5 rounded-md bg-sage hover:bg-sage-deep text-white text-xs font-semibold transition-colors"
                      >
                        ✓ Wajib Beli Lagi
                      </button>
                      <button
                        onClick={() =>
                          updateProductState(item.id, "zonk", {
                            zonkTags: ["Tidak Cocok", "Mengecewakan"],
                            savedAmount: item.price,
                          })
                        }
                        className="flex-1 py-1.5 rounded-md bg-terracotta hover:bg-rose text-white text-xs font-semibold transition-colors"
                      >
                        ✕ Tandai Zonk
                      </button>
                    </div>
                  )}

                  {item.state === "repurchase" && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif font-bold text-sage-deep">
                        ★ {item.score?.toFixed(1) || "9.0"}/10
                      </span>
                      <button
                        onClick={() =>
                          updateProductState(item.id, "repurchase")
                        }
                        className="text-sage-deep font-bold hover:underline"
                      >
                        + Beli Lagi ({item.repurchaseCount || 1}x)
                      </button>
                    </div>
                  )}

                  {item.state === "zonk" && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-terracotta font-bold">
                        Hemat: +Rp {(item.savedAmount || item.price).toLocaleString("id-ID")}
                      </span>
                      <button
                        onClick={() => deleteProduct(item.id)}
                        className="text-espresso-light hover:text-terracotta text-[11px]"
                      >
                        Hapus Log
                      </button>
                    </div>
                  )}

                  {/* Secondary Quick Controls */}
                  <div className="flex justify-between items-center text-[11px] text-espresso-light pt-1">
                    <span className="italic">Ubah status:</span>
                    <div className="flex gap-1.5">
                      {item.state !== "repurchase" && (
                        <button
                          onClick={() => updateProductState(item.id, "repurchase")}
                          className="hover:text-sage-deep"
                        >
                          Beli
                        </button>
                      )}
                      {item.state !== "wishlist" && (
                        <button
                          onClick={() => updateProductState(item.id, "wishlist")}
                          className="hover:text-amber-deep"
                        >
                          Wishlist
                        </button>
                      )}
                      {item.state !== "zonk" && (
                        <button
                          onClick={() => updateProductState(item.id, "zonk")}
                          className="hover:text-terracotta"
                        >
                          Zonk
                        </button>
                      )}
                      <button
                        onClick={() => deleteProduct(item.id)}
                        className="text-espresso-light/60 hover:text-terracotta ml-1"
                        title="Hapus item"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. PHILOSOPHY QUOTE */}
        <section className="my-12 py-8 px-6 bg-ecru/50 rounded-2xl border border-espresso/10 text-center max-w-2xl mx-auto">
          <blockquote className="font-serif italic text-lg sm:text-xl text-espresso mb-3 leading-snug">
            &ldquo;Belanja cerdas bukan soal mencari yang paling murah, melainkan berhenti mengulangi kekecewaan yang sama.&rdquo;
          </blockquote>
          <cite className="text-xs uppercase tracking-wider font-semibold text-sage-deep not-italic">
            &mdash; Prinsip JEPIN (Jejak Pintar)
          </cite>
        </section>
      </main>

      {/* MODAL TAMBAH BARANG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-espresso/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-linen rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-espresso/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-espresso/10">
              <div>
                <h2 className="font-serif font-bold text-xl text-espresso">
                  Tambah Produk / Wishlist Baru
                </h2>
                <p className="text-xs text-espresso-light">
                  Catat konsumsi atau masukkan barang ke daftar perenungan
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-ecru flex items-center justify-center text-espresso font-bold hover:bg-espresso hover:text-linen transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-1">
                  Nama Barang *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Kopi Flores Bajawa / Parfum EDP"
                  className="w-full px-3.5 py-2.5 bg-ecru border border-espresso/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-1">
                    Kategori
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-ecru border border-espresso/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-sage"
                  >
                    <option value="☕ Biji Kopi">☕ Biji Kopi</option>
                    <option value="🧴 Skincare">🧴 Skincare</option>
                    <option value="🍿 Makanan & Snack">🍿 Makanan &amp; Snack</option>
                    <option value="🎧 Gadget & Audio">🎧 Gadget &amp; Audio</option>
                    <option value="🌸 Parfum">🌸 Parfum</option>
                    <option value="📦 Lainnya">📦 Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="85000"
                    className="w-full px-3.5 py-2.5 bg-ecru border border-espresso/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-1">
                  Status Siklus Awal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormState("wishlist")}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-left transition-all ${
                      formState === "wishlist"
                        ? "bg-amber/15 border-amber text-amber-deep font-bold"
                        : "bg-ecru border-espresso/10 text-espresso"
                    }`}
                  >
                    03 Wishlist Terencana
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormState("testing")}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-left transition-all ${
                      formState === "testing"
                        ? "bg-indigo/15 border-indigo text-indigo font-bold"
                        : "bg-ecru border-espresso/10 text-espresso"
                    }`}
                  >
                    04 Sedang Diuji
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormState("repurchase")}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-left transition-all ${
                      formState === "repurchase"
                        ? "bg-sage/15 border-sage text-sage-deep font-bold"
                        : "bg-ecru border-espresso/10 text-espresso"
                    }`}
                  >
                    01 Wajib Beli Lagi
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormState("zonk")}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-left transition-all ${
                      formState === "zonk"
                        ? "bg-terracotta/15 border-terracotta text-terracotta font-bold"
                        : "bg-ecru border-espresso/10 text-espresso"
                    }`}
                  >
                    02 Terbukti Zonk
                  </button>
                </div>
              </div>

              {formState === "zonk" && (
                <div>
                  <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-1">
                    Alasan Zonk (Pisahkan Koma)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="SPL Lemah, Bikin Enek, Terlalu Manis"
                    className="w-full px-3.5 py-2.5 bg-ecru border border-espresso/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-espresso uppercase tracking-wider mb-1">
                  Catatan Sensoris &amp; Evaluasi
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Rasa, aftertaste, aroma, reaksi di kulit, tekstur..."
                  className="w-full px-3.5 py-2 bg-ecru border border-espresso/20 rounded-lg text-sm text-espresso focus:outline-none focus:border-sage"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-espresso/20 text-espresso font-semibold text-xs hover:bg-ecru transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-sage hover:bg-sage-deep text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  Simpan ke Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. FOOTER MANIFESTO */}
      <footer className="mt-auto border-t border-espresso/10 py-8 px-6 text-center text-xs text-espresso-light">
        <p className="font-serif font-bold text-sm text-espresso mb-1">
          JEPIN (Jejak Pintar)
        </p>
        <p className="mb-2">
          Kami percaya setiap rupiah yang dibelanjakan harus menghasilkan kepuasan nyata.
        </p>
        <p>&copy; 2024 JEPIN. Ledger Konsumsi &amp; Repurchase Tracker.</p>
      </footer>
    </div>
  );
}
