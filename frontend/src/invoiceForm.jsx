import "./invoiceForm.css";
import { useState, useEffect } from "react";
import instance from "./api/axios";
import states from "./getStates.js";
import { Delete16Regular } from "@fluentui/react-icons";
import { ToWords } from "to-words";

const createEmptyItem = () => ({
  Name: "",
  quantity: 1,
  rate: 0,
  HSNCode: "",
  amount: 0,
  cgstRate: 9,
  sgstRate: 9,
  igstRate: 18,
  isTaxable: false,
});

const InvoiceForm = () => {
  const [company, setCompany] = useState([]);
  const [companyId, setCompanyId] = useState("");

  const [amountInWords, setAmountInWords] =
    useState("");

  const [taxableAmount, setTaxableAmount] =
    useState(0);

  const [clients, setClients] = useState([]);

  const [selectedClientId, setSelectedClient] =
    useState("");

  const [taxType, setTaxType] =
    useState("CGST_SGST");

  const [sameAsBilling, setSameAsBilling] =
    useState(false);

  const [cgstAmount, setCgstAmount] =
    useState(0);

  const [sgstAmount, setSgstAmount] =
    useState(0);

  const [igstAmount, setIgstAmount] =
    useState(0);

  const [placeOfSupply, setPlaceOfSupply] =
    useState("");

  const [invoiceDate, setInvoiceDate] =
    useState("");

  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const [shippingAddress, setShippingAddress] =
    useState("");

  const [billingAddress, setBillingAddress] =
    useState("");

  const [PoNumber, setPoNumber] =
    useState("");

  const [PODate, setPODate] =
    useState("");

  const [
    ServiceOrderNumber,
    setServiceOrderNumber,
  ] = useState("");

  const [
    ServiceOrderDate,
    setServiceOrderDate,
  ] = useState("");

  const [error, setError] =
    useState(null);

  const [editingInvoice, setEditingInvoice] =
    useState(null);

  const [success, setSuccess] =
    useState(null);

  const [cgstRate, setCgstRate] =
    useState(9);

  const [sgstRate, setSgstRate] =
    useState(9);

  const [igstRate, setIgstRate] =
    useState(18);

  const [items, setItems] = useState([
    createEmptyItem(),
  ]);

  const [subtotal, setSubtotal] =
    useState(0);

  const [totalAmount, setTotalAmount] =
    useState(0);

  /* =========================================================
     ITEM CHANGE
  ========================================================= */

  const handleItemChange = (
    index,
    field,
    value
  ) => {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    const item = updatedItems[index];

    if (
      field === "quantity" ||
      field === "rate"
    ) {
      const quantity =
        Number(item.quantity || 0);

      const rate =
        Number(item.rate || 0);

      item.amount =
        quantity * rate;
    }

    if (field === "amount") {
      item.rate = "";
    }

    setItems(updatedItems);
  };

  /* =========================================================
     ADD ITEM
  ========================================================= */

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      createEmptyItem(),
    ]);
  };

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  const handleRemoveItem = (index) => {
    setItems((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  /* =========================================================
     CLEAR FORM
  ========================================================= */

  const clearForm = () => {
    setItems([
      createEmptyItem(),
    ]);

    setSubtotal(0);
    setTaxableAmount(0);

    setCgstAmount(0);
    setSgstAmount(0);
    setIgstAmount(0);

    setTotalAmount(0);

    setBillingAddress("");
    setShippingAddress("");

    setSameAsBilling(false);

    setSelectedClient("");

    setPlaceOfSupply("");

    setPoNumber("");
    setPODate("");

    setServiceOrderNumber("");
    setServiceOrderDate("");
  };

  /* =========================================================
     TO WORDS
  ========================================================= */

  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
    },
  });

  /* =========================================================
     CALCULATE TOTALS
  ========================================================= */

  useEffect(() => {
    const newSubtotal =
      items.reduce(
        (acc, item) =>
          acc +
          Number(item.amount || 0),
        0
      );

    setSubtotal(newSubtotal);

    const taxableSubtotal =
      items.reduce(
        (acc, item) =>
          acc +
          (item.isTaxable
            ? Number(
                item.amount || 0
              )
            : 0),
        0
      );

    setTaxableAmount(
      taxableSubtotal
    );

    let newCgstAmount = 0;
    let newSgstAmount = 0;
    let newIgstAmount = 0;

    if (
      taxType === "CGST_SGST"
    ) {
      newCgstAmount =
        items.reduce(
          (acc, item) =>
            acc +
            (item.isTaxable
              ? (Number(
                  item.amount || 0
                ) *
                  Number(
                    item.cgstRate ||
                      0
                  )) /
                100
              : 0),
          0
        );

      newSgstAmount =
        items.reduce(
          (acc, item) =>
            acc +
            (item.isTaxable
              ? (Number(
                  item.amount || 0
                ) *
                  Number(
                    item.sgstRate ||
                      0
                  )) /
                100
              : 0),
          0
        );
    }

    if (taxType === "IGST") {
      newIgstAmount =
        items.reduce(
          (acc, item) =>
            acc +
            (item.isTaxable
              ? (Number(
                  item.amount || 0
                ) *
                  Number(
                    item.igstRate ||
                      0
                  )) /
                100
              : 0),
          0
        );
    }

    setCgstAmount(
      newCgstAmount
    );

    setSgstAmount(
      newSgstAmount
    );

    setIgstAmount(
      newIgstAmount
    );

    const newTotalAmount =
      newSubtotal +
      newCgstAmount +
      newSgstAmount +
      newIgstAmount;

    setTotalAmount(
      newTotalAmount
    );
  }, [items, taxType]);

  /* =========================================================
     INVOICE DATE
  ========================================================= */

  const InvoiceDate = () => {
    const today = new Date();

    const formattedDate =
      today.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

    setInvoiceDate(
      formattedDate
    );
  };

  /* =========================================================
     FETCH COMPANY
     
     IMPORTANT:
     Do NOT overwrite placeOfSupply here when editing.
  ========================================================= */

  const fetchCompanyId = async () => {
    try {
      const response =
        await instance.get(
          "/company/get"
        );

      const data =
        response.data.company;

      setCompanyId(data._id);
      setCompany(data);

      /*
       * Only use company's PlaceOfSupply
       * for a NEW invoice.
       *
       * When editing, the existing invoice
       * value has already been loaded.
       */

      const storedEditingInvoice =
        localStorage.getItem(
          "editingInvoice"
        );

      if (!storedEditingInvoice) {
        setPlaceOfSupply(
          data.PlaceOfSupply || ""
        );
      }
    } catch (error) {
      console.error(
        "Error fetching company ID:",
        error
      );
    }
  };

  /* =========================================================
     FETCH CLIENTS
  ========================================================= */

  const fetchClient = async () => {
    try {
      const response =
        await instance.get(
          "/client/get"
        );

      setClients(
        response.data.clients || []
      );
    } catch (error) {
      console.error(
        "Error while fetching Clients:",
        error
      );
    }
  };

  /* =========================================================
     FINANCIAL YEAR
  ========================================================= */

  const getFinancialYear = () => {
    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      today.getMonth() + 1;

    return month >= 4
      ? `${year}-${year + 1}`
      : `${year - 1}-${year}`;
  };

  /* =========================================================
     FETCH NEW INVOICE NUMBER
     
     ONLY USED FOR NEW INVOICES.
  ========================================================= */

  const fetchInvoiceNumber =
    async () => {
      const financialYear =
        getFinancialYear();

      let nextInvoiceNumber =
        `INV/${financialYear}/0001`;

      try {
        const response =
          await instance.get(
            `/invoice/year/${financialYear}`
          );

        const invoices =
          response.data.invoices ||
          [];

        if (invoices.length > 0) {
          const highestNumber =
            invoices.reduce(
              (max, invoice) => {
                const parts =
                  invoice.invoiceNumber?.split(
                    "/"
                  );

                if (
                  !parts ||
                  parts.length !== 3
                ) {
                  return max;
                }

                const num =
                  parseInt(
                    parts[2],
                    10
                  );

                if (
                  isNaN(num)
                ) {
                  return max;
                }

                return num > max
                  ? num
                  : max;
              },
              0
            );

          nextInvoiceNumber =
            `INV/${financialYear}/${String(
              highestNumber + 1
            ).padStart(4, "0")}`;
        }
      } catch (error) {
        console.log(
          "No existing invoices found, defaulting to first invoice.",
          error
        );
      } finally {
        setInvoiceNumber(
          nextInvoiceNumber
        );
      }
    };

  /* =========================================================
     LOAD EDITING INVOICE
     
     This receives the COMPLETE invoice because invoice.jsx
     now calls /invoice/get/:id before redirecting.
  ========================================================= */

  useEffect(() => {
    const storedEditingInvoice =
      localStorage.getItem(
        "editingInvoice"
      );

    if (!storedEditingInvoice) {
      return;
    }

    try {
      const invoiceData =
        JSON.parse(
          storedEditingInvoice
        );

      console.log(
        "EDITING INVOICE:",
        invoiceData
      );

      setEditingInvoice(
        invoiceData
      );

      /* =========================
         CUSTOMER
      ========================= */

      const clientId =
        invoiceData.customerId?._id ||
        invoiceData.customerId ||
        "";

      setSelectedClient(
        clientId
      );

      /* =========================
         BASIC INFORMATION
      ========================= */

      setInvoiceNumber(
        invoiceData.invoiceNumber ||
          ""
      );

      if (
        invoiceData.invoiceDate
      ) {
        setInvoiceDate(
          new Date(
            invoiceData.invoiceDate
          ).toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }
          )
        );
      }

      /* =========================
         GST
      ========================= */

      setTaxType(
        invoiceData.taxType ||
          "CGST_SGST"
      );

      setCgstRate(
        Number(
          invoiceData.cgst?.rate ??
            invoiceData.cgstRate ??
            9
        )
      );

      setSgstRate(
        Number(
          invoiceData.sgst?.rate ??
            invoiceData.sgstRate ??
            9
        )
      );

      setIgstRate(
        Number(
          invoiceData.igst?.rate ??
            invoiceData.igstRate ??
            18
        )
      );

      /* =========================
         PLACE OF SUPPLY
      ========================= */

      setPlaceOfSupply(
        invoiceData.placeOfSupply ||
          ""
      );

      /* =========================
         ADDRESSES
      ========================= */

      setBillingAddress(
        invoiceData.billingAddress ||
          ""
      );

      setShippingAddress(
        invoiceData.shippingAddress ||
          ""
      );

      /* =========================
         PO
      ========================= */

      setPoNumber(
        invoiceData.PoNumber ||
          ""
      );

      setPODate(
        invoiceData.PODate ||
          ""
      );

      /* =========================
         SERVICE ORDER
      ========================= */

      setServiceOrderNumber(
        invoiceData.ServiceOrderNumber ||
          ""
      );

      setServiceOrderDate(
        invoiceData.ServiceOrderDate ||
          ""
      );

      /* =========================
         ITEMS
      ========================= */

      const normalizedItems =
        Array.isArray(
          invoiceData.items
        )
          ? invoiceData.items.map(
              (item) => ({
                ...item,

                Name:
                  item.Name || "",

                HSNCode:
                  item.HSNCode ||
                  "",

                quantity:
                  Number(
                    item.quantity ??
                      1
                  ),

                rate:
                  Number(
                    item.rate ??
                      0
                  ),

                amount:
                  Number(
                    item.amount ??
                      0
                  ),

                cgstRate:
                  Number(
                    item.cgstRate ??
                      invoiceData
                        .cgst
                        ?.rate ??
                      9
                  ),

                sgstRate:
                  Number(
                    item.sgstRate ??
                      invoiceData
                        .sgst
                        ?.rate ??
                      9
                  ),

                igstRate:
                  Number(
                    item.igstRate ??
                      invoiceData
                        .igst
                        ?.rate ??
                      18
                  ),

                isTaxable:
                  item.isTaxable ===
                  true,
              })
            )
          : [];

      if (
        normalizedItems.length >
        0
      ) {
        setItems(
          normalizedItems
        );
      } else {
        setItems([
          createEmptyItem(),
        ]);
      }

      /* =========================
         EXISTING TOTALS
      ========================= */

      setSubtotal(
        Number(
          invoiceData.subtotal ||
            0
        )
      );

      setTaxableAmount(
        Number(
          invoiceData.taxableAmount ||
            invoiceData.subtotal ||
            0
        )
      );

      setCgstAmount(
        Number(
          invoiceData.cgst
            ?.amount ||
            invoiceData.cgstAmount ||
            0
        )
      );

      setSgstAmount(
        Number(
          invoiceData.sgst
            ?.amount ||
            invoiceData.sgstAmount ||
            0
        )
      );

      setIgstAmount(
        Number(
          invoiceData.igst
            ?.amount ||
            invoiceData.igstAmount ||
            0
        )
      );

      setTotalAmount(
        Number(
          invoiceData.totalAmount ||
            0
        )
      );
    } catch (error) {
      console.error(
        "Error loading invoice for editing:",
        error
      );

      localStorage.removeItem(
        "editingInvoice"
      );
    }
  }, []);

  /* =========================================================
     INITIAL DATA
     
     IMPORTANT:
     Don't generate invoice number/date while editing.
  ========================================================= */

  useEffect(() => {
    const storedEditingInvoice =
      localStorage.getItem(
        "editingInvoice"
      );

    fetchCompanyId();
    fetchClient();

    if (!storedEditingInvoice) {
      InvoiceDate();
      fetchInvoiceNumber();
    }
  }, []);

  /* =========================================================
     SELECTED CLIENT
  ========================================================= */

  const selectClient =
    clients.find(
      (client) =>
        client._id ===
        selectedClientId
    );

  /* =========================================================
     CLIENT BILLING ADDRESS
  ========================================================= */

  useEffect(() => {
    /*
     * Don't overwrite the billing address
     * while editing an existing invoice.
     */

    if (
      !editingInvoice &&
      selectClient?.address
    ) {
      setBillingAddress(
        selectClient.address
      );
    }
  }, [
    selectClient,
    editingInvoice,
  ]);

  /* =========================================================
     SAME AS BILLING
  ========================================================= */

  useEffect(() => {
    if (sameAsBilling) {
      setShippingAddress(
        billingAddress
      );
    }
  }, [
    sameAsBilling,
    billingAddress,
  ]);

  /* =========================================================
     AMOUNT IN WORDS
  ========================================================= */

  useEffect(() => {
    if (totalAmount > 0) {
      setAmountInWords(
        toWords.convert(
          totalAmount
        )
      );
    } else {
      setAmountInWords(
        "Zero Rupees Only"
      );
    }
  }, [totalAmount]);

  /* =========================================================
     CREATE / UPDATE INVOICE
  ========================================================= */

  const CreateInvoice = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (editingInvoice) {
        /* =========================
           UPDATE
        ========================= */

        const response =
          await instance.put(
            `/invoice/update/${editingInvoice._id}`,
            {
              companyId,

              customerId:
                selectedClientId,

              items,

              taxType,

              cgstRate,
              sgstRate,
              igstRate,

              placeOfSupply,

              shippingAddress,
              billingAddress,

              PoNumber,
              PODate,

              ServiceOrderNumber,
              ServiceOrderDate,
            }
          );

        console.log(
          "Invoice updated:",
          response.data
        );

        localStorage.removeItem(
          "editingInvoice"
        );

        setSuccess(
          "✅ Invoice updated successfully!"
        );
      } else {
        /* =========================
           CREATE
        ========================= */

        const response =
          await instance.post(
            "/invoice/create",
            {
              companyId,

              customerId:
                selectedClientId,

              taxType,

              cgstRate,
              sgstRate,
              igstRate,

              placeOfSupply,

              invoiceNumber,

              shippingAddress,

              items,

              billingAddress,

              PoNumber,
              PODate,

              ServiceOrderNumber,
              ServiceOrderDate,
            }
          );

        console.log(
          "Invoice created successfully:",
          response.data
        );

        setSuccess(
          "✅ Invoice created successfully!"
        );

        clearForm();

        localStorage.removeItem(
          "editingInvoice"
        );
      }
    } catch (error) {
      console.error(
        "Error saving invoice:",
        error
      );

      setError(
        error.response?.data?.Msg ||
          error.response?.data?.message ||
          "Failed to save invoice. Please try again."
      );

      setSuccess(null);
    }
  };

  return (
    <div className="invoiceContainerForm">

      <h1 id="text">
        {editingInvoice
          ? "Edit Invoice"
          : "Create Invoice"}
      </h1>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="invoiceFormHeader">

        <div className="leftHeader">

          {/* COMPANY */}

          <div className="company">

            <p>
              <strong>
                Your Details
              </strong>
            </p>

            {company && (
              <>
                <h3>
                  {company.CompanyName}
                </h3>

                <p id="special">
                  {company.Address}
                </p>

                <p id="special">
                  GSTIN:{" "}
                  <strong>
                    {company.GSTNumber}
                  </strong>
                </p>

                <p id="special">
                  PAN:{" "}
                  <strong>
                    {company.panNumber}
                  </strong>
                </p>

                <div className="contact">

                  <p
                    id="special"
                    className="phone"
                  >
                    +91{" "}
                    {company.phoneNumber}
                  </p>

                  <div className="border"></div>

                  <p id="special">
                    {company.Email}
                  </p>

                </div>
              </>
            )}

          </div>

          {/* CLIENT */}

          <div className="client">

            <p>
              <strong>
                Client Selection
              </strong>
            </p>

            <select
              id="select"
              value={
                selectedClientId
              }
              onChange={(e) =>
                setSelectedClient(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Client
              </option>

              {clients.map(
                (client) => (
                  <option
                    key={
                      client._id
                    }
                    value={
                      client._id
                    }
                  >
                    {
                      client.clientName
                    }{" "}
                    -{" "}
                    {
                      client.gstNumber
                    }
                  </option>
                )
              )}
            </select>

            <h3>
              {
                selectClient?.clientName
              }
            </h3>

            <p id="special">
              {selectClient?.address}
            </p>

            <p id="special">
              GSTIN:{" "}
              <strong>
                {
                  selectClient?.gstNumber ||
                  "N/A"
                }
              </strong>
            </p>

            <div className="contact">

              <p
                id="special"
                className="phone"
              >
                +91{" "}
                {
                  selectClient?.phoneNumber
                }
              </p>

              <div className="border"></div>

              <p id="special">
                {selectClient?.email}
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <div className="rightHeader">

          <p>
            <strong>
              Invoice Summary
            </strong>
          </p>

          <div className="Mainsection">

            <div className="leftSectionInvoice">
              <p>Total Items</p>
              <p>Subtotal Amount</p>
              <p>CGST</p>
              <p>SGST</p>
              <p>IGST</p>
            </div>

            <div className="RigthSectionInvoice">

              <p>
                {items.length}
              </p>

              <p>
                {Number(
                  subtotal || 0
                ).toFixed(2)}
              </p>

              <p>
                {Number(
                  cgstAmount || 0
                ).toFixed(2)}
              </p>

              <p>
                {Number(
                  sgstAmount || 0
                ).toFixed(2)}
              </p>

              <p>
                {Number(
                  igstAmount || 0
                ).toFixed(2)}
              </p>

            </div>

          </div>

          <div className="grandTotal">

            <div className="leftTotal">
              <h3>
                Grand Total
              </h3>
            </div>

            <div className="rightTotal">
              <h3>
                ₹{" "}
                {Number(
                  totalAmount || 0
                ).toFixed(2)}
              </h3>
            </div>

          </div>

          <div className="wordAmount">

            <h3>
              Amount in Words:
            </h3>

            <p id="special">
              {amountInWords}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          INVOICE INFORMATION
      ===================================================== */}

      <div className="invoiceInfo">

        <div className="infoInvoice">

          <h3>
            Invoice Information
          </h3>

          <div className="invoiceNumber">
            <label>
              Invoice Number:
            </label>

            <input
              type="text"
              value={
                invoiceNumber
              }
              onChange={(e) =>
                setInvoiceNumber(
                  e.target.value
                )
              }
            />
          </div>

          <div className="invoiceNumber">

            <label>
              Invoice Date:
            </label>

            <input
              type="text"
              value={
                invoiceDate
              }
              readOnly
            />

          </div>

          <div className="invoiceNumber">

            <label>
              PO Number:
            </label>

            <input
              type="text"
              value={
                PoNumber
              }
              onChange={(e) =>
                setPoNumber(
                  e.target.value
                )
              }
            />

          </div>

          <div className="invoiceNumber">

            <label>
              PO Date:
            </label>

            <input
              type="text"
              value={
                PODate
              }
              onChange={(e) =>
                setPODate(
                  e.target.value
                )
              }
            />

          </div>

          <div className="invoiceNumber">

            <label>
              Service Order Number:
            </label>

            <input
              type="text"
              value={
                ServiceOrderNumber
              }
              onChange={(e) =>
                setServiceOrderNumber(
                  e.target.value
                )
              }
            />

          </div>

          <div className="invoiceNumber">

            <label>
              Service Order Date:
            </label>

            <input
              type="text"
              value={
                ServiceOrderDate
              }
              onChange={(e) =>
                setServiceOrderDate(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* =====================================================
            GST TYPE
        ===================================================== */}

        <div className="gstType">

          <h3>
            GST Type
          </h3>

          <div className="buttonsInvoice">

            <button
              className={
                taxType ===
                "CGST_SGST"
                  ? "activeTaxBtn"
                  : "taxBtn"
              }
              onClick={() =>
                setTaxType(
                  "CGST_SGST"
                )
              }
            >
              CGST + SGST
            </button>

            <button
              className={
                taxType ===
                "IGST"
                  ? "activeTaxBtn"
                  : "taxBtn"
              }
              onClick={() =>
                setTaxType(
                  "IGST"
                )
              }
            >
              IGST
            </button>

          </div>

          <div className="placeOfSupplyInvoice">

            <label>
              Place of Supply:
            </label>

            <select
              id="select"
              value={
                placeOfSupply
              }
              onChange={(e) =>
                setPlaceOfSupply(
                  e.target.value
                )
              }
            >

              <option value="">
                Select Your Place of Supply
              </option>

              {states.map(
                (state) => (
                  <option
                    key={
                      state.code
                    }
                    value={
                      state.name
                    }
                  >
                    {state.code} -{" "}
                    {state.name}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

      </div>

      {/* =====================================================
          ADDRESSES
      ===================================================== */}

      <div className="addresses">

        <div className="billingAddress">

          <label>
            Billing Address:
          </label>

          <input
            type="text"
            value={
              billingAddress
            }
            onChange={(e) =>
              setBillingAddress(
                e.target.value
              )
            }
          />

        </div>

        <div className="shippingAddress">

          <label>
            Shipping Address:
          </label>

          <input
            type="checkbox"
            id="sameAsBilling"
            checked={
              sameAsBilling
            }
            onChange={(e) =>
              setSameAsBilling(
                e.target.checked
              )
            }
          />

          <label htmlFor="sameAsBilling">
            Same as Billing Address
          </label>

          <input
            type="text"
            value={
              shippingAddress
            }
            onChange={(e) =>
              setShippingAddress(
                e.target.value
              )
            }
          />

        </div>

      </div>

      {/* =====================================================
          ITEMS
      ===================================================== */}

      <div className="itemsInvoice">

        <h3>
          Items
        </h3>

        <table className="InvoiceTable">

          <thead>

            <tr>

              <th rowSpan="2">
                #
              </th>

              <th rowSpan="2">
                Item Description
              </th>

              <th rowSpan="2">
                HSN/SAC
              </th>

              <th rowSpan="2">
                QTY
              </th>

              <th rowSpan="2">
                Rate (₹)
              </th>

              <th rowSpan="2">
                Taxable
                <br />
                Amount (₹)
              </th>

              {taxType ===
                "CGST_SGST" && (
                <>
                  <th colSpan="2">
                    CGST
                  </th>

                  <th colSpan="2">
                    SGST
                  </th>
                </>
              )}

              {taxType ===
                "IGST" && (
                <th colSpan="2">
                  IGST
                </th>
              )}

              <th rowSpan="2">
                Total
                <br />
                Amount (₹)
              </th>

              <th rowSpan="2">
                Is
                <br />
                Taxable?
              </th>

              <th rowSpan="2">
                Action
              </th>

            </tr>

            <tr>

              {taxType ===
                "CGST_SGST" && (
                <>
                  <th>
                    Rate (%)
                  </th>

                  <th>
                    Amount (₹)
                  </th>

                  <th>
                    Rate (%)
                  </th>

                  <th>
                    Amount (₹)
                  </th>
                </>
              )}

              {taxType ===
                "IGST" && (
                <>
                  <th>
                    Rate (%)
                  </th>

                  <th>
                    Amount (₹)
                  </th>
                </>
              )}

            </tr>

          </thead>

          <tbody>

            {items.map(
              (item, index) => (

                <tr key={index}>

                  <td>
                    {index + 1}
                  </td>

                  <td id="desc">
                    <textarea
                      id="description"
                      value={
                        item.Name
                      }
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "Name",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td id="hsn">

                    <input
                      type="text"
                      value={
                        item.HSNCode
                      }
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "HSNCode",
                          e.target.value
                        )
                      }
                    />

                  </td>

                  <td id="qty">

                    <input
                      type="number"
                      value={
                        item.quantity
                      }
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                    />

                  </td>

                  <td id="rate">

                    <input
                      type="number"
                      value={
                        item.rate
                      }
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "rate",
                          e.target.value
                        )
                      }
                    />

                  </td>

                  <td id="taxable">

                    <input
                      type="number"
                      value={
                        item.amount
                      }
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "amount",
                          e.target.value
                        )
                      }
                    />

                  </td>

                  {/* =========================
                      CGST + SGST
                  ========================= */}

                  {taxType ===
                    "CGST_SGST" && (
                    <>

                      <td id="cgstRate">

                        <input
                          type="number"
                          value={
                            item.cgstRate
                          }
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "cgstRate",
                              Number(
                                e.target
                                  .value
                              )
                            )
                          }
                        />

                      </td>

                      <td id="cgstAmount">

                        <input
                          type="number"
                          value={
                            item.isTaxable
                              ? (
                                  (Number(
                                    item.amount ||
                                      0
                                  ) *
                                    Number(
                                      item.cgstRate ||
                                        0
                                    )) /
                                  100
                                ).toFixed(
                                  2
                                )
                              : 0
                          }
                          readOnly
                        />

                      </td>

                      <td id="sgstRate">

                        <input
                          type="number"
                          value={
                            item.sgstRate
                          }
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "sgstRate",
                              Number(
                                e.target
                                  .value
                              )
                            )
                          }
                        />

                      </td>

                      <td id="sgstAmount">

                        <input
                          type="number"
                          value={
                            item.isTaxable
                              ? (
                                  (Number(
                                    item.amount ||
                                      0
                                  ) *
                                    Number(
                                      item.sgstRate ||
                                        0
                                    )) /
                                  100
                                ).toFixed(
                                  2
                                )
                              : 0
                          }
                          readOnly
                        />

                      </td>

                    </>
                  )}

                  {/* =========================
                      IGST
                  ========================= */}

                  {taxType ===
                    "IGST" && (
                    <>

                      <td id="igstRate">

                        <input
                          type="number"
                          value={
                            item.igstRate
                          }
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "igstRate",
                              Number(
                                e.target
                                  .value
                              )
                            )
                          }
                        />

                      </td>

                      <td id="igstAmount">

                        <input
                          type="number"
                          value={
                            item.isTaxable
                              ? (
                                  (Number(
                                    item.amount ||
                                      0
                                  ) *
                                    Number(
                                      item.igstRate ||
                                        0
                                    )) /
                                  100
                                ).toFixed(
                                  2
                                )
                              : 0
                          }
                          readOnly
                        />

                      </td>

                    </>
                  )}

                  {/* =========================
                      TOTAL
                  ========================= */}

                  <td id="totalAmount">

                    <input
                      type="number"
                      value={(
                        Number(
                          item.amount ||
                            0
                        ) +
                        (item.isTaxable
                          ? taxType ===
                            "CGST_SGST"
                            ? (
                                Number(
                                  item.amount ||
                                    0
                                ) *
                                  Number(
                                    item.cgstRate ||
                                      0
                                  )
                              ) /
                                100 +
                              (
                                Number(
                                  item.amount ||
                                    0
                                ) *
                                  Number(
                                    item.sgstRate ||
                                      0
                                  )
                              ) /
                                100
                            : (
                                Number(
                                  item.amount ||
                                    0
                                ) *
                                  Number(
                                    item.igstRate ||
                                      0
                                  )
                              ) /
                              100
                          : 0)
                      ).toFixed(2)}
                      readOnly
                    />

                  </td>

                  {/* =========================
                      TAXABLE CHECKBOX
                  ========================= */}

                  <td id="isTaxable">

                    <input
                      type="checkbox"
                      checked={
                        item.isTaxable
                      }
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "isTaxable",
                          e.target.checked
                        )
                      }
                    />

                  </td>

                  {/* =========================
                      DELETE
                  ========================= */}

                  <td id="action">

                    <button
                      onClick={() =>
                        handleRemoveItem(
                          index
                        )
                      }
                    >
                      <Delete16Regular />
                    </button>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

        <div className="btn">

          <button
            className="addItemBtn"
            onClick={
              handleAddItem
            }
          >
            Add
          </button>

        </div>

        <div className="create">

          <button
            className="createBtn"
            onClick={
              CreateInvoice
            }
          >
            {editingInvoice
              ? "Update Invoice"
              : "Create Invoice"}
          </button>

        </div>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {success && (
          <p className="success">
            {success}
          </p>
        )}

      </div>

    </div>
  );
};

export default InvoiceForm;