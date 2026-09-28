"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus, Search, Camera, Wallet, CheckCircle, XCircle,
  Trash2, Edit3, RefreshCw, Upload, X, AlertCircle,
  Trophy, Clock, SwitchCamera, FileText,
} from "lucide-react";

const DENOMINATIONS = [100, 200, 750, 1500, 25000, 40000];

interface Bond {
  id: string;
  bondNumber: string;
  denomination: number;
  purchaseDate: string;
  notes: string;
  status: string;
  lastChecked: string | null;
  lastResult: {
    isWinner: boolean;
    prizeAmount: number;
    prizePosition: number;
    drawNumber: string;
    drawDate: string;
    checkedAt: string;
  } | null;
  createdAt: string;
}

interface CheckResult {
  isWinner: boolean | null;
  bondNumber: string;
  denomination: number;
  prizeAmount: number;
  prizePosition: number;
  drawNumber: string | null;
  drawDate: string | null;
  message: string;
  source: string | null;
  checkedAt: string;
  verifyUrl?: string;
}

interface ScanResult {
  detected: boolean;
  bondNumber: string | null;
  confidence: string;
  notes: string;
  issues: string;
  disclaimer: string;
}

function BondsPageContent() {
  const searchParams = useSearchParams();
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [editBond, setEditBond] = useState<Bond | null>(null);
  const [deleteBond, setDeleteBond] = useState<Bond | null>(null);

  // Form state
  const [addForm, setAddForm] = useState({ bondNumber: "", denomination: 100, purchaseDate: "", notes: "" });
  const [checkForm, setCheckForm] = useState({ bondNumber: "", denomination: 100 });
  const [addLoading, setAddLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);

  // Scan state
  const [scanMode, setScanMode] = useState<"upload" | "camera">("upload");
  const [scanImage, setScanImage] = useState<File | null>(null);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // PDF Check state
interface PdfWinner {
  bondNumber: string;
  denomination: number;
  prizeAmount: number;
  prizePosition: number;
  drawNumber: string;
  drawDate: string | null;
  location: string;
}

interface PdfCheckResult {
  totalScanned: number;
  totalWinners: number;
  winners: PdfWinner[];
}

  const [showPdfCheck, setShowPdfCheck] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDenomination, setPdfDenomination] = useState<number | "">("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfResult, setPdfResult] = useState<PdfCheckResult | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDenom, setFilterDenom] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadBonds = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bonds");
      const json = await res.json();
      if (json.success) setBonds(json.data);
      else setError(json.error || "Failed to load bonds.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBonds();
    // Auto-open modals based on URL params
    if (searchParams.get("add")) setShowAdd(true);
    if (searchParams.get("check")) setShowCheck(true);
    if (searchParams.get("scan")) setShowScan(true);
  }, [loadBonds, searchParams]);

  // Filter bonds
  const filteredBonds = bonds.filter((b) => {
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (filterDenom !== "all" && b.denomination !== parseInt(filterDenom)) return false;
    if (searchQuery && !b.bondNumber.includes(searchQuery)) return false;
    return true;
  });

  const handleAddBond = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      const res = await fetch("/api/bonds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addForm, denomination: parseInt(String(addForm.denomination)) }),
      });
      const json = await res.json();
      if (!json.success) { setAddError(json.error || "Failed to add bond."); return; }
      setShowAdd(false);
      setAddForm({ bondNumber: "", denomination: 100, purchaseDate: "", notes: "" });
      loadBonds();
    } catch { setAddError("Network error."); }
    finally { setAddLoading(false); }
  };

  const handleCheckBond = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckResult(null);
    setCheckLoading(true);
    try {
      const res = await fetch("/api/bonds/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...checkForm, denomination: parseInt(String(checkForm.denomination)) }),
      });
      const json = await res.json();
      if (json.success) { setCheckResult(json.data); loadBonds(); }
    } catch { }
    finally { setCheckLoading(false); }
  };

  const handleDelete = async (bond: Bond) => {
    try {
      const res = await fetch(`/api/bonds/${bond.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { setDeleteBond(null); loadBonds(); }
    } catch { }
  };

  const handleScanImage = (file: File) => {
    setScanImage(file);
    setScanResult(null);
    setScanError("");
    const url = URL.createObjectURL(file);
    setScanPreview(url);
  };

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError("Camera access denied. Please allow camera permission in your browser.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      handleScanImage(file);
      stopCamera();
      setScanMode("upload"); // switch to preview mode after capture
    }, "image/jpeg", 0.92);
  };

  const closeScanModal = () => {
    stopCamera();
    setShowScan(false);
    setScanResult(null);
    setScanImage(null);
    setScanPreview(null);
    setScanMode("upload");
    setScanError("");
    setCameraError("");
  };

  const handleScanSubmit = async () => {
    if (!scanImage) return;
    setScanLoading(true);
    setScanError("");
    try {
      const formData = new FormData();
      formData.append("image", scanImage);
      const res = await fetch("/api/bonds/scan", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) setScanResult(json.data);
      else setScanError(json.error || "Scan failed.");
    } catch { setScanError("Network error."); }
    finally { setScanLoading(false); }
  };

  const handlePdfSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pdfFile) return;
    setPdfLoading(true);
    setPdfError("");
    setPdfResult(null);
    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      if (pdfDenomination) formData.append("denomination", pdfDenomination.toString());
      const res = await fetch("/api/bonds/pdf-check", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) setPdfResult(json.data);
      else setPdfError(json.error || "PDF check failed.");
    } catch { setPdfError("Network error."); }
    finally { setPdfLoading(false); }
  };

  const useScanResult = () => {
    if (scanResult?.bondNumber) {
      setCheckForm({ bondNumber: scanResult.bondNumber, denomination: 750 });
      closeScanModal();
      setShowCheck(true);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">My Prize Bonds</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? "Loading…" : `${bonds.length} bond${bonds.length !== 1 ? "s" : ""} in portfolio`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button id="open-pdf" onClick={() => setShowPdfCheck(true)} className="btn-ghost text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" /> Bulk PDF
          </button>
          <button id="open-scan" onClick={() => setShowScan(true)} className="btn-ghost text-sm flex items-center gap-2">
            <Camera className="w-4 h-4" /> Scan
          </button>
          <button id="open-check" onClick={() => setShowCheck(true)} className="btn-ghost text-sm flex items-center gap-2">
            <Search className="w-4 h-4" /> Check
          </button>
          <button id="open-add" onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Bond
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search bond number…"
          className="input-field max-w-48 text-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select className="input-field max-w-36 text-xs" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
          <option value="lost">Lost</option>
        </select>
        <select className="input-field max-w-36 text-xs" value={filterDenom} onChange={(e) => setFilterDenom(e.target.value)}>
          <option value="all">All Denominations</option>
          {DENOMINATIONS.map((d) => <option key={d} value={d}>Rs. {d.toLocaleString()}</option>)}
        </select>
        <button onClick={loadBonds} className="p-2.5 rounded-xl border border-white/15 text-slate-400 hover:text-white hover:border-white/25 transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Bond list */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 skeleton rounded-2xl" />)}
        </div>
      ) : filteredBonds.length === 0 ? (
        <div className="premium-card p-16 text-center">
          <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-medium mb-1">
            {bonds.length === 0 ? "No prize bonds added yet." : "No bonds match your filters."}
          </p>
          {bonds.length === 0 && (
            <p className="text-slate-500 text-sm mb-6">
              Add your first bond to start tracking your portfolio.
            </p>
          )}
          {bonds.length === 0 && (
            <button onClick={() => setShowAdd(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Bond
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBonds.map((bond) => (
            <div key={bond.id} className="premium-card p-5 hover:border-white/20 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xl font-bold tracking-widest text-white font-mono">
                    {bond.bondNumber}
                  </p>
                  <p className="text-sm text-slate-400">
                    Rs. {bond.denomination.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {bond.lastResult?.isWinner === true && (
                    <span className="badge-win"><Trophy className="w-3 h-3" /> Winner</span>
                  )}
                  {bond.lastResult?.isWinner === false && (
                    <span className="badge-lose">Not Won</span>
                  )}
                  {!bond.lastResult && (
                    <span className="badge-pending"><Clock className="w-3 h-3" /> Unchecked</span>
                  )}
                </div>
              </div>

              {bond.lastResult?.isWinner && (
                <div className="mb-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-xs text-emerald-400 font-medium">
                    🏆 Won Rs. {bond.lastResult.prizeAmount.toLocaleString()} — Position #{bond.lastResult.prizePosition}
                  </p>
                </div>
              )}

              <div className="text-xs text-slate-500 space-y-1 mb-4">
                <p>Purchased: {new Date(bond.purchaseDate).toLocaleDateString()}</p>
                {bond.lastChecked && (
                  <p>Last checked: {new Date(bond.lastChecked).toLocaleDateString()}</p>
                )}
                {bond.notes && <p className="text-slate-400 italic">&ldquo;{bond.notes}&rdquo;</p>}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-white/8">
                <button
                  onClick={() => {
                    setCheckForm({ bondNumber: bond.bondNumber, denomination: bond.denomination });
                    setShowCheck(true);
                  }}
                  className="flex-1 text-xs text-center py-1.5 px-3 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 border border-brand-500/20 transition-all"
                >
                  <Search className="w-3 h-3 inline mr-1" /> Check
                </button>
                <button
                  onClick={() => setEditBond(bond)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all"
                  aria-label="Edit bond"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteBond(bond)}
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  aria-label="Delete bond"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Bond Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">Add Prize Bond</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {addError && (
              <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {addError}
              </div>
            )}
            <form onSubmit={handleAddBond} className="space-y-4">
              <div>
                <label className="form-label">Bond Number (6 digits)</label>
                <input
                  id="add-bond-number"
                  type="text"
                  className="input-field font-mono tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  pattern="\d{6}"
                  value={addForm.bondNumber}
                  onChange={(e) => setAddForm(p => ({ ...p, bondNumber: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Denomination</label>
                <select
                  id="add-denomination"
                  className="input-field"
                  value={addForm.denomination}
                  onChange={(e) => setAddForm(p => ({ ...p, denomination: parseInt(e.target.value) }))}
                >
                  {DENOMINATIONS.map((d) => (
                    <option key={d} value={d} className="bg-surface-900">Rs. {d.toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Purchase Date (optional)</label>
                <input
                  id="add-purchase-date"
                  type="date"
                  className="input-field"
                  value={addForm.purchaseDate}
                  onChange={(e) => setAddForm(p => ({ ...p, purchaseDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">Notes (optional)</label>
                <input
                  id="add-notes"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Bought from Karachi post office"
                  value={addForm.notes}
                  onChange={(e) => setAddForm(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost flex-1">Cancel</button>
                <button id="add-bond-submit" type="submit" disabled={addLoading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                  {addLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                  {addLoading ? "Adding…" : "Add Bond"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Check Bond Modal ── */}
      {showCheck && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">Check Prize Bond</h2>
              <button onClick={() => { setShowCheck(false); setCheckResult(null); }} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCheckBond} className="space-y-4">
              <div>
                <label className="form-label">Bond Number (6 digits)</label>
                <input
                  id="check-bond-number"
                  type="text"
                  className="input-field font-mono tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  pattern="\d{6}"
                  value={checkForm.bondNumber}
                  onChange={(e) => setCheckForm(p => ({ ...p, bondNumber: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Denomination</label>
                <select
                  id="check-denomination"
                  className="input-field"
                  value={checkForm.denomination}
                  onChange={(e) => setCheckForm(p => ({ ...p, denomination: parseInt(e.target.value) }))}
                >
                  {DENOMINATIONS.map((d) => (
                    <option key={d} value={d} className="bg-surface-900">Rs. {d.toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <button id="check-bond-submit" type="submit" disabled={checkLoading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                {checkLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                {checkLoading ? "Checking…" : "Check Bond"}
              </button>
            </form>

            {checkResult && (
              <div className={`mt-5 p-4 rounded-xl border ${
                checkResult.isWinner === true ? "bg-emerald-500/10 border-emerald-500/30" :
                checkResult.isWinner === false ? "bg-slate-500/10 border-slate-500/30" :
                "bg-amber-500/10 border-amber-500/30"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {checkResult.isWinner === true && <Trophy className="w-4 h-4 text-emerald-400" />}
                  {checkResult.isWinner === false && <XCircle className="w-4 h-4 text-slate-400" />}
                  {checkResult.isWinner === null && <AlertCircle className="w-4 h-4 text-amber-400" />}
                  <p className={`text-sm font-semibold ${
                    checkResult.isWinner === true ? "text-emerald-400" :
                    checkResult.isWinner === false ? "text-slate-300" : "text-amber-400"
                  }`}>
                    {checkResult.isWinner === true ? "🎉 WINNER!" :
                     checkResult.isWinner === false ? "Not a Winner" : "Result Unavailable"}
                  </p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{checkResult.message}</p>
                {checkResult.isWinner === true && (
                  <div className="mt-2 pt-2 border-t border-emerald-500/20">
                    <p className="text-xs text-emerald-400">Prize: Rs. {checkResult.prizeAmount.toLocaleString()} · Position #{checkResult.prizePosition}</p>
                  </div>
                )}
                {checkResult.verifyUrl && (
                  <a href={checkResult.verifyUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-xs text-brand-400 hover:underline">
                    Verify on official SBP website →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AI Scan Modal ── */}
      {showScan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-lg p-6 animate-slide-up">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-white">AI Bond Scanner</h2>
                <p className="text-xs text-slate-400 mt-0.5">Scan or upload your prize bond to detect its number</p>
              </div>
              <button onClick={closeScanModal} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Mode Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-white/10 mb-4">
              <button
                onClick={() => { stopCamera(); setScanMode("upload"); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
                  scanMode === "upload"
                    ? "bg-brand-500/20 text-brand-300 border-b-2 border-brand-500"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Upload className="w-4 h-4" /> Upload File
              </button>
              <button
                onClick={() => { setScanMode("camera"); startCamera(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
                  scanMode === "camera"
                    ? "bg-brand-500/20 text-brand-300 border-b-2 border-brand-500"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Camera className="w-4 h-4" /> Use Camera
              </button>
            </div>

            {/* ── Upload Tab ── */}
            {scanMode === "upload" && (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${
                  scanImage ? "border-brand-500/50 bg-brand-500/5" : "border-white/15 hover:border-brand-500/30 hover:bg-white/5"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file?.type.startsWith("image/")) handleScanImage(file);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleScanImage(f); }}
                />
                {scanPreview ? (
                  <div className="relative inline-block">
                    <img src={scanPreview} alt="Bond preview" className="max-h-44 mx-auto rounded-lg object-contain" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setScanImage(null); setScanPreview(null); setScanResult(null); }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-300 text-sm font-medium">Click or drag an image here</p>
                    <p className="text-slate-500 text-xs mt-1">JPEG, PNG, WebP — max 10MB</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Camera Tab ── */}
            {scanMode === "camera" && (
              <div className="mb-4">
                {cameraError ? (
                  <div className="border-2 border-red-500/30 rounded-xl p-8 text-center bg-red-500/5">
                    <Camera className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-red-400 text-sm">{cameraError}</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full max-h-56 object-cover rounded-xl"
                    />
                    {/* Scan guide overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 border-brand-400/60 rounded-lg w-4/5 h-24 relative">
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-brand-400 font-medium whitespace-nowrap bg-black/50 px-2 py-0.5 rounded">
                          Align bond number here
                        </span>
                        {/* Corner decorations */}
                        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-400 rounded-tl" />
                        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand-400 rounded-tr" />
                        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand-400 rounded-bl" />
                        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand-400 rounded-br" />
                      </div>
                    </div>
                    {/* Live indicator */}
                    {cameraActive && (
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        <span className="text-[10px] text-white font-bold uppercase">Live</span>
                      </div>
                    )}
                  </div>
                )}
                {cameraActive && !cameraError && (
                  <button
                    onClick={captureFromCamera}
                    className="mt-3 w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <SwitchCamera className="w-4 h-4" /> Capture Photo
                  </button>
                )}
              </div>
            )}

            {/* Errors */}
            {scanError && (
              <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {scanError}
              </div>
            )}

            {/* Scan Result */}
            {scanResult && (
              <div className={`mb-4 p-4 rounded-xl border ${scanResult.detected ? "bg-brand-500/10 border-brand-500/30" : "bg-amber-500/10 border-amber-500/30"}`}>
                {scanResult.detected ? (
                  <>
                    <p className="text-sm font-semibold text-brand-400 mb-1">✓ Bond Number Detected</p>
                    <p className="text-2xl font-bold tracking-widest text-white font-mono mb-1">{scanResult.bondNumber}</p>
                    <p className="text-xs text-slate-400">Confidence: {scanResult.confidence} · {scanResult.notes}</p>
                    <div className="mt-2 pt-2 border-t border-brand-500/20">
                      <p className="text-xs text-amber-400 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {scanResult.disclaimer}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-amber-400">⚠ {scanResult.issues || "No bond number detected. Try a clearer image."}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {scanResult?.detected && (
                <button onClick={useScanResult} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Use This Number
                </button>
              )}
              {scanMode === "upload" && (
                <button
                  id="scan-submit"
                  onClick={handleScanSubmit}
                  disabled={!scanImage || scanLoading}
                  className={`btn-primary flex items-center justify-center gap-2 disabled:opacity-60 ${scanResult?.detected ? "flex-shrink-0 px-4" : "flex-1"}`}
                >
                  {scanLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
                  {scanLoading ? "Scanning…" : scanResult ? "Re-scan" : "Scan with AI"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PDF Bulk Check Modal ── */}
      {showPdfCheck && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-white">Bulk Check via PDF</h2>
                <p className="text-xs text-slate-400 mt-0.5">Upload a PDF list of your bond numbers to check them all at once</p>
              </div>
              <button onClick={() => { setShowPdfCheck(false); setPdfResult(null); setPdfFile(null); }} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${
                pdfFile ? "border-brand-500/50 bg-brand-500/5" : "border-white/15 hover:border-brand-500/30 hover:bg-white/5"
              }`}
              onClick={() => pdfInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file?.name.endsWith(".pdf") || file?.type === "application/pdf") {
                  setPdfFile(file);
                  setPdfResult(null);
                  setPdfError("");
                } else {
                  setPdfError("Only PDF files are supported.");
                }
              }}
            >
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setPdfFile(f);
                    setPdfResult(null);
                    setPdfError("");
                  }
                }}
              />
              {pdfFile ? (
                <div className="flex flex-col items-center">
                  <FileText className="w-10 h-10 text-brand-400 mb-2" />
                  <p className="text-white text-sm font-medium">{pdfFile.name}</p>
                  <p className="text-slate-500 text-xs mt-1">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPdfFile(null); setPdfResult(null); }}
                    className="mt-3 text-xs text-red-400 hover:text-red-300"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-300 text-sm font-medium">Click or drag a PDF here</p>
                  <p className="text-slate-500 text-xs mt-1">Max 20MB</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label">Filter by Denomination (Optional)</label>
              <select
                className="input-field"
                value={pdfDenomination}
                onChange={(e) => setPdfDenomination(e.target.value ? parseInt(e.target.value) : "")}
              >
                <option value="">All Denominations (Auto-detect)</option>
                {DENOMINATIONS.map((d) => (
                  <option key={d} value={d} className="bg-surface-900">Rs. {d.toLocaleString()}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                If your PDF contains mixed numbers, it&apos;s recommended to select the specific denomination you want to check.
              </p>
            </div>

            {pdfError && (
              <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {pdfError}
              </div>
            )}

            {pdfResult && (
              <div className="mb-4">
                <div className="flex items-center justify-between bg-surface-900 p-3 rounded-lg border border-white/10 mb-3">
                  <div className="text-center flex-1 border-r border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Numbers Found</p>
                    <p className="text-lg font-bold text-white">{pdfResult.totalScanned}</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-slate-400 mb-1">Winning Bonds</p>
                    <p className={`text-lg font-bold ${pdfResult.totalWinners > 0 ? "text-emerald-400" : "text-slate-300"}`}>
                      {pdfResult.totalWinners}
                    </p>
                  </div>
                </div>

                {pdfResult.totalWinners > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4" /> Winners
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {pdfResult.winners.map((winner, idx: number) => (
                        <div key={idx} className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-mono font-bold text-white tracking-wider">{winner.bondNumber}</p>
                            <p className="text-[10px] text-slate-400">Rs. {winner.denomination} • Draw #{winner.drawNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 font-bold text-sm">Rs. {winner.prizeAmount.toLocaleString()}</p>
                            <p className="text-[10px] text-emerald-400/80">Position #{winner.prizePosition}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-800/50 rounded-lg text-center border border-white/5">
                    <p className="text-sm text-slate-300">None of the found numbers match any winning records.</p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handlePdfSubmit}
              disabled={!pdfFile || pdfLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {pdfLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
              {pdfLoading ? "Checking..." : pdfResult ? "Check Again" : "Check Bonds"}
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteBond && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-sm p-6 animate-slide-up">
            <h2 className="font-semibold text-white mb-2">Delete Bond?</h2>
            <p className="text-slate-400 text-sm mb-5">
              Remove bond <strong className="text-white font-mono">{deleteBond.bondNumber}</strong> (Rs. {deleteBond.denomination.toLocaleString()}) from your portfolio? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteBond(null)} className="btn-ghost flex-1">Cancel</button>
              <button id="confirm-delete" onClick={() => handleDelete(deleteBond)} className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 font-medium text-sm transition-all">
                Delete Bond
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BondsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Prize Bonds...</div>}>
      <BondsPageContent />
    </Suspense>
  );
}
