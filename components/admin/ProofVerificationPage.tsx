"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Hourglass,
  CheckCircle2,
  Ban,
  Search,
  Clock,
  Landmark,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Download,
  X,
  Check,
  AlertTriangle,
  Receipt,
  FileText,
  Printer,
  Sparkles,
} from "lucide-react";
import { PaymentProofItem, ProofFilterTab } from "@/types/proof";
import { createClient } from "@/lib/supabase/client";

interface ProofVerificationPageProps {
  initialProofs?: PaymentProofItem[];
  onShowToast?: (text: string, type?: "info" | "error" | "success") => void;
  onNavigateToBills?: () => void;
}

export const ProofVerificationPage: React.FC<ProofVerificationPageProps> = ({
  initialProofs,
  onShowToast,
  onNavigateToBills,
}) => {
  const supabase = createClient();

  // State
  const [proofs, setProofs] = useState<PaymentProofItem[]>(
    initialProofs && initialProofs.length > 0
      ? initialProofs
      : [
          {
            id: "1",
            invoice_number: "INV-2026-06-B04",
            tenant_name: "Azka Andya Safira",
            resident_name: "Azka Andya Safira",
            room_number: "B-04",
            floor: "Lantai 1",
            property_name: "Kost Yusi",
            amount: 1575000,
            bank_name: "BCA",
            bank_sender: "Bank BCA",
            account_sender: "630 - 01*-**26",
            sender_name: "ERICK G P",
            bank_receiver: "Bank Mandiri",
            account_receiver: "137-001928374-1",
            receiver_name: "Hj. Ratna Juwita (Kost Yusi)",
            time_transfer: "Hari ini, 14:15 (25m lalu)",
            transfer_date_time: "02 Mei 2026 09:56:27",
            period: "November 2026",
            tenant_message: "Sudah ditransfer dari BCA ya ibu, terima kasih banyak 🙏",
            reference_number: "B09D0932-2521-4ASE-A74E-EB081D18B667",
            status: "pending",
          },
          {
            id: "2",
            invoice_number: "INV-2026-06-B01",
            tenant_name: "Sarah Nabila",
            resident_name: "Sarah Nabila",
            room_number: "B-01",
            floor: "Lantai 1",
            property_name: "Kost Yusi",
            amount: 1500000,
            bank_name: "BCA",
            bank_sender: "Transfer BCA • KlikBCA",
            account_sender: "522 - 09*-**11",
            sender_name: "SARAH NABILA",
            bank_receiver: "Bank Mandiri",
            account_receiver: "137-001928374-1",
            receiver_name: "Hj. Ratna Juwita (Kost Yusi)",
            time_transfer: "Hari ini, 11:30 (3 jam lalu)",
            transfer_date_time: "02 Mei 2026 11:30:15",
            period: "November 2026",
            tenant_message: "Uang sewa bulan November sudah ditransfer ya bu, trims!",
            reference_number: "BCA7721-9921-2311-A891-FF0923881023",
            status: "pending",
          },
          {
            id: "3",
            invoice_number: "INV-2026-06-A01",
            tenant_name: "Riana",
            resident_name: "Riana",
            room_number: "A-01",
            floor: "Lantai 2",
            property_name: "Kost Yusi",
            amount: 1350000,
            bank_name: "Mandiri",
            bank_sender: "Transfer Mandiri",
            account_sender: "142 - 00*-**99",
            sender_name: "RIANA",
            bank_receiver: "Bank Mandiri",
            account_receiver: "137-001928374-1",
            receiver_name: "Hj. Ratna Juwita (Kost Yusi)",
            time_transfer: "Kemarin, 21:05",
            transfer_date_time: "01 Mei 2026 21:05:40",
            period: "November 2026",
            tenant_message: "Pembayaran sewa kamar A-01 via Livin Mandiri bu.",
            reference_number: "MDR9901-2026-0501-A12B-008819283744",
            status: "pending",
          },
          {
            id: "4",
            invoice_number: "INV-2026-06-B05",
            tenant_name: "Salma Ramadhani",
            resident_name: "Salma Ramadhani",
            room_number: "B-05",
            floor: "Lantai 1",
            property_name: "Kost Yusi",
            amount: 1500000,
            bank_name: "BRI",
            bank_sender: "Transfer BRI",
            account_sender: "001 - 22*-**88",
            sender_name: "SALMA RAMADHANI",
            bank_receiver: "Bank Mandiri",
            account_receiver: "137-001928374-1",
            receiver_name: "Hj. Ratna Juwita (Kost Yusi)",
            time_transfer: "Kemarin, 21:05",
            transfer_date_time: "01 Mei 2026 21:05:12",
            period: "November 2026",
            tenant_message: "Sudah ditransfer via BRIMO bu, mohon diverifikasi yaa.",
            reference_number: "BRI-20260501-88192300-TRX",
            status: "pending",
          },
          {
            id: "5",
            invoice_number: "INV-2026-06-A03",
            tenant_name: "Dinda Kirana",
            resident_name: "Dinda Kirana",
            room_number: "A-03",
            floor: "Lantai 2",
            property_name: "Kost Yusi",
            amount: 1995000,
            bank_name: "BCA",
            bank_sender: "Transfer BCA Mobile",
            account_sender: "711 - 29*-**14",
            sender_name: "DINDA KIRANA",
            bank_receiver: "Bank Mandiri",
            account_receiver: "137-001928374-1",
            receiver_name: "Hj. Ratna Juwita (Kost Yusi)",
            time_transfer: "3 hari lalu",
            transfer_date_time: "29 Apr 2026 15:40:00",
            period: "November 2026",
            tenant_message: "Ini bu bukti transfernya",
            reference_number: "BCA-REJECT-9921",
            status: "rejected",
            rejection_reason: "Struk tidak terlihat jelas",
          },
          {
            id: "6",
            invoice_number: "INV-2026-06-B02",
            tenant_name: "Ayu Lestari",
            resident_name: "Ayu Lestari",
            room_number: "B-02",
            floor: "Lantai 1",
            property_name: "Kost Yusi",
            amount: 1500000,
            bank_name: "BCA",
            bank_sender: "Transfer BCA",
            account_sender: "122 - 34*-**56",
            sender_name: "AYU LESTARI",
            bank_receiver: "Bank Mandiri",
            account_receiver: "137-001928374-1",
            receiver_name: "Hj. Ratna Juwita (Kost Yusi)",
            time_transfer: "4 hari lalu",
            transfer_date_time: "28 Apr 2026 10:15:00",
            period: "November 2026",
            tenant_message: "Sudah ditransfer ya bu Ratna.",
            reference_number: "BCA-APPR-0102",
            status: "approved",
          },
          {
            id: "7",
            invoice_number: "INV-2026-06-A02",
            tenant_name: "Nadia Salsabila",
            resident_name: "Nadia Salsabila",
            room_number: "A-02",
            floor: "Lantai 2",
            property_name: "Kost Yusi",
            amount: 1450000,
            bank_name: "Mandiri",
            bank_sender: "Transfer Mandiri",
            account_sender: "130 - 45*-**67",
            sender_name: "NADIA SALSABILA",
            bank_receiver: "Bank Mandiri",
            account_receiver: "137-001928374-1",
            receiver_name: "Hj. Ratna Juwita (Kost Yusi)",
            time_transfer: "5 hari lalu",
            transfer_date_time: "27 Apr 2026 14:20:00",
            period: "November 2026",
            tenant_message: "Lunas sewa Mei bu.",
            reference_number: "MDR-APPR-0103",
            status: "approved",
          },
          {
            id: "8",
            invoice_number: "INV-2026-06-B03",
            tenant_name: "Tasya Aurelia",
            resident_name: "Tasya Aurelia",
            room_number: "B-03",
            floor: "Lantai 1",
            property_name: "Kost Yusi",
            amount: 1550000,
            bank_name: "BNI",
            bank_sender: "Transfer BNI Mobile",
            account_sender: "038 - 11*-**45",
            sender_name: "TASYA AURELIA",
            bank_receiver: "Bank Mandiri",
            account_receiver: "137-001928374-1",
            receiver_name: "Hj. Ratna Juwita (Kost Yusi)",
            time_transfer: "6 hari lalu",
            transfer_date_time: "26 Apr 2026 08:45:00",
            period: "November 2026",
            tenant_message: "Sewa B-03 lunas bu.",
            reference_number: "BNI-APPR-0104",
            status: "approved",
          },
        ]
  );

  const [activeFilter, setActiveFilter] = useState<ProofFilterTab>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProofId, setSelectedProofId] = useState<string>("1");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("Struk tidak terlihat jelas / buram");
  const [customRejectNote, setCustomRejectNote] = useState("");
  const [isKwitansiModalOpen, setIsKwitansiModalOpen] = useState(false);
  const [issuedKwitansi, setIssuedKwitansi] = useState<PaymentProofItem | null>(null);

  // Sync with Supabase on mount
  React.useEffect(() => {
    async function fetchFromSupabase() {
      try {
        const { data, error } = await supabase
          .from("payment_proofs")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setProofs(data as PaymentProofItem[]);
          // Default select the first pending if available
          const firstPending = data.find((p) => p.status === "pending") || data[0];
          if (firstPending) {
            setSelectedProofId(firstPending.id);
          }
        }
      } catch (err) {
        console.error("Error loading payment proofs from Supabase:", err);
      }
    }
    fetchFromSupabase();
  }, [supabase]);

  // KPI Calculations matching screenshot
  const pendingProofs = useMemo(() => proofs.filter((p) => p.status === "pending"), [proofs]);
  const rejectedProofs = useMemo(() => proofs.filter((p) => p.status === "rejected"), [proofs]);
  const approvedProofs = useMemo(() => proofs.filter((p) => p.status === "approved"), [proofs]);

  const totalPendingAmount = useMemo(
    () => pendingProofs.reduce((sum, item) => sum + Number(item.amount), 0),
    [pendingProofs]
  );

  const totalRejectedAmount = useMemo(
    () => rejectedProofs.reduce((sum, item) => sum + Number(item.amount), 0),
    [rejectedProofs]
  );

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    return proofs.filter((item) => {
      // Filter by tab
      if (activeFilter === "pending" && item.status !== "pending") return false;
      if (activeFilter === "rejected" && item.status !== "rejected") return false;
      // All tab includes all

      // Filter by search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = item.tenant_name?.toLowerCase().includes(q) || item.resident_name?.toLowerCase().includes(q);
        const matchesRoom = item.room_number?.toLowerCase().includes(q);
        const matchesInvoice = item.invoice_number?.toLowerCase().includes(q);
        const matchesBank = item.bank_name?.toLowerCase().includes(q) || item.bank_sender?.toLowerCase().includes(q);
        return matchesName || matchesRoom || matchesInvoice || matchesBank;
      }
      return true;
    });
  }, [proofs, activeFilter, searchQuery]);

  // Selected proof object
  const selectedProof = useMemo(() => {
    return proofs.find((p) => p.id === selectedProofId) || filteredQueue[0] || proofs[0];
  }, [proofs, selectedProofId, filteredQueue]);

  // Current index in filtered queue for pagination
  const currentIndex = useMemo(() => {
    return filteredQueue.findIndex((p) => p.id === selectedProof?.id);
  }, [filteredQueue, selectedProof]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedProofId(filteredQueue[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQueue.length - 1) {
      setSelectedProofId(filteredQueue[currentIndex + 1].id);
    }
  };

  // Helper format currency
  const formatRupiah = (val: number) => {
    return "Rp " + val.toLocaleString("id-ID");
  };

  // Avatar initials and color helper
  const getAvatarProps = (name: string, index: number) => {
    const parts = name.trim().split(" ");
    const initials =
      parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();

    const colors = [
      { bg: "bg-blue-100", text: "text-blue-700" },
      { bg: "bg-purple-100", text: "text-purple-700" },
      { bg: "bg-rose-100", text: "text-rose-700" },
      { bg: "bg-emerald-100", text: "text-emerald-700" },
      { bg: "bg-amber-100", text: "text-amber-700" },
    ];
    return { initials, ...colors[index % colors.length] };
  };

  // Action: Approve Proof & Issue Receipt
  const handleApprove = async () => {
    if (!selectedProof) return;

    try {
      // 1. Update in Supabase payment_proofs
      await supabase
        .from("payment_proofs")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedProof.id);

      // 2. Also update corresponding bill in Supabase if exists
      if (selectedProof.invoice_number) {
        await supabase
          .from("bills")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            payment_method: selectedProof.bank_name || "Transfer Bank",
            updated_at: new Date().toISOString(),
          })
          .eq("invoice_number", selectedProof.invoice_number);
      }

      // 3. Update local state
      setProofs((prev) =>
        prev.map((item) =>
          item.id === selectedProof.id ? { ...item, status: "approved" } : item
        )
      );

      setIssuedKwitansi(selectedProof);
      setIsKwitansiModalOpen(true);
      onShowToast?.(`Bukti bayar ${selectedProof.tenant_name} disetujui & kuitansi resmi diterbitkan!`, "success");

      // Auto advance to next pending item if available
      const remainingPending = proofs.filter(
        (p) => p.status === "pending" && p.id !== selectedProof.id
      );
      if (remainingPending.length > 0) {
        setSelectedProofId(remainingPending[0].id);
      }
    } catch (err) {
      console.error("Error approving proof:", err);
      onShowToast?.("Terjadi kesalahan saat memverifikasi bukti pembayaran.", "error");
    }
  };

  // Action: Reject Proof
  const handleConfirmReject = async () => {
    if (!selectedProof) return;

    const finalReason = customRejectNote ? `${rejectReason}: ${customRejectNote}` : rejectReason;

    try {
      // 1. Update in Supabase
      await supabase
        .from("payment_proofs")
        .update({
          status: "rejected",
          rejection_reason: finalReason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedProof.id);

      // 2. Update local state
      setProofs((prev) =>
        prev.map((item) =>
          item.id === selectedProof.id
            ? { ...item, status: "rejected", rejection_reason: finalReason }
            : item
        )
      );

      setIsRejectModalOpen(false);
      setCustomRejectNote("");
      onShowToast?.(`Bukti pembayaran ditolak. Alasan: ${finalReason}`, "info");

      // Auto advance to next pending
      const remainingPending = proofs.filter(
        (p) => p.status === "pending" && p.id !== selectedProof.id
      );
      if (remainingPending.length > 0) {
        setSelectedProofId(remainingPending[0].id);
      }
    } catch (err) {
      console.error("Error rejecting proof:", err);
      onShowToast?.("Gagal menolak bukti pembayaran.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Verifikasi Bukti Pembayaran Penghuni
          </h1>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              {pendingProofs.length} BUKTI MENUNGGU TINDAKAN
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top 3 KPI Stat Cards matching Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Menunggu Verifikasi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_10px_25px_-10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              MENUNGGU VERIFIKASI
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {pendingProofs.length}
              </span>
              <span className="text-sm font-medium text-slate-500">transaksi</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Total {formatRupiah(totalPendingAmount)} menunggu validasi
            </p>
          </div>
        </div>

        {/* Card 2: Diverifikasi Hari Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_10px_25px_-10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              DIVERIFIKASI HARI INI
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {approvedProofs.length > 3 ? approvedProofs.length - 3 : 0}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {approvedProofs.length} total tervalidasi bulan ini
            </p>
          </div>
        </div>

        {/* Card 3: Ditolak Minggu Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_10px_25px_-10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              DITOLAK MINGGU INI
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-200/60 shadow-xs">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {rejectedProofs.length}
              </span>
              <span className="text-sm font-medium text-slate-500">transaksi</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 truncate">
              {formatRupiah(totalRejectedAmount)} (Struk tidak terlihat jelas)
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Queue List (5 cols on lg/xl) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari penghuni, kamar, ID invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("pending")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "pending"
                  ? "bg-[#4f46e5] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Menunggu ({pendingProofs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[#4f46e5] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({proofs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("rejected")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "rejected"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100"
              }`}
            >
              Ditolak ({rejectedProofs.length})
            </button>
          </div>

          {/* Queue Items List */}
          <div className="space-y-3">
            {filteredQueue.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Tidak ada antrean</p>
                <p className="text-xs text-slate-400 mt-0.5">Semua bukti telah selesai diproses.</p>
              </div>
            ) : (
              filteredQueue.map((item, idx) => {
                const isSelected = selectedProof?.id === item.id;
                const avatar = getAvatarProps(item.tenant_name, idx);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProofId(item.id)}
                    className={`bg-white rounded-2xl p-4 transition-all cursor-pointer border ${
                      isSelected
                        ? "border-[#4f46e5] ring-2 ring-indigo-500/10 shadow-md shadow-indigo-500/5"
                        : "border-slate-100 hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    {/* Header Row: Avatar, Name, Room, Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatar.bg} ${avatar.text}`}
                        >
                          {avatar.initials}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {item.tenant_name}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            Kamar {item.room_number} ({item.floor || "Lt. 1"}) • {item.property_name || "Kost Yusi"}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {item.status === "pending" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Menunggu Verifikasi
                          </span>
                        )}
                        {item.status === "approved" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Diverifikasi
                          </span>
                        )}
                        {item.status === "rejected" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Ditolak
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-3.5 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          NOMINAL TRANSFER
                        </span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block">
                          {formatRupiah(Number(item.amount))}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          WAKTU UGGAHAN
                        </span>
                        <span className="text-xs font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {item.time_transfer}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Footer Row */}
                    <div className="flex items-center justify-between text-xs mt-3 pt-2 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Landmark className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[11px] truncate max-w-[180px]">
                          {item.bank_sender || `Bank ${item.bank_name}`}
                        </span>
                      </div>
                      {isSelected ? (
                        <span className="text-indigo-600 font-bold text-xs flex items-center gap-0.5">
                          Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          Periode: {item.period || "November 2026"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* List Footer Count */}
            <p className="text-xs text-slate-400 text-center py-2 font-medium">
              Menampilkan {filteredQueue.length} dari {proofs.length} antrean prioritas verifikasi
            </p>
          </div>
        </div>

        {/* Right Column: Selected Proof Detail & Authentic Receipt Preview (7 cols on lg/xl) */}
        {selectedProof && (
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_15px_35px_-15px_rgba(79,70,229,0.06)] space-y-5">
            {/* Detail Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#4f46e5] uppercase tracking-wider block">
                  DETAIL PEMBAYARAN • {selectedProof.invoice_number || "INV-2026-06-B04"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {selectedProof.tenant_name}
                </h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Kamar {selectedProof.room_number} ({selectedProof.floor || "Lantai 1"}) • {selectedProof.property_name || "Kost Yusi"}
                </p>
              </div>

              {/* Navigation pagination buttons */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs text-slate-400 font-medium">
                  Antrean {currentIndex + 1} dari {filteredQueue.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex <= 0}
                    className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIndex >= filteredQueue.length - 1}
                    className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Box 1: PRATINJAU BUKTI TRANSFER RESMI */}
            <div className="bg-[#f0f6ff]/70 rounded-2xl p-4 sm:p-5 border border-indigo-100/70">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>PRATINJAU BUKTI TRANSFER RESMI</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFullScreen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Layar Penuh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onShowToast?.("Mengunduh bukti struk transfer resmi...", "info");
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh</span>
                  </button>
                </div>
              </div>

              {/* Authentic Indonesian Mobile Banking Receipt Preview Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 max-w-md mx-auto relative overflow-hidden font-sans">
                {/* Subtle bank watermark background */}
                <div className="absolute inset-0 pointer-events-none opacity-5 flex flex-wrap gap-8 items-center justify-center font-black text-2xl rotate-[-20deg]">
                  <span>BCA</span>
                  <span>BCA</span>
                  <span>BCA</span>
                  <span>BCA</span>
                  <span>BCA</span>
                </div>

                {/* Top BCA Logo & Status */}
                <div className="flex flex-col items-center text-center relative z-10 pb-4 border-b border-dashed border-slate-200">
                  <div className="text-xl font-black text-[#0060af] tracking-wider mb-2">
                    BCA
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 mb-2">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Transfer Berhasil</h3>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {selectedProof.transfer_date_time || "02 Mei 2026 09:56:27"}
                  </span>
                  <div className="mt-2 text-xl font-black text-slate-900 tracking-tight">
                    IDR {Number(selectedProof.amount).toLocaleString("id-ID")},00
                  </div>
                </div>

                {/* Receipt Details Table */}
                <div className="mt-4 space-y-2.5 text-xs relative z-10">
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 font-medium">Nama Penerima</span>
                    <span className="text-slate-900 font-bold text-right">
                      {selectedProof.sender_name || "ERICK G P"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 font-medium">Rekening Tujuan</span>
                    <span className="text-slate-900 font-bold text-right font-mono">
                      445 - 122 - 0940
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 font-medium">Jenis Transaksi</span>
                    <span className="text-slate-900 font-semibold text-right">
                      Transfer ke Rekening BCA
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 font-medium">Mata Uang Tujuan</span>
                    <span className="text-slate-900 font-medium text-right">
                      IDR - Indonesian Rupiah
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 font-medium">Dari Rekening</span>
                    <span className="text-slate-900 font-bold text-right font-mono">
                      {selectedProof.account_sender || "630 - 01*-**26"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 font-medium">Mata Uang Asal</span>
                    <span className="text-slate-900 font-medium text-right">
                      IDR - Indonesian Rupiah
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 font-medium">Nominal Tujuan</span>
                    <span className="text-slate-900 font-bold text-right">
                      IDR {Number(selectedProof.amount).toLocaleString("id-ID")},00
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 font-medium">Berita</span>
                    <span className="text-slate-900 font-medium text-right">
                      {selectedProof.note || "-"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-400 font-medium">No. Referensi</span>
                    <span className="text-slate-700 font-mono text-[10px] break-all text-right max-w-[200px]">
                      {selectedProof.reference_number || "B09D0932-2521-4ASE-A74E-EB081D18B667"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: INFORMASI REKENING & PESAN PENGHUNI */}
            <div className="bg-[#f8faff] rounded-2xl p-4 sm:p-5 border border-indigo-100/60 space-y-3">
              {/* Destination Bank Account */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedProof.bank_receiver || "Bank Mandiri"} {selectedProof.account_receiver || "137-001928374-1"}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    a.n. {selectedProof.receiver_name || "Hj. Ratna Juwita (Kost Yusi)"}
                  </p>
                </div>
              </div>

              {/* Message from Tenant */}
              <div className="bg-white rounded-xl p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  PESAN DARI PENGHUNI:
                </span>
                <p className="text-xs text-slate-700 font-medium italic mt-1 leading-relaxed">
                  "{selectedProof.tenant_message || "Sudah ditransfer dari BCA ya ibu, terima kasih banyak 🙏"}"
                </p>
              </div>

              {/* If already rejected, show reason */}
              {selectedProof.status === "rejected" && (
                <div className="bg-rose-50 rounded-xl p-3 border border-rose-200 text-xs text-rose-700">
                  <span className="font-bold">Alasan Penolakan: </span>
                  {selectedProof.rejection_reason || "Struk tidak terlihat jelas"}
                </div>
              )}
            </div>

            {/* Action Buttons: Tolak Bukti Bayar & Terima & Terbitkan Kuitansi */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-rose-50 text-rose-600 font-bold text-xs sm:text-sm border border-rose-200/80 hover:bg-rose-100 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Tolak Bukti Bayar</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                className="w-full sm:flex-1 px-6 py-3 rounded-2xl bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Terima & Terbitkan Kuitansi</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Fullscreen Receipt Modal */}
      {isFullScreen && selectedProof && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Detail Bukti Pembayaran
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-res receipt view */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-sans">
              <div className="text-center pb-4 border-b border-slate-200">
                <div className="text-2xl font-black text-[#0060af]">BCA</div>
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto my-2">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg">Transfer Berhasil</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedProof.transfer_date_time || "02 Mei 2026 09:56:27"}
                </p>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  IDR {Number(selectedProof.amount).toLocaleString("id-ID")},00
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nama Pengirim</span>
                  <span className="font-bold text-slate-800">{selectedProof.tenant_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Kamar</span>
                  <span className="font-bold text-slate-800">Kamar {selectedProof.room_number}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nama Penerima</span>
                  <span className="font-bold text-slate-800">{selectedProof.sender_name || "ERICK G P"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Rekening Tujuan</span>
                  <span className="font-mono font-bold text-slate-800">445 - 122 - 0940</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Bank Pengirim</span>
                  <span className="font-semibold text-slate-800">{selectedProof.bank_sender || selectedProof.bank_name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Nomor Referensi</span>
                  <span className="font-mono text-[10px] text-slate-600 break-all">{selectedProof.reference_number}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak
              </button>
              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Reject Modal */}
      {isRejectModalOpen && selectedProof && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Tolak Bukti Pembayaran
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedProof.tenant_name} • Kamar {selectedProof.room_number}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Pilih alasan penolakan untuk dikirimkan secara otomatis via notifikasi ke penghuni:
            </p>

            <div className="space-y-2">
              {[
                "Struk tidak terlihat jelas / buram",
                "Nominal transfer tidak sesuai tagihan",
                "Rekening tujuan salah / bukan rekening kost",
                "Bukti transfer duplikat / sudah pernah dipakai",
                "Tanggal atau jam transfer mencurigakan",
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                    rejectReason === reason
                      ? "border-rose-400 bg-rose-50/50 text-rose-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="reject_reason"
                    checked={rejectReason === reason}
                    onChange={() => setRejectReason(reason)}
                    className="accent-rose-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Catatan Tambahan (Opsional):
              </label>
              <textarea
                rows={2}
                placeholder="Tuliskan petunjuk bagi penghuni untuk transfer ulang..."
                value={customRejectNote}
                onChange={(e) => setCustomRejectNote(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Konfirmasi Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Success Official Receipt (Kwitansi) Modal */}
      {isKwitansiModalOpen && issuedKwitansi && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Kwitansi Resmi Diterbitkan!
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    No. KWT-{issuedKwitansi.invoice_number?.replace("INV-", "") || Date.now()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKwitansiModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Kwitansi Card */}
            <div className="bg-[#fcfdfa] border-2 border-dashed border-emerald-300 rounded-2xl p-5 space-y-3 font-sans relative">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div>
                  <h4 className="font-black text-sm text-slate-900 tracking-tight">KOST YUSI RESIDENCE</h4>
                  <p className="text-[10px] text-slate-500">Jl. Sigura - Gura IV No.6, Malang</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    LUNAS / VERIFIED
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Telah terima dari:</span>
                  <span className="font-bold text-slate-900">{issuedKwitansi.tenant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Untuk sewa kamar:</span>
                  <span className="font-semibold text-slate-900">
                    Kamar {issuedKwitansi.room_number} ({issuedKwitansi.period || "November 2026"})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Metode Pembayaran:</span>
                  <span className="font-semibold text-slate-900">{issuedKwitansi.bank_sender || issuedKwitansi.bank_name}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-700 font-bold">Jumlah Pembayaran:</span>
                  <span className="text-base font-black text-emerald-600">
                    {formatRupiah(Number(issuedKwitansi.amount))}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-100 flex justify-between items-end text-[10px] text-slate-400">
                <div>
                  <span>Diverifikasi oleh:</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">Ibu Hj. Ratna Juwita</p>
                </div>
                <span className="italic">Kwitansi sah diterbitkan secara digital</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak Kwitansi
              </button>
              <button
                type="button"
                onClick={() => setIsKwitansiModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
