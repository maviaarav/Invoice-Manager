import "./preview.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import instance from "./api/axios";
import gstStates from "./getStates.js";
import { Delete16Regular } from "@fluentui/react-icons";
import { ToWords } from "to-words";

const InvoicePreview = () => {

    const [invoice, setInvoice] = useState(null);
    const [states, setStates] = useState("");
    const [StateCode, setStateCode] = useState("");

     const { id } = useParams();
    const fetchInvoice = async () => {
        try{
            const response = await instance.get(`/invoice/get/${id}`);
            setInvoice(response.data.invoice);

        }catch (error) {
            console.error("Error fetching invoice:", error);
        }

    }
     useEffect(() => {
        fetchInvoice();
    }, []);

    if (!invoice) {
    return <h2>Loading...</h2>;
}

const stateCode = gstStates.find(
    (state) => state.name === invoice.placeOfSupply
)?.code;
const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
    }
});

    return (
       <div className="previewContainer">
        <div className="headerPreview">
            <div className="previewHeading">
                        <h1>Showing Preview for <span>#{invoice.invoiceNumber}</span> </h1>
            </div>

            <div className="button">
                <button type="button">Download Pdf</button>

            </div>
        </div>
        <div className="mainPreview">
            <div className="preview">
                <div className="headerOFInvoice">
                    <div className="userCompanyDetails">
                        <div className="companyNamePre">
                            <h1>{invoice.companyId.CompanyName}</h1>
                            <p>{invoice.companyId.Address}</p>
                        </div>
                        <div className="companyOther">
                            <p>GSTIN: <span>{invoice.companyId.GSTNumber}</span></p>
                            <p>PAN: <span>{invoice.companyId.panNumber}</span></p>
                            <p>Phone Number: <span>+91 {invoice.companyId.phoneNumber}</span></p>
                            <p>Email: <span>{invoice.companyId.Email}</span></p>
                        </div>
                    </div>
                    <div className="InvoiceDetails">
                        <h1>TAX INVOICE</h1>
                        <div className="upperSectionPreview">
                            <div className="invoiceNumberPreview">
                            < p>Invoice No:</p>
                            <span>{invoice.invoiceNumber}</span>
                            </div>
                            <div className="invoiceDatePreview">
                            <p>Invoice Date:</p>
                            <span>{new Date(invoice.invoiceDate).toLocaleDateString("en-IN",{ year: "numeric", month: "long", day: "numeric" })}</span>
                            </div>
                            <div className="invoicePlaceOfSupplyPreview">
                            <p>Place of Supply:</p>
                            <span>{invoice.placeOfSupply}</span>
                            
                            </div>
                        </div>
                    </div>
                </div>
                <div className="addressDetailsPreview">
                    <div className="billedTo">
                        <p>BILLED TO: </p>
                                    <h3>{invoice.customerId.clientName}</h3>
                        <div className="addressBilling">
                            {invoice.billingAddress}
                        </div>
                        <div className="otherDetailsBilling">
                            <p>GSTIN: <span>{invoice.customerId.gstNumber || "N/A"} </span></p>
                        </div>
                    </div>
                    {invoice.shippingAddress && (
                                <div className="shippedTo">
                         <p>SHIPPED TO: </p>
                         <h3>{invoice.customerId.clientName}</h3>
                         <div className="addressBilling">
                            {invoice.shippingAddress}
                         </div>
                           <div className="otherDetailsBilling">
                            <p>State Code: <span>{stateCode}</span></p>
                        </div>
                    </div>
                    )}
                
                </div>
                   <div className="table">
  <table className="invoiceTablePreview">
    <thead>
      <tr>
        <th rowSpan="2">#</th>
        <th rowSpan="2">Item Description</th>
        <th rowSpan="2">HSN/SAC</th>
        <th rowSpan="2">QTY</th>
        <th rowSpan="2">Rate (₹)</th>
        <th rowSpan="2">Taxable <br /> Amount (₹)</th>
        {invoice.taxType === "CGST_SGST" && (
          <>
            <th colSpan="2">CGST</th>
            <th colSpan="2">SGST</th>
          </>
        )}
        {invoice.taxType === "IGST" && <th colSpan="2">IGST</th>}
        <th rowSpan="2">Total <br /> Amount (₹)</th>
      </tr>
      <tr>
        {invoice.taxType === "CGST_SGST" && (
          <>
            <th>Rate (%)</th>
            <th>Amount (₹)</th>
            <th>Rate (%)</th>
            <th>Amount (₹)</th>
          </>
        )}
        {invoice.taxType === "IGST" && (
          <>
            <th>Rate (%)</th>
            <th>Amount (₹)</th>
          </>
        )}
      </tr>
    </thead>

    <tbody>
  {invoice.items.map((item, index) => {
    const taxableAmount = item.amount; // already computed in data

    return (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>
          <strong>{item.Name}</strong>
          {item.description && (
            <p className="itemDescription">{item.description}</p>
          )}
        </td>
        <td>{item.HSNCode}</td>
        <td>{item.quantity}</td>
        <td>₹ {item.rate.toLocaleString("en-IN")}</td>
        <td>₹ {taxableAmount.toLocaleString("en-IN")}</td>

        {invoice.taxType === "CGST_SGST" && (
          <>
            <td>{invoice.cgst.rate}%</td>
            <td>₹ {(invoice.cgst.amount / invoice.items.length).toLocaleString("en-IN")}</td>
            <td>{invoice.sgst.rate}%</td>
            <td>₹ {(invoice.sgst.amount / invoice.items.length).toLocaleString("en-IN")}</td>
          </>
        )}
        {invoice.taxType === "IGST" && (
          <>
            <td>{invoice.igst.rate}%</td>
            <td>₹ {(invoice.igst.amount / invoice.items.length).toLocaleString("en-IN")}</td>
          </>
        )}

        <td>
          <strong>
            ₹ {(
              taxableAmount +
              (invoice.taxType === "CGST_SGST"
                ? invoice.cgst.amount / invoice.items.length +
                  invoice.sgst.amount / invoice.items.length
                : invoice.igst.amount / invoice.items.length)
            ).toLocaleString("en-IN")}
          </strong>
        </td>
      </tr>
    );
  })}
</tbody>

  </table>
</div>
<div className="infoDetailsPreview">
    <div className="leftInfoDetailsPreview">
        <div className="amountInWord">
            <label>AMOUNT IN WORDS</label>
            <p id="amountInWords" >{toWords.convert(invoice.totalAmount)}</p>
        </div>
        <div className="bankdetails">
            <label>BANK DETAILS</label>
            <div className="detailsCompany">
                <div className="leftBank">
                    <span>Bank Name</span>
                    <span>Branch Name</span>
                    <span>Account No.</span>
                    <span>IFSC Code</span>
                </div>
                <div className="leftBank">
                    <p>: {invoice.companyId.BankName}</p>
                    <p>: {invoice.companyId.BranchName}</p>
                    <p>: {invoice.companyId.AccountNumber}</p>
                    <p>: {invoice.companyId.IFSCCode}</p>
                </div>
            </div>
        </div>
            <div className="termsAndCondition">
        <label>Terms and Conditions</label>
        {invoice.companyId?.termsAndCondition
            ?.split(".")
            ?.filter(term => term.trim() !== "")
            ?.map((term, index) => (
                <p key={index}>{term.trim()}</p>
            ))
        }
    </div>
    </div>
    <div className="rightInfoDetailsPreview">
        <div className="upperInfoDetails">
            <div className="leftInfoUpper">
                <label>Sub Total</label>
                <label>CGST (9%)</label>
                <label>SGST (9%)</label>
                <label>IGST (18%)</label>
                <label>Total Tax</label>
            </div>
            <div className="rightInfoUpper">
                <span>₹ {invoice.subtotal.toLocaleString("en-IN")}</span>
                {invoice.taxType === "CGST_SGST" ? (
    <>
        <span>₹ {invoice.cgst.amount.toLocaleString("en-IN")}</span>
        <span>₹ {invoice.sgst.amount.toLocaleString("en-IN")}</span>
        <span>N/A</span>
    </>
) : (
    <>
        <span>N/A</span>
        <span>N/A</span>
        <span>₹ {invoice.igst.amount.toLocaleString("en-IN")}</span>
    </>
    
)}
  <span>₹ {invoice.totalTax.toLocaleString("en-IN")}</span>
               
               
            </div>
            
        </div>
        <div className="lowerInfo">
                <div className="totalText">
                    <label>GRAND TOTAL</label>
                </div>
            
                <div className="amountPreview">
                    <span>₹ {invoice.totalAmount.toLocaleString("en-IN")}</span>
                </div>
                
            </div>
    </div>
</div>
    <div className="signatureSection">

    <div className="sealPreview">
        {invoice.companyId.stamp ? (
            <img src={invoice.companyId.stamp} alt="Company Seal" />
        ) : (
            <p>Company Seal</p>
        )}
    </div>

    {/* RIGHT - Signature */}
    <div className="upperSectionSignature">
        <p>For <strong>{invoice.companyId.CompanyName}</strong></p>
        <div className="signaturePreview">
            {invoice.companyId.signature ? (
                <img src={invoice.companyId.signature} alt="Signature" />
            ) : (
                <div style={{ height: "70px" }} />
            )}
            <p>Authorized Signatory</p>
        </div>
    </div>
</div>
            </div>
        </div>
       </div>
    );

}
export default InvoicePreview;