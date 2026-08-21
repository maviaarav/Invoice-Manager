import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import instance from "./api/axios";
import "./invoices.css";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getMonthRange = (year, month) => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const pad = (n) => String(n).padStart(2, "0");

  const startDate = `${year}-${pad(month + 1)}-01`;
  const endDate = `${year}-${pad(month + 1)}-${pad(lastDay)}`;

  return { startDate, endDate };
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMonthKey = (month, year) =>
  `${year}-${String(month + 1).padStart(2, "0")}`;

const Invoices = () => {
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPicker, setShowPicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [openMenuId, setOpenMenuId] = useState(null);

  const itemsPerPage = 8;

  const menuRef = useRef(null);
  const pickerRef = useRef(null);

  const monthCacheRef = useRef(new Map());
  const latestRequestRef = useRef(0);

  /* =========================================================
     CLOSE ACTION MENU WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handler, true);

    return () => {
      document.removeEventListener("click", handler, true);
    };
  }, []);

  /* =========================================================
     CLOSE MONTH PICKER WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handler = (e) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("click", handler, true);

    return () => {
      document.removeEventListener("click", handler, true);
    };
  }, []);

  /* =========================================================
     FETCH INVOICES
  ========================================================= */

  const fetchInvoices = useCallback(
    async (
      month,
      year,
      { forceRefresh = false } = {}
    ) => {
      const { startDate, endDate } =
        getMonthRange(year, month);

      const monthKey = getMonthKey(month, year);

      if (
        !forceRefresh &&
        monthCacheRef.current.has(monthKey)
      ) {
        setInvoices(
          monthCacheRef.current.get(monthKey)
        );
        setError(null);
        setIsLoading(false);
        return;
      }

      const requestId =
        latestRequestRef.current + 1;

      latestRequestRef.current = requestId;

      setIsLoading(true);

      try {
        const response = await instance.get(
          "/invoice/filter",
          {
            params: {
              startDate,
              endDate,
            },
          }
        );

        if (
          latestRequestRef.current !==
          requestId
        ) {
          return;
        }

        const monthInvoices =
          response.data.invoices || [];

        monthCacheRef.current.set(
          monthKey,
          monthInvoices
        );

        setInvoices(monthInvoices);
        setError(null);
      } catch (err) {
        if (
          latestRequestRef.current !==
          requestId
        ) {
          return;
        }

        console.error(
          "Error fetching invoices:",
          err
        );

        setError(
          err.response?.data?.Msg ||
            err.response?.data?.message ||
            "Failed to fetch invoices. Please try again later."
        );
      } finally {
        if (
          latestRequestRef.current ===
          requestId
        ) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  /* =========================================================
     FETCH WHEN MONTH/YEAR CHANGES
  ========================================================= */

  useEffect(() => {
    fetchInvoices(
      selectedMonth,
      selectedYear
    );
  }, [
    selectedMonth,
    selectedYear,
    fetchInvoices,
  ]);

  /* =========================================================
     DELETE INVOICE
  ========================================================= */

  const deleteInvoice = async (invoiceId) => {
    try {
      await instance.delete(
        `/invoice/delete/${invoiceId}`
      );

      setInvoices((prev) =>
        prev.filter(
          (inv) => inv._id !== invoiceId
        )
      );

      setOpenMenuId(null);

      monthCacheRef.current.delete(
        getMonthKey(
          selectedMonth,
          selectedYear
        )
      );

      fetchInvoices(
        selectedMonth,
        selectedYear,
        {
          forceRefresh: true,
        }
      );
    } catch (err) {
      console.error(
        "Error deleting invoice:",
        err
      );

      setError(
        err.response?.data?.Msg ||
          "Failed to delete invoice. Please try again later."
      );
    }
  };

  /* =========================================================
     EDIT INVOICE
     
     IMPORTANT:
     /invoice/filter returns only lightweight invoice
     information.

     Therefore we fetch the COMPLETE invoice using:
     
     GET /invoice/get/:id
  ========================================================= */

  const editInvoice = async (invoiceId) => {
    try {
      setOpenMenuId(null);
      setError(null);

      const response = await instance.get(
        `/invoice/get/${invoiceId}`
      );

      const fullInvoice =
        response.data.invoice;

      if (!fullInvoice) {
        throw new Error(
          "Invoice data not found."
        );
      }

      console.log(
        "FULL INVOICE FOR EDIT:",
        fullInvoice
      );

      localStorage.setItem(
        "editingInvoice",
        JSON.stringify(fullInvoice)
      );

      window.location.href =
        "/invoiceForm";
    } catch (err) {
      console.error(
        "Error loading invoice for edit:",
        err
      );

      setError(
        err.response?.data?.Msg ||
          err.response?.data?.message ||
          "Failed to load invoice for editing."
      );
    }
  };

  /* =========================================================
     MONTH SELECTION
  ========================================================= */

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
    setCurrentPage(1);
    setShowPicker(false);
  };

  /* =========================================================
     YEAR CHANGE
  ========================================================= */

  const handleYearChange = (dir) => {
    setSelectedYear((y) => y + dir);
    setCurrentPage(1);
  };

  /* =========================================================
     NORMALIZE INVOICES
  ========================================================= */

  const normalizedInvoices = useMemo(() => {
    return invoices.map((inv) => {
      const clientName =
        inv.customerId?.clientName ||
        "Unknown";

      const email =
        inv.customerId?.email || "";

      const gst =
        (inv.cgst?.amount || 0) +
        (inv.sgst?.amount || 0) +
        (inv.igst?.amount || 0);

      return {
        ...inv,
        clientName,
        email,
        gst,
        formattedDate: formatDate(
          inv.invoiceDate
        ),
      };
    });
  }, [invoices]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalInvoices =
    normalizedInvoices.length;

  const totalPages = Math.max(
    Math.ceil(
      totalInvoices / itemsPerPage
    ),
    1
  );

  const startItem =
    totalInvoices === 0
      ? 0
      : (currentPage - 1) *
          itemsPerPage +
        1;

  const endItem = Math.min(
    currentPage * itemsPerPage,
    totalInvoices
  );

  const paginatedInvoices =
    normalizedInvoices.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage * itemsPerPage
    );

  /* =========================================================
     AVATAR HELPERS
  ========================================================= */

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const avatarColors = [
    "#6c63ff",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  const getAvatarColor = (name = "") => {
    let hash = 0;

    for (
      let i = 0;
      i < name.length;
      i++
    ) {
      hash += name.charCodeAt(i);
    }

    return avatarColors[
      hash % avatarColors.length
    ];
  };

  /* =========================================================
     CREATE NEW INVOICE
  ========================================================= */

  const handleCreateInvoice = () => {
    localStorage.removeItem(
      "editingInvoice"
    );

    window.location.href =
      "/invoiceForm";
  };

  return (
    <div className="inv-page">
      <div className="inv-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="inv-header">
          <div className="inv-header-left">
            <h1 className="inv-title">
              Invoice History
            </h1>

            <p className="inv-subtitle">
              Manage and track all your
              client billing in one place.
            </p>
          </div>

          <button
            className="inv-create-btn"
            onClick={
              handleCreateInvoice
            }
          >
            + Create Invoice
          </button>
        </div>

        {error && (
          <div className="inv-error">
            {error}
          </div>
        )}

        {/* =================================================
            MONTH FILTER
        ================================================= */}

        <div className="inv-filters">
          <div
            className="inv-date-wrapper"
            ref={pickerRef}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="inv-date-btn"
              onClick={() =>
                setShowPicker(
                  (p) => !p
                )
              }
            >
              <span className="inv-date-icon">
                📅
              </span>

              {MONTHS[selectedMonth]}{" "}
              {selectedYear}

              <span className="inv-chevron">
                {showPicker
                  ? "▲"
                  : "▼"}
              </span>
            </button>

            {showPicker && (
              <div className="inv-month-dropdown">

                <div className="inv-year-nav">
                  <button
                    className="inv-year-btn"
                    onClick={() =>
                      handleYearChange(-1)
                    }
                  >
                    ‹
                  </button>

                  <span className="inv-year-label">
                    {selectedYear}
                  </span>

                  <button
                    className="inv-year-btn"
                    onClick={() =>
                      handleYearChange(1)
                    }
                    disabled={
                      selectedYear >=
                      now.getFullYear()
                    }
                  >
                    ›
                  </button>
                </div>

                <div className="inv-month-grid">
                  {MONTHS.map(
                    (m, i) => {
                      const isFuture =
                        selectedYear ===
                          now.getFullYear() &&
                        i >
                          now.getMonth();

                      return (
                        <button
                          key={m}
                          className={`inv-month-btn ${
                            selectedMonth ===
                            i
                              ? "selected"
                              : ""
                          } ${
                            isFuture
                              ? "disabled"
                              : ""
                          }`}
                          onClick={() =>
                            !isFuture &&
                            handleMonthSelect(
                              i
                            )
                          }
                          disabled={
                            isFuture
                          }
                        >
                          {m.slice(0, 3)}
                        </button>
                      );
                    }
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="inv-table-wrapper">

          <table className="inv-table">

            <thead>
              <tr>
                <th>
                  Invoice No.
                </th>

                <th>
                  Client Name
                </th>

                <th>
                  Amount (₹)
                </th>

                <th>
                  GST (₹)
                </th>

                <th>
                  Date
                </th>

                <th>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {isLoading ? (

                Array.from({
                  length: 6,
                }).map(
                  (_, index) => (
                    <tr
                      key={`skeleton-${index}`}
                      className="inv-skeleton-row"
                      aria-hidden="true"
                    >
                      <td>
                        <div className="inv-skeleton inv-skeleton-inline" />
                      </td>

                      <td>
                        <div className="inv-client">

                          <div className="inv-skeleton inv-skeleton-avatar" />

                          <div className="inv-client-info">
                            <div className="inv-skeleton inv-skeleton-name" />
                            <div className="inv-skeleton inv-skeleton-email" />
                          </div>

                        </div>
                      </td>

                      <td>
                        <div className="inv-skeleton inv-skeleton-amount" />
                      </td>

                      <td>
                        <div className="inv-skeleton inv-skeleton-tax" />
                      </td>

                      <td>
                        <div className="inv-skeleton inv-skeleton-date" />
                      </td>

                      <td>
                        <div className="inv-skeleton inv-skeleton-action" />
                      </td>
                    </tr>
                  )
                )

              ) : paginatedInvoices.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="inv-empty"
                  >
                    No invoices found for{" "}
                    {MONTHS[selectedMonth]}{" "}
                    {selectedYear}.
                  </td>
                </tr>

              ) : (

                paginatedInvoices.map(
                  (inv) => (

                    <tr key={inv._id}>

                      <td>
                        <span className="inv-number">
                          {inv.invoiceNumber}
                        </span>
                      </td>

                      <td>
                        <div className="inv-client">

                          <div
                            className="inv-avatar"
                            style={{
                              backgroundColor:
                                getAvatarColor(
                                  inv.clientName
                                ),
                            }}
                          >
                            {getInitials(
                              inv.clientName
                            )}
                          </div>

                          <div className="inv-client-info">

                            <span className="inv-client-name">
                              {inv.clientName}
                            </span>

                            <span className="inv-client-email">
                              {inv.email}
                            </span>

                          </div>

                        </div>
                      </td>

                      <td>
                        <strong>
                          {Number(
                            inv.totalAmount ||
                              0
                          ).toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        {inv.gst.toFixed(2)}
                      </td>

                      <td>
                        {inv.formattedDate}
                      </td>

                      <td
                        style={{
                          position:
                            "relative",
                        }}
                        ref={
                          openMenuId ===
                          inv._id
                            ? menuRef
                            : null
                        }
                      >

                        <button
                          className="inv-action-btn"
                          title="Options"
                          onClick={(e) => {
                            e.stopPropagation();

                            setOpenMenuId(
                              openMenuId ===
                                inv._id
                                ? null
                                : inv._id
                            );
                          }}
                        >
                          ⋮
                        </button>

                        {openMenuId ===
                          inv._id && (

                          <div className="inv-action-dropdown">

                            {/* =========================
                                EDIT
                            ========================= */}

                            <button
                              className="inv-action-item"
                              onClick={() =>
                                editInvoice(
                                  inv._id
                                )
                              }
                            >
                              Edit
                            </button>

                            {/* =========================
                                PREVIEW
                            ========================= */}

                            <button
                              className="inv-action-item"
                              onClick={() =>
                                (window.location.href =
                                  `/invoice/preview/${inv._id}`)
                              }
                            >
                              Preview
                            </button>

                            {/* =========================
                                DELETE
                            ========================= */}

                            <button
                              className="inv-action-item"
                              onClick={() =>
                                deleteInvoice(
                                  inv._id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>
                        )}

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {totalInvoices > 0 &&
            !isLoading && (

              <div className="inv-pagination">

                <span className="inv-page-info">
                  Showing {startItem} to{" "}
                  {endItem} of{" "}
                  {totalInvoices} invoices
                </span>

                <div className="inv-page-controls">

                  <button
                    className="inv-page-btn"
                    onClick={() =>
                      setCurrentPage(
                        (p) =>
                          Math.max(
                            p - 1,
                            1
                          )
                      )
                    }
                    disabled={
                      currentPage ===
                      1
                    }
                  >
                    ‹
                  </button>

                  {Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (_, i) =>
                      i + 1
                  ).map((p) => (

                    <button
                      key={p}
                      className={`inv-page-btn ${
                        currentPage ===
                        p
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setCurrentPage(
                          p
                        )
                      }
                    >
                      {p}
                    </button>

                  ))}

                  <button
                    className="inv-page-btn"
                    onClick={() =>
                      setCurrentPage(
                        (p) =>
                          Math.min(
                            p + 1,
                            totalPages
                          )
                      )
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                  >
                    ›
                  </button>

                </div>

              </div>

            )}

        </div>

      </div>
    </div>
  );
};

export default Invoices;