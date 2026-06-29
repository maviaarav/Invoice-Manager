import { useState, useEffect, useRef } from "react";
import instance from "./api/axios";
import "./invoices.css";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const getMonthRange = (year, month) => {
  const lastDay = new Date(year, month + 1, 0).getDate(); // e.g. 30 for June
  const pad = (n) => String(n).padStart(2, "0");
  const startDate = `${year}-${pad(month + 1)}-01`;
  const endDate   = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
  return { startDate, endDate };
};

const Invoices = () => {
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear());
  const [invoices,      setInvoices]      = useState([]);
  const [error,         setError]         = useState(null);
  const [showPicker,    setShowPicker]    = useState(false);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [editingClient, setEditingClient] = useState(null);

const [openMenuId, setOpenMenuId] = useState(null);

// Add this ref for outside click
const menuRef = useRef(null);
useEffect(() => {
  const handler = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target))
      setOpenMenuId(null);
  };
  document.addEventListener("click", handler, true);
  return () => document.removeEventListener("click", handler, true);
}, []);
  const itemsPerPage = 4;
  const pickerRef = useRef(null);

  const fetchInvoices = async (month = selectedMonth, year = selectedYear, page = currentPage) => {
    const { startDate, endDate } = getMonthRange(year, month);
    try {
      const response = await instance.get("/invoice/filter", {
        params: { startDate, endDate, page, limit: itemsPerPage },
      });
      setInvoices(response.data.invoices);
      setTotalInvoices(response.data.total || response.data.invoices.length);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.Msg || "Failed to fetch invoices. Please try again later.");
    }
  };

  useEffect(() => { fetchInvoices(); }, [currentPage]);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target))
        setShowPicker(false);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
    setCurrentPage(1);
    fetchInvoices(monthIndex, selectedYear, 1);
    setShowPicker(false);
  };

  const handleYearChange = (dir) => {
    setSelectedYear((y) => y + dir);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const totalPages = Math.ceil(totalInvoices / itemsPerPage);
  const startItem  = (currentPage - 1) * itemsPerPage + 1;
  const endItem    = Math.min(currentPage * itemsPerPage, totalInvoices);

  const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors = ["#6c63ff","#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];
  const getAvatarColor = (name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return avatarColors[hash % avatarColors.length];
  };

  return (
    <div className="inv-page">
      <div className="inv-container">

        {/* ── Header ── */}
        <div className="inv-header">
          <div className="inv-header-left">
            <h1 className="inv-title">Invoice History</h1>
            <p className="inv-subtitle">Manage and track all your client billing in one place.</p>
          </div>
          <button className="inv-create-btn" onClick={() => (window.location.href = "/invoiceForm")}>
            + Create Invoice
          </button>
        </div>

        {error && <div className="inv-error">{error}</div>}

        {/* ── Month picker ── */}
        <div className="inv-filters">
          <div
            className="inv-date-wrapper"
            ref={pickerRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="inv-date-btn" onClick={() => setShowPicker((p) => !p)}>
              <span className="inv-date-icon">📅</span>
              {MONTHS[selectedMonth]} {selectedYear}
              <span className="inv-chevron">{showPicker ? "▲" : "▼"}</span>
            </button>

            {showPicker && (
              <div className="inv-month-dropdown">
                {/* Year navigation */}
                <div className="inv-year-nav">
                  <button className="inv-year-btn" onClick={() => handleYearChange(-1)}>‹</button>
                  <span className="inv-year-label">{selectedYear}</span>
                  <button
                    className="inv-year-btn"
                    onClick={() => handleYearChange(1)}
                    disabled={selectedYear >= now.getFullYear()}
                  >›</button>
                </div>

                {/* Month grid */}
                <div className="inv-month-grid">
                  {MONTHS.map((m, i) => {
                    const isFuture = selectedYear === now.getFullYear() && i > now.getMonth();
                    return (
                      <button
                        key={m}
                        className={`inv-month-btn
                          ${selectedMonth === i && selectedYear === now.getFullYear() || selectedMonth === i ? "selected" : ""}
                          ${selectedMonth === i ? "selected" : ""}
                          ${isFuture ? "disabled" : ""}`}
                        onClick={() => !isFuture && handleMonthSelect(i)}
                        disabled={isFuture}
                      >
                        {m.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="inv-table-wrapper">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Client Name</th>
                <th>Amount (₹)</th>
                <th>GST (₹)</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="inv-empty">
                    No invoices found for {MONTHS[selectedMonth]} {selectedYear}.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const clientName = inv.customerId?.clientName || "Unknown";
                  const email      = inv.customerId?.email || "";
                  const gst        = (inv.cgst.amount || 0) + (inv.sgst.amount || 0) + (inv.igst.amount || 0);
                  return (
                    <tr key={inv._id}>
                    
                      <td><span className="inv-number">{inv.invoiceNumber}</span></td>
                      <td>
                        <div className="inv-client">
                          <div className="inv-avatar" style={{ backgroundColor: getAvatarColor(clientName) }}>
                            {getInitials(clientName)}
                          </div>
                          <div className="inv-client-info">
                            <span className="inv-client-name">{clientName}</span>
                            <span className="inv-client-email">{email}</span>
                          </div>
                        </div>
                      </td>
                      <td><strong>{Number(inv.totalAmount || 0).toFixed(2)}</strong></td>
                      <td>{gst.toFixed(2)}</td>
                      <td>{formatDate(inv.invoiceDate)}</td>
                      <td style={{ position: "relative" }} ref={openMenuId === inv._id ? menuRef : null}>
  <button
    className="inv-action-btn"
    title="Options"
    onClick={(e) => {
      e.stopPropagation();
      setOpenMenuId(openMenuId === inv._id ? null : inv._id);
    }}
  >⋮</button>

  {openMenuId === inv._id && (
    <div className="inv-action-dropdown">
      <button className="inv-action-item" onClick={() => {
        localStorage.setItem("editingInvoice", JSON.stringify(inv));
        window.location.href = `/invoiceForm`;
      }}>
        Edit
      </button>
      <button className="inv-action-item" onClick={() => (window.location.href = `/invoice/pdf/${inv._id}`)}>
        Download PDF
      </button>
      <button className="inv-action-item" onClick={() => (window.location.href = `/invoice/preview/${inv._id}`)}>
        Preview
      </button>
    </div>
  )}
</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* ── Pagination ── */}
          {totalInvoices > 0 && (
            <div className="inv-pagination">
              <span className="inv-page-info">
                Showing {startItem} to {endItem} of {totalInvoices} invoices
              </span>
              <div className="inv-page-controls">
                <button className="inv-page-btn" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`inv-page-btn ${currentPage === p ? "active" : ""}`} onClick={() => setCurrentPage(p)}>{p}</button>
                ))}
                <button className="inv-page-btn" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>›</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Invoices;