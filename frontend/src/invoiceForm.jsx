import "./invoiceForm.css";
import { useState, useEffect } from "react";
import instance from "./api/axios";

import { MountainLocationBottomRegular,BriefcaseRegular,Call24Regular,Compose24Filled } from "@fluentui/react-icons";


const InvoiceForm = () => {

    const [company, setCompany] = useState([])
    const [companyid, setCompanyId] = useState("");
    const [clients, setClients] = useState([])
    const [selectedClientId, setSelectedClient] = useState('');
    const [taxType, setTaxType] = useState("");
    const [cgstRate, setCgstRate] = useState(0);
    const [sgstRate, setSgstRate] = useState(0);
    const [igstRate, setIgstRate] = useState(0);
    const [placeOfSupply, setPlaceOfSupply] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(0);
    const [invoiceNumber, setInvoiceNumber] = useState(1);
    const [shippingAddress, setShippingAddress] = useState("");
    const [items, setItems] = useState([
        { Name: "", quantity: 1, rate: 0, HSNCode: "", amount: 0, isTaxable: false }
    ]);

    const [subtotal, setSubtotal] = useState(0);
    const [cgstAmount, setCgstAmount] = useState(0);
    const [sgstAmount, setSgstAmount] = useState(0);
    const [igstAmount, setIgstAmount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;

        if (field === "quantity" || field === "rate") {
            const quantity = parseFloat(updatedItems[index].quantity) || 0;
            const rate = parseFloat(updatedItems[index].rate) || 0;
            updatedItems[index].amount = quantity * rate;
        }

        setItems(updatedItems);
    };

    useEffect(() => {
        const newSubtotal = items.reduce((acc, item) => acc + item.amount, 0);
        setSubtotal(newSubtotal);

        let newCgstAmount = 0;
        let newSgstAmount = 0;
        let newIgstAmount = 0;

        if (taxType === "CGST_SGST") {
            newCgstAmount = (newSubtotal * cgstRate) / 100;
            newSgstAmount = (newSubtotal * sgstRate) / 100;
        } else if (taxType === "IGST") {
            newIgstAmount = (newSubtotal * igstRate) / 100;
        }

        setCgstAmount(newCgstAmount);
        setSgstAmount(newSgstAmount);
        setIgstAmount(newIgstAmount);

        const newTotalAmount = newSubtotal + newCgstAmount + newSgstAmount + newIgstAmount;
        setTotalAmount(newTotalAmount);
    }, [items, taxType, cgstRate, sgstRate, igstRate]);

    const handleAddItem = () => {
        setItems([...items, { Name: "", quantity: 1, rate: 0, HSNCode: "", amount: 0, isTaxable: false }]);
    };

    const handleRemoveItem = (index) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
    };
    const InvoiceDate = () => {
        const today = new Date();
        const formattedDate = today.toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        setInvoiceDate(formattedDate);
    }
    const fetchCompanyId = async () => {
        try{
            const response = await instance.get("/company/get");
            const data = response.data.company;
            setCompanyId(data._id);
            setCompany(data);
            setPlaceOfSupply(data.PlaceOfSupply);
        }catch(error){
            console.error("Error fetching company ID:", error);
        }
    }

    const fetchClient = async () => {
        try{
            const response = await instance.get('/client/get')
            setClients(response.data.clients)
        }catch(error){
            console.log("Error while fetching the Clients", error)
        }
    }

   const getFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    return month >= 4
        ? `${year}-${year + 1}`
        : `${year - 1}-${year}`;
};

    const fetchInvoiceNumber = async () => {
        try{
            const response = await instance.get(`/invoice/year/${getFinancialYear()}`);
            const invoiceCount = response.data.InvoiceCount;
            const newInvoiceNumber = invoiceCount + 1;
            setInvoiceNumber(newInvoiceNumber);
        }catch(error){
            console.log("Error while fetching the Invoice Number", error)
        }
    }
    
    const CreateInvoice = async () =>{
        try {
            const response = await instance.post("/invoice/create", {
                companyid,
                customerid:selectedClientId,
                taxType,
                cgstRate,
                sgstRate,
                igstRate,
                placeOfSupply,
                shippingAddress,
                items,
                subtotal,
                cgstAmount,
                sgstAmount,
                igstAmount,
                totalAmount,
            });
            const data = response.data;
            console.log("Invoice created successfully:", data);
        }
        catch(error){
            console.error("Error creating invoice:", error);
        }
    }

    useEffect(() => {
        InvoiceDate();
        fetchCompanyId();
        fetchClient();
        fetchInvoiceNumber();
    }, []);
    const selectClient = clients.find(client => client._id === selectedClientId);
    return (
        <div className="InvoiceContainer">
            <div className="leftSideInvoice">
                 <div className="headingInvoiceForm">
                <h1>Create Invoice</h1>
            </div>
        <div className="headerSection">
            <div className="companySection">
                <p><strong>Your Details:</strong></p>
                <div className="companyDetails">
                <div className="details">
                    <div className="name">
                        <div className="nameIcon">
                            <BriefcaseRegular/>
                        </div>
                         <p>{company.CompanyName}</p>
                    </div>
                    <div className="address">
                     <p id="address">{company.Address}</p>
                    </div>
                      <p><strong>GSTIN: {company.GSTNumber}</strong></p>
                      <p><strong>PAN: {company.panNumber}</strong></p>
                       <div className="name">
                        <div className="nameIcon">
                          <Call24Regular/>
                        </div>
                         <p>+91 {company.phoneNumber}</p>
                    </div>
                       <div className="name">
                        <div className="nameIcon">
                          <Compose24Filled/>
                        </div>
                         <p>{company.Email}</p>
                    </div>
                </div>

                </div>
            </div>
            <div className="clientDetails">
                <p><strong>Choose Your Client:</strong></p>
                <select value={selectedClientId} onChange={(e) => setSelectedClient(e.target.value)}>
                    <option value="">Select Client</option>
                    {clients.map((client)=> 
                    <option key={client._id} value={client._id}>{client.clientName}</option>
                    )}
                </select>
                <div className="details">
                    {selectedClientId && (
                        <>
                        <div className="name">
                              <p><strong>{selectClient.clientName}</strong></p>
                        </div>
                        <div className="address">
                            <p>{selectClient.address}</p>
                        </div>
                        <p><strong>GSTIN: {selectClient.gstNumber}</strong></p>
                        <p><strong>+91 {selectClient.phoneNumber}</strong></p>
                        <p><strong>{selectClient.email}</strong></p>
                        </>
                       
                    )}
                </div>
            </div>
                    
        </div>
        <div className="invoiceInfo">
            <div className="headingInfo">
                <h2 id="text">Invoice Information</h2>
            </div>
            <div className="infoSection">
                    <div className="invoiceNumber">
                        <label id="text"><strong>Invoice Number:</strong></label>
                        <input type="text" value={`INV-${getFinancialYear()}-${invoiceNumber}`} readOnly />
                    </div>
                    <div className="invoiceDate">
                        <label id="text"><strong>Invoice Date:</strong></label>
                        <input type="text" value={invoiceDate} readOnly />
                    </div>
                    <div className="placeOfSupply">
                        <label id="text"><strong>Place of Supply:</strong></label>
                        <input type="text" value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} placeholder="Enter place of supply" />
                    </div>
                    <div className="TaxType">
                        <label id="text"><strong>GST Type:</strong></label>
                        <div className="taxToggle">
                            <div className={`tax-option ${taxType === "CGST_SGST" ? "active" : ""}`}>CGST + SGST</div>
                            <div className={`tax-option ${taxType === "IGST" ? "active" : ""}`}>IGST</div>
                        </div>
                    </div>
            </div>
        </div>
            </div>
           
        </div>
    )
}
export default InvoiceForm;