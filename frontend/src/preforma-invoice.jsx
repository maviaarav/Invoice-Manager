import { useState, useEffect, useRef } from "react";
import instance from "./api/axios";
import "./invoices.css";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const getMonthRange = (year, month) => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const pad = (n) => String(n).padStart(2, "0");
  const startDate = `${year}-${pad(month + 1)}-01`;
  const endDate   = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
  return { startDate, endDate };
};

const ProformaInvoices = () => {
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear());
  const [invoices,      setInvoices]      = useState([]); // full list for the month
  const [error,         setError]         = useState(null);
  const [showPicker,    setShowPicker]    = useState(false);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [editingClient, setEditingClient] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  
  const menuRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenuId(null);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const itemsPerPage = 8;
  const pickerRef = useRef(null);

  // Fetches ALL proforma invoices for the selected month — pagination is handled client-side below
  const fetchInvoices = async (month = selectedMonth, year = selectedYear) => {
    const { startDate, endDate } = getMonthRange(year, month);
    try {
      const response = await instance.get("/proforma/filter", {
        params: { startDate, endDate },
      });
      setInvoices(response.data.invoices || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.Msg || "Failed to fetch invoices. Please try again later.");
    }
  };
  const deleteInvoice = async (invoiceId) => {
    try {
      await instance.delete(`/invoice/delete/${invoiceId}`);
      setInvoices((prev) => prev.filter((inv) => inv._id !== invoiceId));
      setOpenMenuId(null);
      fetchInvoices(); // Refresh the list after deletion
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.Msg || "Failed to delete invoice. Please try again later.");
    }
  };
  // Refetch only when month/year changes — NOT on page change, since pagination is local now
  useEffect(() => { fetchInvoices(); }, [selectedMonth, selectedYear]);

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
    setShowPicker(false);
  };

  const handleYearChange = (dir) => {
    setSelectedYear((y) => y + dir);
    setCurrentPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const totalInvoices = invoices.length;
  const totalPages = Math.max(Math.ceil(totalInvoices / itemsPerPage), 1);
  const startItem  = totalInvoices === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem    = Math.min(currentPage * itemsPerPage, totalInvoices);
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors = ["#6c63ff","#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];
  const getAvatarColor = (name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return avatarColors[hash % avatarColors.length];
  };

  const handleCreateInvoice = () => {
    localStorage.removeItem("editingInvoice");
    window.location.href = "/proforma-invoice-form";
  }

  return (
    <div className="inv-page">
      <div className="inv-container">

        <div className="inv-header">
          <div className="inv-header-left">
            <h1 className="inv-title">Proforma Invoice History</h1>
            <p className="inv-subtitle">Manage and track all your client billing in one place.</p>
          </div>
          <button className="inv-create-btn" onClick={handleCreateInvoice}>
            + Create Proforma Invoice
          </button>
        </div>

        {error && <div className="inv-error">{error}</div>}

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
                <div className="inv-year-nav">
                  <button className="inv-year-btn" onClick={() => handleYearChange(-1)}>‹</button>
                  <span className="inv-year-label">{selectedYear}</span>
                  <button
                    className="inv-year-btn"
                    onClick={() => handleYearChange(1)}
                    disabled={selectedYear >= now.getFullYear()}
                  >›</button>
                </div>

                <div className="inv-month-grid">
                  {MONTHS.map((m, i) => {
                    const isFuture = selectedYear === now.getFullYear() && i > now.getMonth();
                    return (
                      <button
                        key={m}
                        className={`inv-month-btn ${selectedMonth === i ? "selected" : ""} ${isFuture ? "disabled" : ""}`}
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
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="inv-empty">
                    No invoices found for {MONTHS[selectedMonth]} {selectedYear}.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => {
                  const clientName = inv.customerId?.clientName || "Unknown";
                  const email      = inv.customerId?.email || "";
                  const gst        = (inv.cgst.amount || 0) + (inv.sgst.amount || 0) + (inv.igst.amount || 0);
                  return (
                    <tr key={inv._id}>
                      <td data-label="Invoice No."><span className="inv-number">{inv.invoiceNumber}</span></td>
                      <td data-label="Client Name">
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
                      <td data-label="Amount (₹)"><strong>{Number(inv.totalAmount || 0).toFixed(2)}</strong></td>
                      <td data-label="GST (₹)">{gst.toFixed(2)}</td>
                      <td data-label="Date">{formatDate(inv.invoiceDate)}</td>
                      <td data-label="Action" style={{ position: "relative" }} ref={openMenuId === inv._id ? menuRef : null}>
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
                              window.location.href = `/proforma-invoice-form`;
                            }}>
                              Edit
                            </button>
                            <button className="inv-action-item" onClick={() => (window.location.href = `/proforma-invoice/preview/${inv._id}`)}>
                              Preview
                            </button>
                            <button className="inv-action-item" onClick={() => deleteInvoice(inv._id)}>
                              Delete
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

export default ProformaInvoices;