import "./invoiceForm.css";
import { useState, useEffect } from "react";
import instance from "./api/axios";
import states from "./getStates.js";
import { Delete16Regular } from "@fluentui/react-icons";
import { ToWords } from "to-words";

const ProformaForm = () => {

  const [company, setCompany] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [amountInWords, setAmountInWords] = useState("");
  const [taxableAmount, setTaxableAmount] = useState(0);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClient] = useState("");
  const [taxType, setTaxType] = useState("CGST_SGST");
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [cgstAmount, setCgstAmount] = useState(0);
  const [sgstAmount, setSgstAmount] = useState(0);
  const [igstAmount, setIgstAmount] = useState(0);
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [error, setError] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [success, setSuccess] = useState(null);


  // FIX 4: cgstRate, sgstRate, igstRate were never declared as state
  const [cgstRate, setCgstRate] = useState(9);
  const [sgstRate, setSgstRate] = useState(9);
  const [igstRate, setIgstRate] = useState(18);

  const [items, setItems] = useState([
    {
      Name: "",
      quantity: 1,
      rate: 0,
      HSNCode: "",
      amount: 0,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18,
      isTaxable: false,
    },
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    const item = updatedItems[index];

    if (field === "quantity" || field === "rate") {
      if (item.quantity && item.rate) {
        item.amount = parseFloat(item.quantity) * parseFloat(item.rate);
      }
    }

    if (field === "amount") {
      item.quantity = "";
      item.rate = "";
    }

    setItems(updatedItems);
  };

  const clearForm = () => {
    setItems([
      {
        Name: "",
        quantity: 1,
        rate: 0,
        HSNCode: "",
        amount: 0,
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 18,
        isTaxable: false,
      },
    ]);
    setSubtotal(0);
    setCgstAmount(0);
    setSgstAmount(0);
    setIgstAmount(0);
    setTotalAmount(0);
    setBillingAddress("");
    setShippingAddress("");
    setSameAsBilling(false);
    setSelectedClient("");
    setPlaceOfSupply("");
  };
  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
    },
  })

  // FIX 3: handleAddItem was missing — the setItems call was floating loose
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        Name: "",
        quantity: 1,
        rate: 0,
        HSNCode: "",
        amount: 0,
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 18,
        isTaxable: false,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  // FIX 2 & 5 & 6: Removed duplicate useEffect, fixed stale taxableAmount,
  // removed nested duplicate if block
  useEffect(() => {
  const newSubtotal = items.reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );
  setSubtotal(newSubtotal);

const taxableSubtotal = items.reduce(
  (acc, item) => acc + Number(item.amount || 0),
  0
);
setTaxableAmount(taxableSubtotal);

  let newCgstAmount = 0;
  let newSgstAmount = 0;
  let newIgstAmount = 0;

  if (taxType === "CGST_SGST") {
    // FIX: Sum per-item tax using each item's own rate, only if taxable
    newCgstAmount = items.reduce(
      (acc, item) =>
        acc +
        (item.isTaxable
          ? (Number(item.amount || 0) * Number(item.cgstRate || 0)) / 100
          : 0),
      0
    );
    newSgstAmount = items.reduce(
      (acc, item) =>
        acc +
        (item.isTaxable
          ? (Number(item.amount || 0) * Number(item.sgstRate || 0)) / 100
          : 0),
      0
    );
  } else if (taxType === "IGST") {
    newIgstAmount = items.reduce(
      (acc, item) =>
        acc +
        (item.isTaxable
          ? (Number(item.amount || 0) * Number(item.igstRate || 0)) / 100
          : 0),
      0
    );
  }

  setCgstAmount(newCgstAmount);
  setSgstAmount(newSgstAmount);
  setIgstAmount(newIgstAmount);

  const newTotalAmount =
    newSubtotal + newCgstAmount + newSgstAmount + newIgstAmount;
  setTotalAmount(newTotalAmount);

}, [items, taxType]);

  const InvoiceDate = () => {
    const today = new Date();
    const formattedDate = today.toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    setInvoiceDate(formattedDate);
  };

  const fetchCompanyId = async () => {
    try {
      const response = await instance.get("/company/get");
      const data = response.data.company;
      setCompanyId(data._id);
      setCompany(data);
      setPlaceOfSupply(data.PlaceOfSupply);
    } catch (error) {
      console.error("Error fetching company ID:", error);
    }
  };

  const fetchClient = async () => {
    try {
      const response = await instance.get("/client/get");
      setClients(response.data.clients);
    } catch (error) {
      console.log("Error while fetching the Clients", error);
    }
  };

  const getFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  const fetchInvoiceNumber = async () => {
    try {
      const response = await instance.get(
        `/proforma/year/${getFinancialYear()}`
      );
      const invoiceCount = response.data.InvoiceCount;
      const newInvoiceNumber = invoiceCount + 1;
      setInvoiceNumber(newInvoiceNumber);
    } catch (error) {
      console.log("Error while fetching the Invoice Number", error);
    }
  };

const CreateInvoice = async () => {
  try {
    if (editingInvoice) {
      await instance.put(
        `/proforma/update/${editingInvoice._id}`,
        {
          companyId,
          customerId: selectedClientId,
          items,
          taxType,
          cgstRate,
          sgstRate,
          igstRate,
          placeOfSupply,
          shippingAddress,
          billingAddress,
        }
      );

      localStorage.removeItem("editingInvoice");
      setSuccess("✅ Invoice updated successfully!");

    } else {
      const response = await instance.post("/proforma/create", {
        companyId,
        customerId: selectedClientId,
        taxType,
        cgstRate,
        sgstRate,
        igstRate,
        placeOfSupply,
        shippingAddress,
        items,
        billingAddress,
      });
      const data = response.data;
      setSuccess("✅ Invoice created successfully!");
      clearForm();
      localStorage.removeItem("editingInvoice"); 
      setError(null);
      console.log("Invoice created successfully:", data);
    }
  } catch (error) {
    console.error("Error saving invoice:", error);
    setError(
      error.response?.data?.Msg || "Failed to save invoice. Please try again."
    );
    setSuccess(null);
  }
};

useEffect(() => {
  const storedEditingInvoice = localStorage.getItem("editingInvoice");
  if (storedEditingInvoice) {
    const invoiceData = JSON.parse(storedEditingInvoice);
    setEditingInvoice(invoiceData);

    const clientId = invoiceData.customerId?._id || invoiceData.customerId || "";
    setSelectedClient(clientId);

    setPlaceOfSupply(invoiceData.placeOfSupply || "");
    setShippingAddress(invoiceData.shippingAddress || "");
    setBillingAddress(invoiceData.billingAddress || "");

    // FIX: normalize items — DB may store cgst/sgst as objects or missing fields
    const normalizedItems = (invoiceData.items || []).map((item) => ({
      ...item,
      cgstRate: Number(item.cgstRate ?? invoiceData.cgst?.rate ?? invoiceData.cgstRate ?? 9),
      sgstRate: Number(item.sgstRate ?? invoiceData.sgst?.rate ?? invoiceData.sgstRate ?? 9),
      igstRate: Number(item.igstRate ?? invoiceData.igst?.rate ?? invoiceData.igstRate ?? 18),
      amount:   Number(item.amount || 0),
      quantity: Number(item.quantity || 1),
      rate:     Number(item.rate || 0),
      isTaxable: item.isTaxable ?? false,
    }));
    setItems(normalizedItems);

    setSubtotal(Number(invoiceData.subtotal || 0));
    setTaxType(invoiceData.taxType || "CGST_SGST");
    setCgstRate(Number(invoiceData.cgst?.rate || invoiceData.cgstRate || 9));
    setSgstRate(Number(invoiceData.sgst?.rate || invoiceData.sgstRate || 9));
    setIgstRate(Number(invoiceData.igst?.rate || invoiceData.igstRate || 18));
    setCgstAmount(Number(invoiceData.cgst?.amount || invoiceData.cgstAmount || 0));
    setSgstAmount(Number(invoiceData.sgst?.amount || invoiceData.sgstAmount || 0));
    setIgstAmount(Number(invoiceData.igst?.amount || invoiceData.igstAmount || 0));
    setTotalAmount(Number(invoiceData.totalAmount || 0));
  }
}, []);
  useEffect(() => {
    InvoiceDate();
    fetchCompanyId();
    fetchClient();
    fetchInvoiceNumber();
  }, []);

  // FIX 7: Removed the broken useEffect that used selectClient before declaration
  const selectClient = clients.find(
    (client) => client._id === selectedClientId
  );

  useEffect(() => {
    if (selectClient?.address) {
      setBillingAddress(selectClient.address);
    }
  }, [selectClient]);

  useEffect(() => {
    if (sameAsBilling) {
      setShippingAddress(billingAddress);
    }
  }, [sameAsBilling, billingAddress]);
  useEffect(() => {
  if (totalAmount > 0) {
    setAmountInWords(toWords.convert(totalAmount));
  } else {
    setAmountInWords("Zero Rupees Only");
  }
}, [totalAmount]);

  return (
    <div className="invoiceContainerForm">
      <h1 id="text">Create Proforma Invoice</h1>
      <div className="invoiceFormHeader">
        <div className="leftHeader">
          <div className="company">
            <p>
              <strong>Your Details</strong>
            </p>
            {company && (
              <>
                <h3>{company.CompanyName}</h3>
                <p id="special">{company.Address}</p>
                <p id="special">
                  GSTIN: <strong>{company.GSTNumber}</strong>
                </p>
                <p id="special">
                  PAN: <strong>{company.panNumber}</strong>
                </p>
                <div className="contact">
                  <p id="special" className="phone">
                    +91 {company.phoneNumber}
                  </p>
                  <div className="border"></div>
                  <p id="special">{company.Email}</p>
                </div>
              </>
            )}
          </div>
          <div className="client">
            <p>
              <strong>Client Selection</strong>
            </p>
            <select
              id="select"
              value={selectedClientId}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.clientName} - {client.gstNumber}
                </option>
              ))}
            </select>
            <h3>{selectClient?.clientName}</h3>
            <p id="special">{selectClient?.address}</p>
            <p id="special">
              GSTIN: <strong>{selectClient?.gstNumber || "N/A"}</strong>
            </p>
            <div className="contact">
              <p id="special" className="phone">
                +91 {selectClient?.phoneNumber}
              </p>
              <div className="border"></div>
              <p id="special">{selectClient?.email}</p>
            </div>
          </div>
        </div>

        <div className="rightHeader">
          <p>
            <strong>Invoice Summary</strong>
          </p>
          <div className="Mainsection">
            <div className="leftSectionInvoice">
              <p>Total Items</p>
              <p>Subtotal Amount</p>
              <p>CGST</p>
              <p>SGST</p>
              <p>IGST</p>
            </div>
            {/* FIX 10: Added missing sgstAmount and igstAmount display rows */}
            <div className="RigthSectionInvoice">
              <p>{items.length}</p>
              <p>{Number(taxableAmount || 0).toFixed(2)}</p>
<p>{Number(cgstAmount || 0).toFixed(2)}</p>
<p>{Number(sgstAmount || 0).toFixed(2)}</p>
<p>{Number(igstAmount || 0).toFixed(2)}</p>
            </div>
          </div>
            <div className="grandTotal">
            <div className="leftTotal">
              <h3>Grand Total</h3>
            </div>
            <div className="rightTotal">
             <h3>₹ {Number(totalAmount || 0).toFixed(2)}</h3>
      
            </div>
          </div>
          <div className="wordAmount">
            <h3>Amount in Words:</h3>
            <p id="special">{amountInWords}</p>
          </div>
        </div>
        
      </div>

      <div className="invoiceInfo">
        <div className="infoInvoice">
          <h3>Invoice Information</h3>
          <div className="invoiceNumber">
            <label>Invoice Number:</label>
            <input
              type="text"
              value={`PERFORMA-INV-${getFinancialYear()}-${invoiceNumber}`}
              readOnly
            />
          </div>
          <div className="invoiceNumber">
            <label>Invoice Date:</label>

            <input type="text" value={invoiceDate} readOnly />
          </div>
        </div>
        <div className="gstType">
          <h3>GST Type</h3>
          <div className="buttonsInvoice">
            <button
              className={taxType === "CGST_SGST" ? "activeTaxBtn" : "taxBtn"}
              onClick={() => setTaxType("CGST_SGST")}
            >
              CGST + SGST
            </button>
            <button
              className={taxType === "IGST" ? "activeTaxBtn" : "taxBtn"}
              onClick={() => setTaxType("IGST")}
            >
              IGST
            </button>
          </div>
          <div className="placeOfSupplyInvoice">
            <label>Place of Supply:</label>
            <select
              id="select"
              value={placeOfSupply}
              onChange={(e) => setPlaceOfSupply(e.target.value)}
            >
              <option value="">Select Your Place of Supply</option>
              {states.map((state) => (
                <option key={state.code} value={state.name}>
                  {state.code} - {state.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="addresses">
        <div className="billingAddress">
          <label>Billing Address:</label>
          <input
            type="text"
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
          />
        </div>
        <div className="shippingAddress">
          <label>Shipping Address:</label>
          <input
            type="checkbox"
            id="sameAsBilling"
            checked={sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
          />
          <label htmlFor="sameAsBilling">Same as Billing Address</label>
          <input
            type="text"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="itemsInvoice">
        <h3>Items</h3>
        <table className="InvoiceTable">
          <thead>
            <tr>
              <th rowSpan="2">#</th>
              <th rowSpan="2">Item Description</th>
              <th rowSpan="2">HSN/SAC</th>
              <th rowSpan="2">QTY</th>
              <th rowSpan="2">Rate (₹)</th>
              <th rowSpan="2">
                Taxable <br /> Amount (₹)
              </th>
              {taxType === "CGST_SGST" && (
                <>
                  <th colSpan="2">CGST</th>
                  <th colSpan="2">SGST</th>
                </>
              )}
              {taxType === "IGST" && <th colSpan="2">IGST</th>}
              <th rowSpan="2">
                Total <br /> Amount (₹)
              </th>
              <th rowSpan="2">
                Is <br /> Taxable?
              </th>
              <th rowSpan="2">Action</th>
            </tr>
            <tr>
              {taxType === "CGST_SGST" && (
                <>
                  <th>Rate (%)</th>
                  <th>Amount (₹)</th>
                  <th>Rate (%)</th>
                  <th>Amount (₹)</th>
                </>
              )}
              {taxType === "IGST" && (
                <>
                  <th>Rate (%)</th>
                  <th>Amount (₹)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td id="desc">
                  <textarea
                    id="description"
                    value={item.Name}
                    onChange={(e) =>
                      handleItemChange(index, "Name", e.target.value)
                    }
                  ></textarea>
                </td>
                <td id="hsn">
                  <input
                    type="text"
                    value={item.HSNCode}
                    onChange={(e) =>
                      handleItemChange(index, "HSNCode", e.target.value)
                    }
                  />
                </td>
                <td id="qty">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                  />
                </td>
                <td id="rate">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(index, "rate", e.target.value)
                    }
                  />
                </td>
                <td id="taxable">
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) =>
                      handleItemChange(index, "amount", e.target.value)
                    }
                  />
                </td>
                {taxType === "CGST_SGST" && (
                  <>
                    <td id="cgstRate">
                      <input
                        type="number"
                        value={item.cgstRate}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "cgstRate",
                            Number(e.target.value)
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
                                (item.amount * item.cgstRate) /
                                100
                              ).toFixed(2)
                            : 0
                        }
                        readOnly
                      />
                    </td>
                    <td id="sgstRate">
                      <input
                        type="number"
                        value={item.sgstRate}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "sgstRate",
                            Number(e.target.value)
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
                                (item.amount * item.sgstRate) /
                                100
                              ).toFixed(2)
                            : 0
                        }
                        readOnly
                      />
                    </td>
                  </>
                )}
                {taxType === "IGST" && (
                  <>
                    {/* FIX 8: IGST rate input was missing value and onChange */}
                    <td id="igstRate">
                      <input
                        type="number"
                        value={item.igstRate}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "igstRate",
                            Number(e.target.value)
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
                                (item.amount * item.igstRate) /
                                100
                              ).toFixed(2)
                            : 0
                        }
                        readOnly
                      />
                    </td>
                  </>
                )}
                {/* FIX 9: Total only adds taxes relevant to the active taxType */}
                <td id="totalAmount">
                  <input
                    type="number"
                    value={(
                      Number(item.amount || 0) +
                      (item.isTaxable
                        ? taxType === "CGST_SGST"
                          ? (Number(item.amount || 0) * Number(item.cgstRate)) /
                              100 +
                            (Number(item.amount || 0) * Number(item.sgstRate)) /
                              100
                          : (Number(item.amount || 0) * Number(item.igstRate)) /
                            100
                        : 0)
                    ).toFixed(2)}
                    readOnly
                  />
                </td>
                <td id="isTaxable">
                  <input
                    type="checkbox"
                    checked={item.isTaxable}
                    onChange={(e) =>
                      handleItemChange(index, "isTaxable", e.target.checked)
                    }
                  />
                </td>
                <td id="action">
                  <button onClick={() => handleRemoveItem(index)}>
                    <Delete16Regular />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="btn">
          <button className="addItemBtn" onClick={handleAddItem}>
            Add
          </button>
        </div>
        <div className="create">
          <button className="createBtn" onClick={CreateInvoice}>
            {editingInvoice ? "Update Invoice" : "Create Invoice"}

          </button>

        </div>
                  {error && <p className="error">{error}</p> || null }
          {success && <p className="success">{success}</p>|| null} 
      </div>
    </div>
  );
};

export default ProformaForm;