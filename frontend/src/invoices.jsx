import { useState, useEffect } from "react";
import instance from "./api/axios";
import "./invoices.css";
import {InfoRegular } from "@fluentui/react-icons";

const Invoices = () => {

    const [invoices, setInvoices] = useState([]);
    
    const [error, setError] = useState(null);
    const fetchInvoices = async () =>{
        try{
            const response = await instance.get('/invoice/get');
            setInvoices(response.data.invoices);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.response.data?.Msg || 'Failed to fetch invoices. Please try again later.');
        }
    

    }
    useEffect(() => {
        fetchInvoices();
    }, []);


    return (
        <div className="invoiceContainer">
            <div className="InvoiceHeading">
                <div className="actual">
                    <h1 id="text">Invoice History</h1>
                    <p>Manage and track all your client billing in one place.</p>
                </div>
                {error && (
                    <div className="buttons">
                    <button type="button" id="Invoice-Btn" onClick={() => window.location.href="/"}>Create Invoice</button>
                </div>
                )}
                
            </div>
           {error && (
            <div className="error">{error}</div>
           )}
           {invoices && (
            <div className="invoicesTable">
            {invoices.map((invoice)=> (
                <div className="invoiceCard" key={invoice._id}>
                    <div className="invoiceDetails">
                        <p><strong>Invoice ID:</strong> {invoice._id}</p>
                        <p><strong>Client Name:</strong> {invoice.customerId?.clientName}</p>
                        <p><strong>Amount:</strong> ₹{invoice.totalAmount}</p>
                        <p><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                    </div>
                    <div className="invoiceActions">
                        <button type="button" onClick={() => window.location.href=`/invoice/${invoice._id}`}>View</button>
                    </div>
                </div>
            ))}
           </div>
          
           )}
           
        </div>
    );
};

export default Invoices;