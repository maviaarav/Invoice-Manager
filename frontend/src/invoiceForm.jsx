    import "./invoiceForm.css";
    import { useState, useEffect } from "react";
    import instance from "./api/axios";
    import states from "./getStates.js";
    import { MountainLocationBottomRegular,BriefcaseRegular,Call24Regular,Compose24Filled,AddStarburst32Regular,Delete16Regular } from "@fluentui/react-icons";
    const InvoiceForm = () => {

    const [company, setCompany] = useState([])

    const [companyId, setCompanyId] = useState("");

    const [clients, setClients] = useState([])

    const [selectedClientId, setSelectedClient] = useState('');

    const [taxType, setTaxType] = useState("");

    const [cgstRate, setCgstRate] = useState(0);
    const [sameAsBilling, setSameAsBilling] = useState(false);
    const [sgstRate, setSgstRate] = useState(0);

    const [igstRate, setIgstRate] = useState(0);

    const [placeOfSupply, setPlaceOfSupply] = useState("");
    const [stateCode, setStateCode] = useState("")

    const [invoiceDate, setInvoiceDate] = useState(0);

    const [invoiceNumber, setInvoiceNumber] = useState(1);

    const [shippingAddress, setShippingAddress] = useState("");

    const [billingAddress, setBillingAddress] = useState("")

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



    const item = updatedItems[index];



    if (item.quantity && item.rate) {

    item.amount = parseFloat(item.quantity) * parseFloat(item.rate);

    }



    if (field === "amount") {

    item.quantity = "";

    item.rate = "";

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

    companyId,

    customerId:selectedClientId,

    taxType,

    cgstRate,

    sgstRate,

    igstRate,

    placeOfSupply,

    shippingAddress,

    items,

    billingAddress

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

    useEffect(() => {

    if (selectedClientId && selectClient) {

    setBillingAddress(selectClient.address || "");

    }

    }, [selectedClientId, clients]);

    const selectClient = clients.find(client => client._id === selectedClientId);
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
    return (

        <div className="invoiceContainerForm">
            <h1 id="text">Create Invoice</h1>
            <div className="invoiceFormHeader">
                <div className="leftHeader">
                    <div className="company">
                           <p><strong>Your Details</strong></p>
                           {company && (
                            <>
                            <h3>{company.CompanyName}</h3>
                            <p id="special">{company.Address}</p>
                            <p id="special">GSTIN: <strong>{company.GSTNumber}</strong></p>
                            <p id="special">PAN: <strong>{company.panNumber}</strong></p>
                            <div className="contact">
                                   <p id="special" className="phone">+91 {company.phoneNumber} </p>
                                   <div className="border"></div>
                                   <p id="special">{company.Email}</p>
                            </div>
                         
                            </>
                            
                           )}
                       
                    </div>
                    <div className="client">
                          <p><strong>Client Selection</strong></p>
                          <select  id="select" value={selectedClientId} onChange={(e) => setSelectedClient(e.target.value)}>
                            <option value="">Select Client</option>
                            {clients.map((client)=>(
                                <option key={client._id} value={client._id}>{client.clientName} - {client.gstNumber}</option>

                            ))}

                          </select>
                          
                           <h3>{selectClient?.clientName}</h3>
                            <p id="special">{selectClient?.address}</p>
                            <p id="special">GSTIN: <strong>{selectClient?.gstNumber || "N/A"} </strong></p>
                            <div className="contact">
                                   <p id="special" className="phone">+91 {selectClient?.phoneNumber} </p>
                                   <div className="border"></div>
                                   <p id="special">{selectClient?.email}</p>
                                   </div>

                    </div>
                  
                </div>
                <div className="rightHeader">
                    
                </div>
            </div>
            <div className="invoiceInfo">
                <div className="info">
                       <h3>Invoice Information</h3>
                       <div className="invoiceNumber">
                        <label>Invoice Number:</label>
                        <input type="text" value={`INV-${getFinancialYear()}-${invoiceNumber}`} readOnly />
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
       <select  id="select" value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)}>
        <option value="">Select Your Place of Supply</option>
        {states.map((state)=>(
            <option  key={state.code} value={state.name}>
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
            <input type="text" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
        </div>
        <div className="shippingAddress">
            <label>Shipping Address:</label>
            <input type="checkbox" id="sameAsBilling" checked={sameAsBilling} onChange={(e) => setSameAsBilling(e.target.checked)} />
            
            <label htmlFor="sameAsBilling">Same as Billing Address</label>
            <input type="text" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
        </div>
    </div>
    <div className="itemsInvoice">
        <h3>Items</h3>
       
    </div>
        </div>



    )

    }

    export default InvoiceForm;