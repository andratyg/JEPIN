"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export type LifecycleState = "repurchase" | "zonk" | "wishlist" | "testing";
export type SortOption = "latest" | "score-desc" | "saved-desc" | "price-asc" | "price-desc";

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  state: LifecycleState;
  price: number;
  imageUrl?: string;
  score?: number;
  repurchaseCount?: number;
  zonkTags?: string[];
  sensoryNotes: string;
  coolingDays?: string;
  testingDays?: string;
  testingProgress?: number;
  savedAmount?: number;
  dateAdded?: string;
  timestamp?: number;
}

const DEFAULT_CATEGORIES = [
  "☕ Biji Kopi",
  "🧴 Skincare",
  "🍿 Makanan & Snack",
  "🎧 Gadget & Audio",
  "🌸 Parfum",
];

const INITIAL_PRODUCTS: ProductItem[] = [];

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [filterState, setFilterState] = useState<LifecycleState | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  // Supabase sync status
  const [isSupabaseOnline, setIsSupabaseOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isAuditCardModalOpen, setIsAuditCardModalOpen] = useState(false);
  const [activeItemForEval, setActiveItemForEval] = useState<ProductItem | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for new item
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formState, setFormState] = useState<LifecycleState>("wishlist");
  const [formPrice, setFormPrice] = useState("");
  const [formScore, setFormScore] = useState("9.0");
  const [formNotes, setFormNotes] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formImagePreview, setFormImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for category management
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("🏷️");
  const [categoryModalTab, setCategoryModalTab] = useState<"list" | "add">("list");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryNameInput, setEditCategoryNameInput] = useState("");

  // Form State for Evaluation Popup (Worth to buy or Zonk with notes)
  const [evalDecision, setEvalDecision] = useState<"worth" | "zonk">("worth");
  const [evalNotes, setEvalNotes] = useState("");
  const [evalScore, setEvalScore] = useState("9.2");
  const [evalZonkTags, setEvalZonkTags] = useState("");

  // STRICT AUTH GUARD: NO GUEST MODE
  useEffect(() => {
    async function verifyAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.replace("/login");
          return;
        }
        setCurrentUser(session.user);
        setAuthChecking(false);
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/login");
      }
    }
    verifyAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/login");
      } else {
        setCurrentUser(session.user);
        setAuthChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out error:", e);
    } finally {
      router.replace("/login");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Initial Load & Supabase Fetch
  useEffect(() => {
    // Fallback load from localStorage without mock data
    try {
      const savedProds = localStorage.getItem("jepin_products_v4") || localStorage.getItem("jepin_products_v3");
      if (savedProds) {
        const parsed = JSON.parse(savedProds);
        const cleaned = Array.isArray(parsed)
          ? parsed.filter((p: ProductItem) => !["p1", "p2", "p3", "p4", "p5", "p6"].includes(p.id))
          : [];
        setProducts(cleaned);
        localStorage.setItem("jepin_products_v4", JSON.stringify(cleaned));
      }
      const savedCats = localStorage.getItem("jepin_categories_v4") || localStorage.getItem("jepin_categories_v3");
      if (savedCats) setCategories(JSON.parse(savedCats));
    } catch {}

    // Fetch from Supabase
    async function loadFromSupabase() {
      try {
        setIsSyncing(true);
        const { data: catData, error: catErr } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (!catErr && catData && catData.length > 0) {
          const catNames = catData.map((c: { name: string }) => c.name);
          setCategories(catNames);
          setIsSupabaseOnline(true);
        }

        const { data: prodData, error: prodErr } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (!prodErr && prodData && prodData.length > 0) {
          const mapped: ProductItem[] = prodData.map((row: any) => ({
            id: row.id,
            name: row.name,
            category: row.category,
            state: row.state as LifecycleState,
            price: Number(row.price) || 0,
            imageUrl: row.image_url || undefined,
            score: row.score ? Number(row.score) : undefined,
            repurchaseCount: row.repurchase_count || 0,
            zonkTags: row.zonk_tags || [],
            sensoryNotes: row.sensory_notes || "",
            coolingDays: row.cooling_days || undefined,
            testingDays: row.testing_days || undefined,
            testingProgress: row.testing_progress || undefined,
            savedAmount: row.saved_amount ? Number(row.saved_amount) : undefined,
            dateAdded: row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID") : "Hari ini",
            timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
          }));
          setProducts(mapped);
          setIsSupabaseOnline(true);
        } else if (!prodErr) {
          setIsSupabaseOnline(true);
        }
      } catch (err) {
        console.warn("Supabase load fallback to local:", err);
      } finally {
        setIsSyncing(false);
      }
    }

    loadFromSupabase();
  }, []);

  // Save to localStorage as resilient offline cache
  useEffect(() => {
    try {
      localStorage.setItem("jepin_products_v4", JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem("jepin_categories_v4", JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    if (!formCategory && categories.length > 0) {
      setFormCategory(categories[0]);
    }
  }, [categories, formCategory]);

  // Stats calculation
  const stats = useMemo(() => {
    const repurchase = products.filter((p) => p.state === "repurchase").length;
    const zonk = products.filter((p) => p.state === "zonk").length;
    const wishlist = products.filter((p) => p.state === "wishlist").length;
    const testing = products.filter((p) => p.state === "testing").length;
    const totalSaved = products
      .filter((p) => p.state === "zonk")
      .reduce((acc, curr) => acc + (curr.savedAmount || curr.price || 0), 0);
    const zonkItems = products.filter((p) => p.state === "zonk");
    const repurchaseItems = products.filter((p) => p.state === "repurchase");
    return { repurchase, zonk, wishlist, testing, totalSaved, zonkItems, repurchaseItems };
  }, [products]);

  // Filtered & Sorted List
  const filteredProducts = useMemo(() => {
    const list = products.filter((item) => {
      const matchCat =
        selectedCategory === "Semua" || item.category === selectedCategory;
      const matchState = filterState === "all" || item.state === filterState;
      const matchSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sensoryNotes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.zonkTags &&
          item.zonkTags.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase())
          ));
      return matchCat && matchState && matchSearch;
    });

    return list.sort((a, b) => {
      if (sortBy === "score-desc") {
        return (b.score || 0) - (a.score || 0);
      }
      if (sortBy === "saved-desc") {
        const savedA = a.state === "zonk" ? a.savedAmount || a.price || 0 : 0;
        const savedB = b.state === "zonk" ? b.savedAmount || b.price || 0 : 0;
        return savedB - savedA;
      }
      if (sortBy === "price-asc") {
        return a.price - b.price;
      }
      if (sortBy === "price-desc") {
        return b.price - a.price;
      }
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
  }, [products, selectedCategory, filterState, searchQuery, sortBy]);

  // Handle Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handlers for Category Management
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const formatted = `${newCategoryEmoji.trim()} ${newCategoryName.trim()}`;
    if (!categories.includes(formatted)) {
      setCategories([...categories, formatted]);
      setSelectedCategory(formatted);
      showToast(`Kategori "${formatted}" berhasil ditambahkan!`);

      // Sync to Supabase
      try {
        await supabase.from("categories").insert({ name: formatted });
      } catch (err) {
        console.warn("Supabase cat insert fallback:", err);
      }
    }
    setNewCategoryName("");
    setCategoryModalTab("list");
  };

  const handleDeleteCategory = async (catName: string) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${catName}"?`)) return;

    const remaining = categories.filter((c) => c !== catName);
    setCategories(remaining);

    if (selectedCategory === catName) {
      setSelectedCategory("Semua");
    }

    const fallbackCat = remaining[0] || "Umum";
    const updatedProducts = products.map((p) =>
      p.category === catName ? { ...p, category: fallbackCat } : p
    );
    setProducts(updatedProducts);

    showToast(`Kategori "${catName}" berhasil dihapus.`);

    // Sync to Supabase
    try {
      await supabase.from("categories").delete().eq("name", catName);
      await supabase.from("products").update({ category: fallbackCat }).eq("category", catName);
    } catch (err) {
      console.warn("Supabase cat delete fallback:", err);
    }
  };

  const handleRenameCategory = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCategory(null);
      return;
    }

    const updatedCategories = categories.map((c) => (c === oldName ? trimmed : c));
    setCategories(updatedCategories);

    if (selectedCategory === oldName) {
      setSelectedCategory(trimmed);
    }

    const updatedProducts = products.map((p) =>
      p.category === oldName ? { ...p, category: trimmed } : p
    );
    setProducts(updatedProducts);
    setEditingCategory(null);

    showToast(`Kategori diperbarui: "${trimmed}"`);

    // Sync to Supabase
    try {
      await supabase.from("categories").update({ name: trimmed }).eq("name", oldName);
      await supabase.from("products").update({ category: trimmed }).eq("category", oldName);
    } catch (err) {
      console.warn("Supabase cat rename fallback:", err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const priceNum = parseInt(formPrice.replace(/[^0-9]/g, "")) || 0;
    const scoreNum = parseFloat(formScore) || 9.0;
    const now = Date.now();

    const newItem: ProductItem = {
      id: "prod_" + now,
      name: formName.trim(),
      category: formCategory || categories[0] || "Umum",
      state: formState,
      price: priceNum,
      imageUrl: formImagePreview || undefined,
      sensoryNotes: formNotes.trim() || "Catatan evaluasi konsumsi objektif.",
      score:
        formState === "repurchase"
          ? scoreNum
          : formState === "zonk"
          ? 3.8
          : undefined,
      repurchaseCount: formState === "repurchase" ? 1 : undefined,
      zonkTags:
        formState === "zonk"
          ? formTags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      savedAmount: formState === "zonk" ? priceNum : undefined,
      coolingDays:
        formState === "wishlist"
          ? "Jeda 7 Hari — Masa Pendinginan"
          : undefined,
      testingDays:
        formState === "testing"
          ? "Hari ke-1 dari 14 hari observasi"
          : undefined,
      testingProgress: formState === "testing" ? 10 : undefined,
      dateAdded: "Hari ini",
      timestamp: now,
    };

    setProducts([newItem, ...products]);
    setIsProductModalOpen(false);
    showToast(`"${newItem.name}" berhasil dicatat ke ledger!`);

    // Reset Form
    setFormName("");
    setFormPrice("");
    setFormNotes("");
    setFormTags("");
    setFormImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Sync to Supabase
    try {
      await supabase.from("products").insert({
        name: newItem.name,
        category: newItem.category,
        state: newItem.state,
        price: newItem.price,
        image_url: newItem.imageUrl,
        score: newItem.score,
        repurchase_count: newItem.repurchaseCount || 0,
        zonk_tags: newItem.zonkTags || [],
        sensory_notes: newItem.sensoryNotes,
        cooling_days: newItem.coolingDays,
        testing_days: newItem.testingDays,
        testing_progress: newItem.testingProgress,
        saved_amount: newItem.savedAmount || 0,
      });
    } catch (err) {
      console.warn("Supabase product insert fallback:", err);
    }
  };

  // Open Evaluation Modal for an item
  const openEvaluationModal = (item: ProductItem) => {
    setActiveItemForEval(item);
    setEvalDecision("worth");
    setEvalNotes(item.sensoryNotes);
    setEvalScore("9.4");
    setEvalZonkTags(
      item.zonkTags?.join(", ") || "SPL Lemah, Tidak Cocok, Mengecewakan"
    );
    setIsEvaluationModalOpen(true);
  };

  // Submit Evaluation Modal
  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItemForEval) return;

    const itemId = activeItemForEval.id;
    let updatedItem: ProductItem;

    if (evalDecision === "worth") {
      const scoreNum = parseFloat(evalScore) || 9.2;
      updatedItem = {
        ...activeItemForEval,
        state: "repurchase",
        score: scoreNum,
        repurchaseCount: (activeItemForEval.repurchaseCount || 0) + 1,
        sensoryNotes:
          evalNotes.trim() || activeItemForEval.sensoryNotes + " [Terbukti Worth to Buy]",
      };
      setProducts((prev) =>
        prev.map((item) => (item.id === itemId ? updatedItem : item))
      );
      showToast(`✓ "${activeItemForEval.name}" diverifikasi Worth to Buy!`);
    } else {
      const tags = evalZonkTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      updatedItem = {
        ...activeItemForEval,
        state: "zonk",
        score: 3.5,
        zonkTags: tags.length > 0 ? tags : ["Mengecewakan"],
        savedAmount: activeItemForEval.price,
        sensoryNotes:
          evalNotes.trim() || activeItemForEval.sensoryNotes + " [Tercatat Zonk]",
      };
      setProducts((prev) =>
        prev.map((item) => (item.id === itemId ? updatedItem : item))
      );
      showToast(`✕ "${activeItemForEval.name}" ditandai Zonk & diblacklist.`);
    }

    setIsEvaluationModalOpen(false);
    setActiveItemForEval(null);

    // Sync to Supabase
    try {
      await supabase
        .from("products")
        .update({
          state: updatedItem.state,
          score: updatedItem.score,
          repurchase_count: updatedItem.repurchaseCount || 0,
          zonk_tags: updatedItem.zonkTags || [],
          sensory_notes: updatedItem.sensoryNotes,
          saved_amount: updatedItem.savedAmount || 0,
        })
        .match({ name: updatedItem.name });
    } catch (err) {
      console.warn("Supabase update fallback:", err);
    }
  };

  const updateProductStateQuick = async (
    id: string,
    newState: LifecycleState,
    extraUpdates?: Partial<ProductItem>
  ) => {
    let touchedItem: ProductItem | undefined;

    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        let score = item.score;
        let repurchaseCount = item.repurchaseCount;
        let savedAmount = item.savedAmount;

        if (newState === "repurchase") {
          score = score && score >= 8.5 ? score : 9.2;
          repurchaseCount = (repurchaseCount || 0) + 1;
        } else if (newState === "zonk") {
          score = score && score < 5 ? score : 3.5;
          savedAmount = item.price;
        }

        touchedItem = {
          ...item,
          state: newState,
          score,
          repurchaseCount,
          savedAmount,
          ...extraUpdates,
        };
        return touchedItem;
      })
    );
    showToast("Status produk diperbarui.");

    // Sync to Supabase
    if (touchedItem) {
      try {
        await supabase
          .from("products")
          .update({
            state: touchedItem.state,
            score: touchedItem.score,
            repurchase_count: touchedItem.repurchaseCount || 0,
            saved_amount: touchedItem.savedAmount || 0,
          })
          .match({ name: touchedItem.name });
      } catch (err) {
        console.warn("Supabase quick update fallback:", err);
      }
    }
  };

  const deleteProduct = async (id: string, name: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`"${name}" dihapus dari ledger.`);

    try {
      await supabase.from("products").delete().match({ name });
    } catch (err) {
      console.warn("Supabase delete fallback:", err);
    }
  };

  const userAvatar = currentUser?.user_metadata?.avatar_url;
  const userName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.email?.split("@")[0] ||
    "User";
  const userInitials = (userName.slice(0, 2)).toUpperCase();

  // Copy shareable text summary of savings
  const handleCopyAuditSummary = () => {
    const zonkLines = stats.zonkItems
      .map(
        (z, idx) =>
          `${idx + 1}. ${z.name} - Rp ${z.price.toLocaleString("id-ID")}${
            z.zonkTags?.length ? ` [${z.zonkTags.join(", ")}]` : ""
          }`
      )
      .join("\n");

    const text = `🛡️ JEPIN (Jejak Pintar) — BUKTI PENGHEMATAN KONSUMSI\n` +
      `-------------------------------------------\n` +
      `Total Dana Terselamatkan: Rp ${stats.totalSaved.toLocaleString("id-ID")}\n` +
      `Jumlah Produk Zonk Dicegah: ${stats.zonk} Barang\n\n` +
      `Blacklist Pengeluaran Berulang:\n${zonkLines || "(Belum ada item zonk)"}\n\n` +
      `Kurasi konsumsi mandiri tanpa impulse buying. #JEPIN #AntiZonk #SmartLedger`;

    navigator.clipboard.writeText(text);
    showToast("Ringkasan Bukti Hemat disalin ke clipboard!");
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-linen flex items-center justify-center text-espresso">
        <div className="text-center space-y-4 p-8 bg-ecru rounded-2xl border border-espresso/10 max-w-sm w-full mx-4 shadow-sm">
          <div className="w-10 h-10 border-3 border-sage border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h2 className="font-serif font-bold text-base text-espresso">
              Memverifikasi Sesi...
            </h2>
            <p className="text-xs text-espresso-light mt-1">
              Memuat kurasi ledger JEPIN.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linen text-espresso flex flex-col font-sans selection:bg-sage/20 selection:text-sage-deep">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-espresso text-linen px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 border border-linen/20 transition-all">
          <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. EDITORIAL HEADER */}
      <header className="sticky top-0 z-40 bg-linen/95 backdrop-blur-md border-b border-espresso/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-espresso text-linen flex items-center justify-center font-serif font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
              J
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-espresso leading-none">
                  JEPIN
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-ecru border border-espresso/15 text-espresso-light">
                  Editorial Ledger
                </span>
                {/* Supabase status badge */}
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    isSupabaseOnline
                      ? "bg-sage/15 text-sage-deep border-sage/30"
                      : "bg-amber/15 text-amber-deep border-amber/30"
                  }`}
                  title={
                    isSupabaseOnline
                      ? "Supabase Connected & Live"
                      : "Menunggu tabel SQL di Supabase (fallback ke local cache)"
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSupabaseOnline ? "bg-sage" : "bg-amber"
                    }`}
                  />
                  <span>{isSupabaseOnline ? "Supabase Live" : "Local Sync"}</span>
                </span>
              </div>
              <span className="text-[11px] text-espresso-light font-medium tracking-tight">
                Jejak Pintar &bull; Smart Consumption Tracker
              </span>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsAuditCardModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-sage/40 hover:border-sage text-sage-deep font-semibold text-xs transition-colors items-center gap-1.5 bg-sage/10 flex"
              title="Lihat & Bagikan Kartu Bukti Hemat"
            >
              <span>🔖 Bukti Hemat</span>
            </button>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-espresso/20 hover:border-espresso text-espresso font-semibold text-xs transition-colors items-center gap-1.5 bg-ecru/60 flex"
            >
              <span>+ Kategori Baru</span>
            </button>
            <button
              onClick={() => setIsProductModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sage hover:bg-sage-deep text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 hover:shadow-md"
            >
              <span className="text-base leading-none font-bold">+</span>
              <span>Tambah Produk</span>
            </button>
            {/* Authenticated User & Sign Out */}
            <div className="flex items-center gap-2 pl-3 border-l border-espresso/15">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full border border-espresso/20 object-cover shadow-2xs"
                  title={currentUser?.email || userName}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full bg-espresso text-linen flex items-center justify-center text-xs font-bold font-serif shadow-2xs"
                  title={currentUser?.email || userName}
                >
                  {userInitials}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-[11px] font-bold text-espresso max-w-[120px] truncate leading-tight">
                  {userName}
                </span>
                <span className="text-[10px] text-espresso-light truncate max-w-[120px] leading-tight">
                  {currentUser?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-2.5 py-1.5 rounded-lg border border-espresso/15 hover:border-terracotta hover:bg-terracotta/10 text-espresso-light hover:text-terracotta text-xs font-semibold transition-colors"
                title="Keluar dari akun"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
        {/* RECAP BANNER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sage-deep via-[#235841] to-espresso text-linen rounded-3xl p-6 sm:p-8 shadow-md border border-sage-deep/40 mb-8">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold uppercase tracking-widest mb-3 backdrop-blur-xs border border-white/10">
                <span>🛡️</span>
                <span>Audit Penghematan Otomatis</span>
              </div>
              <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2">
                Rp {stats.totalSaved.toLocaleString("id-ID")}
              </div>
              <p className="text-sm text-linen/85 leading-relaxed">
                Modal konsumsi yang berhasil diselamatkan dari{" "}
                <strong className="text-white underline decoration-sage decoration-2">
                  {stats.zonk} produk zonk
                </strong>
                . Catatan evaluasi objektif mencegah kamu mengulangi pembelian mengecewakan yang sama.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 self-start md:self-auto">
              <button
                onClick={() => setIsAuditCardModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-linen text-sage-deep font-bold text-xs hover:bg-ecru transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>🔖 Bagikan Bukti Hemat</span>
                <span>&rarr;</span>
              </button>
              <button
                onClick={() => {
                  setFilterState("zonk");
                  setSelectedCategory("Semua");
                }}
                className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-medium text-xs transition-all border border-white/20 text-center"
              >
                Lihat Blacklist Zonk ({stats.zonk})
              </button>
            </div>
          </div>
        </div>

        {/* 4 LIFECYCLE CLASSIFICATION GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* 01 Repurchase */}
          <button
            onClick={() =>
              setFilterState(filterState === "repurchase" ? "all" : "repurchase")
            }
            className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              filterState === "repurchase"
                ? "ring-2 ring-sage border-sage bg-ecru shadow-sm"
                : "bg-ecru/60 border-espresso/10 hover:border-espresso/30 hover:bg-ecru"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="num-badge bg-linen text-sage-deep border-sage">
                01
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sage/15 text-sage-deep">
                {stats.repurchase} Item
              </span>
            </div>
            <div className="font-serif font-bold text-base text-espresso">
              Wajib Beli Lagi
            </div>
            <div className="text-[11px] text-espresso-light mt-1">
              Skor &ge; 9.0 &bull; Terverifikasi
            </div>
          </button>

          {/* 02 Zonk */}
          <button
            onClick={() =>
              setFilterState(filterState === "zonk" ? "all" : "zonk")
            }
            className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              filterState === "zonk"
                ? "ring-2 ring-terracotta border-terracotta bg-ecru shadow-sm"
                : "bg-ecru/60 border-espresso/10 hover:border-espresso/30 hover:bg-ecru"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="num-badge bg-linen text-terracotta border-terracotta">
                02
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-terracotta/15 text-terracotta">
                {stats.zonk} Item
              </span>
            </div>
            <div className="font-serif font-bold text-base text-espresso">
              Terbukti Zonk
            </div>
            <div className="text-[11px] text-espresso-light mt-1">
              Blacklist &bull; Hindari Re-buy
            </div>
          </button>

          {/* 03 Wishlist */}
          <button
            onClick={() =>
              setFilterState(filterState === "wishlist" ? "all" : "wishlist")
            }
            className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              filterState === "wishlist"
                ? "ring-2 ring-amber border-amber bg-ecru shadow-sm"
                : "bg-ecru/60 border-espresso/10 hover:border-espresso/30 hover:bg-ecru"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="num-badge bg-linen text-amber-deep border-amber">
                03
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber/15 text-amber-deep">
                {stats.wishlist} Item
              </span>
            </div>
            <div className="font-serif font-bold text-base text-espresso">
              Wishlist Terencana
            </div>
            <div className="text-[11px] text-espresso-light mt-1">
              Cooling-off jeda 7 hari
            </div>
          </button>

          {/* 04 Testing */}
          <button
            onClick={() =>
              setFilterState(filterState === "testing" ? "all" : "testing")
            }
            className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              filterState === "testing"
                ? "ring-2 ring-indigo border-indigo bg-ecru shadow-sm"
                : "bg-ecru/60 border-espresso/10 hover:border-espresso/30 hover:bg-ecru"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="num-badge bg-linen text-indigo border-indigo">
                04
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo/15 text-indigo">
                {stats.testing} Item
              </span>
            </div>
            <div className="font-serif font-bold text-base text-espresso">
              Sedang Diuji
            </div>
            <div className="text-[11px] text-espresso-light mt-1">
              Observasi aktif 14 hari
            </div>
          </button>
        </div>

        {/* SEARCH, SORT & CATEGORY BAR */}
        <div className="bg-ecru/80 rounded-2xl p-4 sm:p-5 border border-espresso/10 mb-8 space-y-4 shadow-xs">
          {/* Top Row: Search Input & Sort Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso-light text-sm">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, catatan rasa, SPL, bahan, atau alasan zonk..."
                className="w-full pl-9 pr-4 py-2.5 bg-linen border border-espresso/15 rounded-xl text-xs sm:text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-linen px-3 py-1.5 rounded-xl border border-espresso/15">
              <span className="text-[11px] font-bold uppercase tracking-wider text-espresso-light whitespace-nowrap">
                Urutkan:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs font-semibold text-espresso focus:outline-none cursor-pointer"
              >
                <option value="latest">Terbaru Ditambahkan</option>
                <option value="score-desc">Skor Kepuasan Tertinggi</option>
                <option value="saved-desc">Penghematan Terbesar</option>
                <option value="price-asc">Harga Terendah &rarr; Tertinggi</option>
                <option value="price-desc">Harga Tertinggi &rarr; Terendah</option>
              </select>
            </div>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-3 py-2 text-xs font-bold text-terracotta hover:underline self-end sm:self-auto"
              >
                Clear
              </button>
            )}
          </div>

          {/* Bottom Row: Horizontal Category Pills */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 pt-1">
            <div className="flex items-center gap-2 flex-nowrap">
              <button
                onClick={() => setSelectedCategory("Semua")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === "Semua"
                    ? "bg-espresso text-linen shadow-xs"
                    : "bg-linen text-espresso-light hover:text-espresso border border-espresso/15"
                }`}
              >
                Semua ({products.length})
              </button>

              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedCategory === cat
                        ? "bg-espresso text-linen shadow-xs"
                        : "bg-linen text-espresso-light hover:text-espresso border border-espresso/15"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setCategoryModalTab("list");
                  setIsCategoryModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border border-dashed border-espresso/30 text-espresso-light hover:text-espresso hover:border-espresso bg-linen/50 transition-colors flex items-center gap-1.5"
                title="Kelola, tambah, atau hapus kategori"
              >
                <span>⚙️ Kelola Kategori</span>
              </button>
            </div>

            {(filterState !== "all" ||
              selectedCategory !== "Semua" ||
              searchQuery ||
              sortBy !== "latest") && (
              <button
                onClick={() => {
                  setFilterState("all");
                  setSelectedCategory("Semua");
                  setSearchQuery("");
                  setSortBy("latest");
                }}
                className="text-xs font-bold text-terracotta hover:underline whitespace-nowrap pl-2"
              >
                Reset Filter &times;
              </button>
            )}
          </div>
        </div>

        {/* 5. PRODUCT CARDS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-ecru/40 rounded-3xl border border-dashed border-espresso/20 p-8">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-serif font-bold text-xl text-espresso mb-1">
              Tidak ada produk ditemukan
            </p>
            <p className="text-xs sm:text-sm text-espresso-light max-w-sm mx-auto mb-6">
              Belum ada produk yang cocok dengan filter atau kata kunci ini.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setFilterState("all");
                  setSelectedCategory("Semua");
                  setSearchQuery("");
                  setSortBy("latest");
                }}
                className="px-4 py-2 rounded-xl border border-espresso/20 text-xs font-semibold hover:bg-ecru"
              >
                Reset Filter
              </button>
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-sage text-white text-xs font-semibold hover:bg-sage-deep"
              >
                + Tambah Barang Baru
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="group bg-ecru rounded-2xl overflow-hidden shadow-xs border border-espresso/10 flex flex-col justify-between hover:shadow-lg hover:border-espresso/30 transition-all duration-300"
              >
                <div>
                  {/* Optional Image Header */}
                  {item.imageUrl && (
                    <div className="relative w-full h-44 bg-espresso/5 overflow-hidden border-b border-espresso/10">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[11px] font-bold text-espresso bg-linen/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-espresso/10 shadow-xs">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        {item.state === "repurchase" && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-sage text-white shadow-xs">
                            ✓ Worth to Buy
                          </span>
                        )}
                        {item.state === "zonk" && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-terracotta text-white shadow-xs">
                            ✕ Zonk
                          </span>
                        )}
                        {item.state === "wishlist" && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber text-white shadow-xs">
                            ⏳ Wishlist
                          </span>
                        )}
                        {item.state === "testing" && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-indigo text-white shadow-xs">
                            🧪 Diuji
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Badge row if no image */}
                    {!item.imageUrl && (
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold text-espresso-light bg-linen px-2.5 py-1 rounded-md border border-espresso/10">
                          {item.category}
                        </span>

                        {item.state === "repurchase" && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-sage/15 text-sage-deep flex items-center gap-1.5 border border-sage/20">
                            <span>✓ Wajib Beli</span>
                            {item.repurchaseCount && (
                              <span className="text-[10px] bg-sage text-white font-bold px-1.5 rounded-full">
                                {item.repurchaseCount}x
                              </span>
                            )}
                          </span>
                        )}

                        {item.state === "zonk" && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-terracotta/15 text-terracotta border border-terracotta/20">
                            ✕ Zonk
                          </span>
                        )}

                        {item.state === "wishlist" && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber/15 text-amber-deep border border-amber/20">
                            ⏳ Wishlist
                          </span>
                        )}

                        {item.state === "testing" && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo/15 text-indigo border border-indigo/20">
                            🧪 Diuji
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title & Price */}
                    <h3 className="font-serif font-bold text-lg text-espresso mb-1 group-hover:text-sage-deep transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold text-espresso">
                        Rp {item.price.toLocaleString("id-ID")}
                      </span>
                      {item.score && (
                        <span className="text-xs font-serif font-bold text-sage-deep bg-linen px-2 py-0.5 rounded border border-sage/20">
                          ★ {item.score.toFixed(1)}/10
                        </span>
                      )}
                    </div>

                    {/* Zonk Tags Pill */}
                    {item.zonkTags && item.zonkTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.zonkTags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-semibold px-2 py-0.5 rounded bg-terracotta/10 text-terracotta border border-terracotta/15"
                          >
                            [{tag}]
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Testing Observation Bar */}
                    {item.state === "testing" && (
                      <div className="mb-3 bg-linen p-3 rounded-xl border border-espresso/10">
                        <div className="flex justify-between text-xs text-espresso-light font-medium mb-1.5">
                          <span>{item.testingDays || "Masa Observasi"}</span>
                          <span className="font-bold text-indigo">
                            {item.testingProgress || 40}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-espresso/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo rounded-full transition-all duration-300"
                            style={{ width: `${item.testingProgress || 40}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Wishlist Cooling Info */}
                    {item.state === "wishlist" && (
                      <div className="mb-3 text-xs bg-amber/10 text-amber-deep px-3 py-2 rounded-xl font-medium border border-amber/20 flex items-center gap-1.5">
                        <span>⏳</span>
                        <span>{item.coolingDays || "Jeda perenungan 7 hari aktif"}</span>
                      </div>
                    )}

                    {/* Sensory Field Notes */}
                    <div className="bg-linen p-3.5 rounded-xl border border-espresso/10 mb-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-espresso-light mb-1 flex items-center justify-between">
                        <span>Catatan Sensoris:</span>
                        <span className="text-[10px] text-espresso-light/60 font-mono">
                          {item.dateAdded || "Edisi 01"}
                        </span>
                      </div>
                      <p className="text-xs text-espresso leading-relaxed italic">
                        &ldquo;{item.sensoryNotes}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-espresso/10 flex flex-col gap-2.5">
                    {/* PRIMARY ACTION BUTTON: EVALUATION POPUP MODAL */}
                    {(item.state === "wishlist" || item.state === "testing") && (
                      <button
                        onClick={() => openEvaluationModal(item)}
                        className="w-full py-2.5 px-3 rounded-xl bg-espresso hover:bg-espresso-light text-linen text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <span>⚖️ Evaluasi Kelayakan (Worth to Buy?)</span>
                      </button>
                    )}

                    {item.state === "repurchase" && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-espresso-light font-medium">
                          Repeat buy: <strong>{item.repurchaseCount || 1}x</strong>
                        </span>
                        <button
                          onClick={() =>
                            updateProductStateQuick(item.id, "repurchase")
                          }
                          className="px-3 py-1.5 rounded-lg bg-sage/15 text-sage-deep font-bold hover:bg-sage hover:text-white transition-colors"
                        >
                          + Beli Lagi ({item.repurchaseCount || 1}x)
                        </button>
                      </div>
                    )}

                    {item.state === "zonk" && (
                      <div className="flex items-center justify-between text-xs bg-terracotta/10 px-3 py-2 rounded-lg border border-terracotta/15">
                        <span className="text-terracotta font-bold">
                          Hemat: +Rp{" "}
                          {(item.savedAmount || item.price).toLocaleString(
                            "id-ID"
                          )}
                        </span>
                        <button
                          onClick={() => openEvaluationModal(item)}
                          className="text-[11px] underline text-terracotta hover:text-rose font-semibold"
                        >
                          Ubah Evaluasi
                        </button>
                      </div>
                    )}

                    {/* Secondary Quick Action Bar */}
                    <div className="flex items-center justify-between text-[11px] text-espresso-light pt-1">
                      <span className="text-[10px] uppercase font-bold text-espresso-light/60 tracking-wider">
                        Quick State:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEvaluationModal(item)}
                          className="px-1.5 py-0.5 rounded hover:bg-sage/10 hover:text-sage-deep font-semibold"
                        >
                          Review
                        </button>
                        <span className="text-espresso-light/30">&bull;</span>
                        <button
                          onClick={() => deleteProduct(item.id, item.name)}
                          className="text-terracotta/70 hover:text-terracotta font-bold"
                          title="Hapus dari ledger"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. EDITORIAL MANIFESTO */}
        <div className="my-12 py-10 px-8 bg-ecru/50 rounded-3xl border border-espresso/10 text-center max-w-3xl mx-auto shadow-xs">
          <span className="text-2xl mb-2 block">✒️</span>
          <blockquote className="font-serif italic text-xl sm:text-2xl text-espresso mb-3 leading-snug">
            &ldquo;Belanja cerdas bukan soal mencari yang paling murah, melainkan berhenti mengulangi kekecewaan yang sama.&rdquo;
          </blockquote>
          <cite className="text-xs uppercase tracking-widest font-bold text-sage-deep not-italic">
            &mdash; Manifesto Konsumsi Sadar JEPIN
          </cite>
        </div>
      </main>

      {/* POPUP: KARTU BUKTI HEMAT (SHAREABLE AUDIT CARD) */}
      {isAuditCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-espresso/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-linen rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-espresso/20 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-espresso/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base">🔖</span>
                <span className="font-serif font-bold text-lg text-espresso">
                  Kartu Bukti Hemat &bull; Audit Ledger
                </span>
              </div>
              <button
                onClick={() => setIsAuditCardModalOpen(false)}
                className="w-8 h-8 rounded-full bg-ecru flex items-center justify-center text-espresso font-bold hover:bg-espresso hover:text-linen transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Editorial Certificate Card */}
            <div className="bg-gradient-to-b from-ecru to-linen rounded-2xl p-6 border-2 border-espresso/15 shadow-sm space-y-4 mb-5 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sage-deep">
                    JEPIN CONSUMPTION AUDIT
                  </span>
                  <h3 className="font-serif font-bold text-xl text-espresso">
                    Sertifikat Rem Konsumsi
                  </h3>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-sage/15 border border-sage/30 text-sage-deep text-[10px] font-bold uppercase tracking-wider">
                  Verified Safe
                </div>
              </div>

              {/* Big Saved Box */}
              <div className="bg-linen p-4 rounded-xl border border-espresso/10 text-center">
                <div className="text-[11px] text-espresso-light font-semibold uppercase tracking-wider mb-1">
                  Total Modal Berhasil Diamankan
                </div>
                <div className="font-serif font-black text-3xl sm:text-4xl text-sage-deep tracking-tight">
                  Rp {stats.totalSaved.toLocaleString("id-ID")}
                </div>
                <div className="text-xs text-espresso-light mt-1">
                  Mencegah <strong>{stats.zonk} pembelian ulang produk zonk</strong>
                </div>
              </div>

              {/* Blacklist Summary List */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-espresso-light mb-2">
                  Daftar Barang Zonk yang Diblacklist:
                </div>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {stats.zonkItems.length === 0 ? (
                    <p className="text-xs text-espresso-light italic">
                      Belum ada produk zonk yang tercatat.
                    </p>
                  ) : (
                    stats.zonkItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-linen/80 p-2.5 rounded-lg border border-terracotta/20 flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-espresso">{item.name}</div>
                          <div className="text-[11px] text-terracotta font-medium">
                            {item.zonkTags?.join(", ") || "Mengecewakan"}
                          </div>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <span className="font-bold text-terracotta">
                            +Rp {item.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-espresso/10 flex items-center justify-between text-[11px] text-espresso-light font-medium">
                <span>Metode: Post-Purchase Audit &amp; Sensory Ledger</span>
                <span className="font-mono text-[10px]">app.jepin.id</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCopyAuditSummary}
                className="flex-1 py-2.5 rounded-xl bg-espresso hover:bg-espresso-light text-linen font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>📋 Salin Ringkasan Teks</span>
              </button>
              <button
                onClick={() => setIsAuditCardModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-espresso/20 text-xs font-semibold hover:bg-ecru"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 1: EVALUASI KELAYAKAN (WORTH TO BUY OR ZONK) */}
      {isEvaluationModalOpen && activeItemForEval && (
        <div className="fixed inset-0 z-50 bg-espresso/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-linen rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-espresso/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-espresso/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sage-deep">
                  Audit Keputusan Belanja
                </span>
                <h2 className="font-serif font-bold text-xl text-espresso">
                  Evaluasi Kelayakan Produk
                </h2>
              </div>
              <button
                onClick={() => setIsEvaluationModalOpen(false)}
                className="w-8 h-8 rounded-full bg-ecru flex items-center justify-center text-espresso font-bold hover:bg-espresso hover:text-linen transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Target Product Summary */}
            <div className="bg-ecru p-3.5 rounded-xl border border-espresso/10 mb-5 flex items-center gap-3">
              {activeItemForEval.imageUrl ? (
                <img
                  src={activeItemForEval.imageUrl}
                  alt={activeItemForEval.name}
                  className="w-12 h-12 rounded-lg object-cover border border-espresso/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-linen flex items-center justify-center text-lg border border-espresso/10">
                  📦
                </div>
              )}
              <div>
                <h4 className="font-serif font-bold text-sm text-espresso">
                  {activeItemForEval.name}
                </h4>
                <div className="text-xs text-espresso-light">
                  {activeItemForEval.category} &bull; Rp{" "}
                  {activeItemForEval.price.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4">
              {/* Decision Selector */}
              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-2">
                  Tentukan Keputusan:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEvalDecision("worth")}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      evalDecision === "worth"
                        ? "bg-sage/15 border-sage text-sage-deep ring-2 ring-sage shadow-xs"
                        : "bg-ecru border-espresso/15 text-espresso hover:bg-ecru/80"
                    }`}
                  >
                    <div className="font-serif font-bold text-sm mb-1 flex items-center gap-1.5">
                      <span>✓</span>
                      <span>Worth to Buy!</span>
                    </div>
                    <div className="text-[10px] text-espresso-light">
                      Lolos verifikasi. Masuk status Wajib Beli Lagi.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvalDecision("zonk")}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      evalDecision === "zonk"
                        ? "bg-terracotta/15 border-terracotta text-terracotta ring-2 ring-terracotta shadow-xs"
                        : "bg-ecru border-espresso/15 text-espresso hover:bg-ecru/80"
                    }`}
                  >
                    <div className="font-serif font-bold text-sm mb-1 flex items-center gap-1.5">
                      <span>✕</span>
                      <span>Terbukti Zonk</span>
                    </div>
                    <div className="text-[10px] text-espresso-light">
                      Mengecewakan. Blacklist selamanya dari re-buy.
                    </div>
                  </button>
                </div>
              </div>

              {/* Worth to buy: Score */}
              {evalDecision === "worth" ? (
                <div>
                  <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                    Skor Kepuasan (1.0 - 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={evalScore}
                    onChange={(e) => setEvalScore(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-ecru border border-espresso/20 rounded-xl text-sm font-serif font-bold text-espresso focus:outline-none focus:border-sage"
                  />
                </div>
              ) : (
                /* Zonk: Reason tags */
                <div>
                  <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                    Alasan Zonk (Pisahkan Koma)
                  </label>
                  <input
                    type="text"
                    value={evalZonkTags}
                    onChange={(e) => setEvalZonkTags(e.target.value)}
                    placeholder="SPL Lemah, Bikin Jerawatan, Terlalu Manis"
                    className="w-full px-3.5 py-2.5 bg-ecru border border-terracotta/30 rounded-xl text-sm text-espresso focus:outline-none focus:border-terracotta"
                  />
                  <div className="mt-1 text-[11px] text-terracotta font-medium">
                    Hemat +Rp {activeItemForEval.price.toLocaleString("id-ID")}{" "}
                    masuk ke total penghematan zonk!
                  </div>
                </div>
              )}

              {/* Notes Input */}
              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                  Catatan Evaluasi &amp; Pengalaman Konsumsi
                </label>
                <textarea
                  rows={3}
                  required
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="Tulis alasan objektif: rasa, tekstur, ketahanan, atau reaksi pemakaian..."
                  className="w-full px-3.5 py-2 bg-ecru border border-espresso/20 rounded-xl text-xs sm:text-sm text-espresso focus:outline-none focus:border-sage"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEvaluationModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-espresso/20 text-xs font-semibold hover:bg-ecru"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-colors shadow-xs ${
                    evalDecision === "worth"
                      ? "bg-sage hover:bg-sage-deep"
                      : "bg-terracotta hover:bg-rose"
                  }`}
                >
                  Simpan Keputusan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP 2: MODAL TAMBAH PRODUK + UPLOAD GAMBAR */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-espresso/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-linen rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-espresso/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-espresso/10">
              <div>
                <h2 className="font-serif font-bold text-2xl text-espresso">
                  Catat ke Ledger JEPIN
                </h2>
                <p className="text-xs text-espresso-light">
                  Tambahkan barang baru, evaluasi sensoris, foto, atau masukkan ke wishlist.
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-ecru flex items-center justify-center text-espresso font-bold hover:bg-espresso hover:text-linen transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* Product Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                  Foto Produk (Upload atau URL)
                </label>
                <div className="flex items-center gap-3">
                  {formImagePreview ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-espresso/20 flex-shrink-0">
                      <img
                        src={formImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormImagePreview("");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute inset-0 bg-espresso/60 text-white text-[10px] font-bold flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-ecru border border-dashed border-espresso/30 flex items-center justify-center text-xl flex-shrink-0">
                      📷
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="block w-full text-xs text-espresso-light file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-espresso file:text-linen hover:file:bg-espresso-light cursor-pointer"
                    />
                    <input
                      type="url"
                      value={formImagePreview}
                      onChange={(e) => setFormImagePreview(e.target.value)}
                      placeholder="Atau tempel link gambar (https://...)"
                      className="w-full px-3 py-1.5 bg-ecru border border-espresso/20 rounded-lg text-xs text-espresso focus:outline-none focus:border-sage"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                  Nama Barang / Produk *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Kopi Flores Bajawa, Parfum Decant, Moisturizer"
                  className="w-full px-3.5 py-2.5 bg-ecru border border-espresso/20 rounded-xl text-sm text-espresso focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-espresso uppercase tracking-wider">
                      Kategori
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[10px] font-bold text-sage-deep hover:underline"
                    >
                      + Buat Baru
                    </button>
                  </div>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-ecru border border-espresso/20 rounded-xl text-xs sm:text-sm text-espresso focus:outline-none focus:border-sage"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                    Harga Estimasi (Rp)
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="Contoh: 85000"
                    className="w-full px-3.5 py-2.5 bg-ecru border border-espresso/20 rounded-xl text-sm text-espresso focus:outline-none focus:border-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                  Status Siklus Awal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormState("wishlist")}
                    className={`p-3 text-xs font-bold rounded-xl border text-left transition-all ${
                      formState === "wishlist"
                        ? "bg-amber/15 border-amber text-amber-deep ring-2 ring-amber/50"
                        : "bg-ecru border-espresso/10 text-espresso hover:bg-ecru/80"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>⏳</span>
                      <span>03 Wishlist</span>
                    </div>
                    <div className="text-[10px] text-espresso-light font-normal">
                      Masa cooling-off 7 hari
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormState("testing")}
                    className={`p-3 text-xs font-bold rounded-xl border text-left transition-all ${
                      formState === "testing"
                        ? "bg-indigo/15 border-indigo text-indigo ring-2 ring-indigo/50"
                        : "bg-ecru border-espresso/10 text-espresso hover:bg-ecru/80"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>🧪</span>
                      <span>04 Sedang Diuji</span>
                    </div>
                    <div className="text-[10px] text-espresso-light font-normal">
                      Masa observasi 14 hari
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormState("repurchase")}
                    className={`p-3 text-xs font-bold rounded-xl border text-left transition-all ${
                      formState === "repurchase"
                        ? "bg-sage/15 border-sage text-sage-deep ring-2 ring-sage/50"
                        : "bg-ecru border-espresso/10 text-espresso hover:bg-ecru/80"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>✓</span>
                      <span>01 Wajib Beli</span>
                    </div>
                    <div className="text-[10px] text-espresso-light font-normal">
                      Skor &ge; 9.0, repurchase
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormState("zonk")}
                    className={`p-3 text-xs font-bold rounded-xl border text-left transition-all ${
                      formState === "zonk"
                        ? "bg-terracotta/15 border-terracotta text-terracotta ring-2 ring-terracotta/50"
                        : "bg-ecru border-espresso/10 text-espresso hover:bg-ecru/80"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>✕</span>
                      <span>02 Terbukti Zonk</span>
                    </div>
                    <div className="text-[10px] text-espresso-light font-normal">
                      Blacklist belanja ulang
                    </div>
                  </button>
                </div>
              </div>

              {formState === "zonk" && (
                <div>
                  <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                    Alasan Zonk (Pisahkan Koma)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="SPL Lemah, Bikin Jerawatan, Terlalu Manis"
                    className="w-full px-3.5 py-2.5 bg-ecru border border-terracotta/30 rounded-xl text-sm text-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                  Catatan Sensoris &amp; Parameter Objektif
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Kopi: rasio 1:15, plum notes. Parfum: SPL 4 jam, drydown vanila. Skincare: pH 5.5, watery."
                  className="w-full px-3.5 py-2.5 bg-ecru border border-espresso/20 rounded-xl text-xs sm:text-sm text-espresso focus:outline-none focus:border-sage"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-espresso/20 text-espresso font-semibold text-xs hover:bg-ecru transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sage hover:bg-sage-deep text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Simpan ke Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP 3: MODAL KELOLA KATEGORI (TAMBAH, UBAH, HAPUS) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-espresso/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-linen rounded-3xl max-w-md w-full p-6 shadow-2xl border border-espresso/20">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-espresso/10">
              <h3 className="font-serif font-bold text-lg text-espresso">
                Kelola Kategori
              </h3>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
                className="w-7 h-7 rounded-full bg-ecru flex items-center justify-center text-espresso font-bold hover:bg-espresso hover:text-linen transition-colors text-xs"
              >
                &times;
              </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex gap-2 p-1 bg-ecru rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCategoryModalTab("list")}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  categoryModalTab === "list"
                    ? "bg-espresso text-linen shadow-xs"
                    : "text-espresso-light hover:text-espresso"
                }`}
              >
                Daftar Kategori ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryModalTab("add")}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  categoryModalTab === "add"
                    ? "bg-espresso text-linen shadow-xs"
                    : "text-espresso-light hover:text-espresso"
                }`}
              >
                + Tambah Baru
              </button>
            </div>

            {categoryModalTab === "list" ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {categories.length === 0 ? (
                  <p className="text-xs text-espresso-light text-center py-6">
                    Belum ada kategori kustom. Klik "+ Tambah Baru".
                  </p>
                ) : (
                  categories.map((cat) => {
                    const count = products.filter((p) => p.category === cat).length;
                    const isEditing = editingCategory === cat;

                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-2.5 bg-ecru/70 rounded-xl border border-espresso/10"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={editCategoryNameInput}
                              onChange={(e) => setEditCategoryNameInput(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs bg-linen border border-espresso/20 rounded-lg text-espresso focus:outline-none focus:border-sage"
                            />
                            <button
                              type="button"
                              onClick={() => handleRenameCategory(cat, editCategoryNameInput)}
                              className="px-2 py-1 bg-sage text-white text-[10px] font-bold rounded-md hover:bg-sage-deep"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategory(null)}
                              className="px-2 py-1 bg-espresso/10 text-espresso text-[10px] font-semibold rounded-md hover:bg-espresso/20"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-espresso">
                                {cat}
                              </span>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-espresso/10 text-espresso-light">
                                {count} barang
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setEditCategoryNameInput(cat);
                                }}
                                className="px-2 py-1 text-[11px] font-semibold text-espresso-light hover:text-espresso rounded hover:bg-linen transition-colors"
                                title="Ubah nama"
                              >
                                ✏️ Ubah
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat)}
                                className="px-2 py-1 text-[11px] font-semibold text-terracotta hover:text-red-700 rounded hover:bg-terracotta/10 transition-colors"
                                title="Hapus kategori"
                              >
                                🗑️ Hapus
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                    Pilih Ikon / Emoji
                  </label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {[
                      "🍵",
                      "📚",
                      "👟",
                      "🎮",
                      "🌿",
                      "👕",
                      "🍷",
                      "📱",
                      "🍞",
                      "🕯️",
                      "🎨",
                      "🚲",
                    ].map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setNewCategoryEmoji(emo)}
                        className={`w-9 h-9 rounded-lg border text-lg flex items-center justify-center transition-all ${
                          newCategoryEmoji === emo
                            ? "bg-sage/20 border-sage scale-110 shadow-xs"
                            : "bg-ecru border-espresso/10 hover:border-espresso/30"
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1.5">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Contoh: Matcha Artisan, Sneakers, Buku"
                    className="w-full px-3.5 py-2.5 bg-ecru border border-espresso/20 rounded-xl text-sm text-espresso focus:outline-none focus:border-sage"
                  />
                </div>

                <div className="pt-2 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCategoryModalTab("list")}
                    className="flex-1 py-2 rounded-xl border border-espresso/20 text-xs font-semibold hover:bg-ecru"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-sage hover:bg-sage-deep text-white font-bold text-xs"
                  >
                    Tambah Kategori
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-espresso/10 py-8 px-6 text-center text-xs text-espresso-light">
        <p className="font-serif font-bold text-sm text-espresso mb-1">
          JEPIN (Jejak Pintar)
        </p>
        <p className="mb-2">
          Kurasi konsumsi mandiri. Menghitung setiap rupiah dengan integritas sensoris.
        </p>
        <p>&copy; 2024 JEPIN. Desain Warm Editorial Craft.</p>
      </footer>
    </div>
  );
}
