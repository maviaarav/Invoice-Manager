import "./preview.css";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import instance from "./api/axios";
import gstStates from "./getStates.js";
import { ToWords } from "to-words";
import html2pdf from "html2pdf.js";
import { QRCodeCanvas } from "qrcode.react";
import SendEmailModal from "./SendEmailModal";
import Toast from "./Toast";

const InvoicePreview = () => {
    const invoiceRef = useRef();
    const [invoice, setInvoice] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [toast, setToast] = useState(null);

    const { id } = useParams();

    const fetchInvoice = async () => {
        try {
            const response = await instance.get(`/invoice/get/${id}`);
            setInvoice(response.data.invoice);
        } catch (error) {
            console.error("Error fetching invoice:", error);
        }
    };

    useEffect(() => {
        fetchInvoice();
    }, []);

    if (!invoice) {
        return <h2>Loading...</h2>;
    }

    const upiurl = `upi://pay?pa=${invoice?.companyId?.upiID}&pn=${encodeURIComponent(invoice?.companyId?.CompanyName)}&am=${invoice?.totalAmount}&cu=INR&tn=Payment for Invoice ${invoice?.invoiceNumber}`;

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

    const buildPdfOptions = (element) => {
        const elementWidth = element.offsetWidth;
        const elementHeight = element.scrollHeight + 10;
        const pxToMm = 0.264583;
        return {
            margin: 0,
            filename: `Invoice-${invoice.invoiceNumber}.pdf`,
            image: { type: "jpeg", quality: 1 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                windowWidth: elementWidth,
                windowHeight: elementHeight,
                scrollY: 0
            },
            jsPDF: {
                unit: "mm",
                format: [elementWidth * pxToMm, elementHeight * pxToMm],
                orientation: "portrait"
            },
            pagebreak: { mode: ["avoid-all"] }
        };
    };

    const handleDownloadPdf = () => {
        setTimeout(() => {
            const element = invoiceRef.current;
            html2pdf().set(buildPdfOptions(element)).from(element).save();
        }, 200);
    };

    const handleSendInvoice = async (emailList) => {
        try {
            setIsSending(true);

            const element = invoiceRef.current;
            const options = buildPdfOptions(element);
            delete options.filename;

            const pdfBlob = await html2pdf().set(options).from(element).outputPdf("blob");

            const formData = new FormData();
            formData.append("pdf", pdfBlob, `Invoice-${invoice.invoiceNumber}.pdf`);
            formData.append("emails", emailList.join(","));
            formData.append("invoiceNumber", invoice.invoiceNumber);
            formData.append("invoiceDate", invoice.invoiceDate);
            formData.append("totalAmount", invoice.totalAmount);
            formData.append("companyName", invoice.companyId.CompanyName);
            formData.append("clientName", invoice.customerId.clientName);

            const paymentUrl = `upi://pay?pa=${invoice?.companyId?.upiID}&pn=${encodeURIComponent(invoice?.companyId?.CompanyName)}&am=${invoice?.totalAmount}&cu=INR&tn=Payment for Invoice ${invoice?.invoiceNumber}`;
            formData.append("paymentUrl", paymentUrl);

            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentUrl)}&size=150x150`;
            formData.append("qrCodeUrl", qrCodeUrl);

            await instance.post("/api/gmail/send-email", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setShowSendModal(false);
            setToast({ type: "success", message: "Invoice sent successfully" });
        } catch (error) {
            console.error(error);
            setToast({ type: "error", message: "Failed to send invoice" });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <Toast toast={toast} onClose={() => setToast(null)} />

            <SendEmailModal
                open={showSendModal}
                onClose={() => !isSending && setShowSendModal(false)}
                defaultEmails={invoice.customerId?.email ? [invoice.customerId.email] : []}
                documentLabel={`Invoice #${invoice.invoiceNumber}`}
                isSending={isSending}
                onSend={handleSendInvoice}
            />

            <div className="previewContainer">
                <div className="headerPreview">
                    <div className="previewHeading">
                        <h1>Showing Preview for <span>#{invoice.invoiceNumber}</span></h1>
                    </div>

                    <div className="button">
                        <button type="button" onClick={handleDownloadPdf}>
                            Download Pdf
                        </button>
                    </div>
                    <div className="button">
                        <button
                            type="button"
                            className="send-invoice-btn"
                            onClick={() => setShowSendModal(true)}
                            disabled={isSending}
                        >
                            📧 Send Invoice
                        </button>
                    </div>
                </div>
                <div className="mainPreview">
                    <div className="preview" ref={invoiceRef}>
                        <div className="headerOFInvoice">
                            <div className="userCompanyDetails">
                                <div className="companyNamePre">
                                    <h1>{invoice.companyId.CompanyName}</h1>
                                    <p>{invoice.companyId.Address}</p>
                                </div>
                                <div className="companyOther">
                                    <p>GSTIN: <span>{invoice.companyId.GSTNumber || "N/A"}</span></p>
                                    <p>PAN: <span>{invoice.companyId.panNumber || "N/A"}</span></p>
                                    <p>Phone Number: <span>+91 {invoice.companyId.phoneNumber}</span></p>
                                    <p>Email: <span>{invoice.companyId.Email}</span></p>
                                </div>
                            </div>
                            <div className="InvoiceDetails">
                                <h1>TAX INVOICE</h1>
                                <div className="upperSectionPreview">
                                    <div className="invoiceNumberPreview">
                                        <p>Invoice No:</p>
                                        <span>{invoice.invoiceNumber}</span>
                                    </div>
                                    <div className="invoiceDatePreview">
                                        <p>Invoice Date:</p>
                                        <span>{new Date(invoice.invoiceDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                                    </div>
                                    <div className="invoicePlaceOfSupplyPreview">
                                        <p>Place of Supply:</p>
                                        <span>{invoice.placeOfSupply}</span>
                                    </div>
                                    {invoice.PoNumber && (
                                    <>
                                    <div className="invoicePlaceOfSupplyPreview">
                                        <p>PO Number:</p>
                                        <span>{invoice.PoNumber}</span>
                                    </div>
                                    </>
                                    
                                    
                                )}
                                          {invoice.PODate && invoice.PODate !== null &&(

                                      
                                    <div className="invoicePlaceOfSupplyPreview">
                                        <p>PO Date:</p>
                                        <span>{new Date(invoice.PODate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                                    </div>
                                    )}

                                {invoice.ServiceOrderNumber && (
                                    <>
                                    <div className="invoicePlaceOfSupplyPreview">
                                        <p>Service Order Number:</p>
                                        <span>{invoice.ServiceOrderNumber}</span>
                                    </div>
                                    
                                    </>
                                )}
                                {invoice.ServiceOrderDate && invoice.ServiceOrderDate !== null && (
                                    <div className="invoicePlaceOfSupplyPreview">
                                        <p>Service Order Date:</p>
                                        <span>{new Date(invoice.ServiceOrderDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                                    </div>
                                )}
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
                                        <th rowSpan="2" id="itemsDes">Item Description</th>
                                        <th rowSpan="2">HSN/SAC</th>
                                        {invoice.items.some(item => item.quantity != null) && <th rowSpan="2">Qty</th>}
                                        {invoice.items.some(item => item.rate != null) && <th rowSpan="2">Rate (₹)</th>}
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
                                        const taxableAmount = item.amount;

                                        const igstRate = item.isTaxable ? invoice.igst.rate : 0;
                                        const igstAmount = item.isTaxable ? (taxableAmount * invoice.igst.rate) / 100 : 0;

                                        const cgstRate = item.isTaxable ? invoice.cgst.rate : 0;
                                        const cgstAmount = item.isTaxable ? (taxableAmount * invoice.cgst.rate) / 100 : 0;

                                        const sgstRate = item.isTaxable ? invoice.sgst.rate : 0;
                                        const sgstAmount = item.isTaxable ? (taxableAmount * invoice.sgst.rate) / 100 : 0;

                                        const totalAmount =
                                            taxableAmount +
                                            (invoice.taxType === "CGST_SGST" ? cgstAmount + sgstAmount : igstAmount);

                                        const hasQuantityColumn = invoice.items.some(i => i.quantity != null);
                                        const hasRateColumn = invoice.items.some(i => i.rate != null);

                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <strong>{item.Name}</strong>
                                                </td>
                                                <td>{item.HSNCode}</td>
                                                {hasQuantityColumn && <td>{item.quantity ?? "—"}</td>}
                                                {hasRateColumn && (
                                                    <td>{item.rate != null ? `₹ ${item.rate.toLocaleString("en-IN")}` : "—"}</td>
                                                )}
                                                <td>₹ {taxableAmount.toLocaleString("en-IN")}</td>

                                                {invoice.taxType === "CGST_SGST" && (
                                                    <>
                                                        <td>{item.isTaxable ? `${cgstRate}%` : "—"}</td>
                                                        <td>{item.isTaxable ? `₹ ${cgstAmount.toLocaleString("en-IN")}` : "—"}</td>
                                                        <td>{item.isTaxable ? `${sgstRate}%` : "—"}</td>
                                                        <td>{item.isTaxable ? `₹ ${sgstAmount.toLocaleString("en-IN")}` : "—"}</td>
                                                    </>
                                                )}
                                                {invoice.taxType === "IGST" && (
                                                    <>
                                                        <td>{item.isTaxable ? `${igstRate}%` : "—"}</td>
                                                        <td>{item.isTaxable ? `₹ ${igstAmount.toLocaleString("en-IN")}` : "—"}</td>
                                                    </>
                                                )}

                                                <td>
                                                    <strong>₹ {totalAmount.toLocaleString("en-IN")}</strong>
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
                                    <p id="amountInWords">{toWords.convert(invoice.totalAmount)}</p>
                                </div>
                                <div className="bankdetails">
                                    <div className="detailsOfBank">
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
                                    <div className="bankQrcode">
                                        <QRCodeCanvas value={upiurl} size={60} />
                                        <p className="qrLabel">Scan to Pay via UPI</p>
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

                        <div className="declarationSection">
                            <div className="declarationDivider">
                                <span className="line" />
                                <span className="declarationBadge">DECLARATION</span>
                                <span className="line" />
                            </div>

                            <div className="declarationBox">
                                <p className="declarationIntro">We hereby declare that:</p>
                                <ul className="declarationList">
                                    <li>
                                        <span className="checkIcon">✓</span>
                                        <span>The particulars given above are true and correct.</span>
                                    </li>
                                    <li>
                                        <span className="checkIcon">✓</span>
                                        <span>The goods/services supplied are as described and all duties and taxes have been paid or are payable.</span>
                                    </li>
                                    <li>
                                        <span className="checkIcon">✓</span>
                                        <span>This invoice is issued for the purpose of supply of goods/services and not for any other purpose.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="signatureSection">
                            <div className="sealPreview">
                                <div className="sealLabel">
                                    <span className="line" />
                                    <span className="sealBadge">Authorized Stamp</span>
                                    <span className="line" />
                                </div>
                                <div className="stampCircle">
                                    {invoice.companyId.stamp ? (
                                        <img src={invoice.companyId.stamp} alt="Company Seal" />
                                    ) : (
                                        <p>Company Seal</p>
                                    )}
                                </div>
                            </div>

                            <div className="signatureDividerVertical" />

                            <div className="upperSectionSignature">
                                <span className="forCompanyBadge">
                                    For <strong>{invoice.companyId.CompanyName}</strong>
                                </span>

                                <div className="signaturePreview">
                                    {invoice.companyId.signature ? (
                                        <img src={invoice.companyId.signature} alt="Signature" />
                                    ) : (
                                        <div style={{ height: "70px" }} />
                                    )}
                                </div>
                                <p className="authorizedSignatoryLabel">Authorized Signatory</p>
                            </div>
                        </div>

                        <div className="thankYouFooter">
                            <span className="line" />
                            <div className="thankYouContent">
                                <span className="shieldIcon">🛡️</span>
                                <p>Thank you for your business. We look forward to serving you again.</p>
                            </div>
                            <span className="line" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InvoicePreview;