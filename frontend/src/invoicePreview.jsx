import "./preview.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import instance from "./api/axios";
import states from "./getStates.js";
import { Delete16Regular } from "@fluentui/react-icons";
import { ToWords } from "to-words";

const InvoicePreview = () => {

    const [invoice, setInvoice] = useState(null);
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
            </div>
        </div>
       </div>
    );

}
export default InvoicePreview;