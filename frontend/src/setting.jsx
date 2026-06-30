import { useState, useEffect } from "react";
import instance from "./api/axios";
import "./setting.css";
import { Gavel32Filled,ContactCard32Filled,BuildingBankFilled,Signature32Regular,Stamp32Light,PeopleCommunity24Regular,EditFilled } from "@fluentui/react-icons";



const Setting = () => {

    const [companyName, setCompanyName] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [companyEmail, setCompanyEmail] = useState("");
    const [companyPhone, setCompanyPhone] = useState("");
    const [companyAddress, setCompanyAddress] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [taxId, setTaxId] = useState("");
    const [panNumber, setPanNumber] = useState("");
   const [ifscCode, setIfscCode] = useState("");
   const [stamp, setStamp] = useState(null);
   const [signature, setSignature] = useState(null);
   const [bankName, setBankName] = useState("");
   const [accountNumber, setAccountNumber] = useState("");
   const [termsAndCondition, setTermsAndCondition] = useState("");
   const [BranchName, setBranchName] = useState("");
   const [phoneNumber, setPhoneNumber] = useState("");
   const [upiID, setUpiID] = useState("");
    const [companyProfile, setCompanyProfile] = useState(null);

    const [error, setError] = useState('')
    const [editingCompany, setEditingCompany] = useState(null);

   const fetchCompanyProfile = async () =>{
    try{
        const response = await instance.get('/company/get')
        const data = response.data.company;
        
        setCompanyProfile(data);
        setCompanyName(data.CompanyName);
        setOwnerName(data.OwnerName)
        setCompanyEmail(data.Email) 
        setCompanyPhone(data.phoneNumber) 
        setCompanyAddress(data.Address) 
        setBankAccount(data.AccountNumber) 
        setTaxId(data.GSTNumber) 
        setPanNumber(data.panNumber) 
        setIfscCode(data.IFSCCode) 
        setBankName(data.BankName) 
        setAccountNumber(data.AccountNumber) 
        setStamp(data.stamp)
        setSignature(data.signature)
        setBranchName(data.BranchName) 
        setTermsAndCondition(data.termsAndCondition) 
        setUpiID(data.upiID)
        console.log(data)
    }catch(error){
        console.log(error.response?.data.Msg)
        setError(error.response?.data.Msg)

    }
   }
   useEffect(() => {
    fetchCompanyProfile();
   }, []);
   const renderCompanyForm = () =>{
        window.location.href = "/companyForm"
   }

    return (
      <div className="settingContainer">
        <div className="headerSetting">
              <h1 id="text"className="titleSetting">Company Profile</h1>
              {error && (
                 <button id="setting_btn" onClick={renderCompanyForm}>
                    <PeopleCommunity24Regular /> Add Company
                 </button>
              )}
            
        </div>
      
                <div className="error">
                {error && (
                    <p>{error}</p>
                )}
        </div>

       {companyProfile && (
    <div className="companyProfileContainer" >
<div className="headingSetting">
            <div className="logoCompany">   
            </div>
        <div className="companyInfo">
            <div className="info">
               <div className="edit"
               onClick = {()=> {
                localStorage.setItem('editingCompany', JSON.stringify(companyProfile));
                window.location.href = "/companyForm"
               }}
               > <EditFilled /></div>
                </div>
          <input id="nameInput" type="companyName" value={companyName} readOnly />
            <p className="othertext">Committed to excellence, integrity, and customer satisfaction, we strive to deliver reliable products and services that create lasting value. Our focus is on building strong relationships, maintaining high standards of professionalism, and continuously improving to meet the evolving needs of our clients. We believe that trust, quality, and dedication are the foundation of every successful partnership, and we remain committed to supporting our customers with efficient solutions and exceptional service.</p>
        </div>
        </div>
        <div className="otherDetailsCompany">
            <div className="TaXBlock">
                <h2 className="textBlock"> <div className="iconCompany"><Gavel32Filled /> </div>Tax & Legal</h2>
                <label>Name</label>
                <input type="text" value={ownerName} readOnly />
                <label>GSTIN</label>
                <input type="text" value={taxId} readOnly />
                <label>PAN</label>
                <input type="text" value={panNumber} readOnly />
                <label>Terms and Conditions</label>
                <textarea className="textArea" value={termsAndCondition} readOnly />
            </div>
            <div className="ContactInfoBlock">
                  <h2 className="textBlock"> <div className="iconCompany"><ContactCard32Filled /> </div> Contact Info</h2>
                <label>Registered Address</label>
               <textarea className="textArea" value={companyAddress} readOnly />
                <label>Email</label>
                <input type="text" value={companyEmail} readOnly />
                <label>Phone</label>
                <input type="text" value={companyPhone} readOnly />
            </div>
            <div className="bankDetailsBlock">
                <h2 className="textBlock"> <div className="iconCompany"> <BuildingBankFilled /></div>Bank Details</h2>
                <div className="bankDetailsitems">
                     <div className="allHeading">
                        <p>BANK</p>
                        <p>ACCOUNT</p>
                        <p>IFSC</p>
                        <p>BRANCH</p>
                        <p>UPI ID</p>

                     </div>
                     <div className="answerHeading">
                        <p><strong>{bankName}</strong></p>
                        <p>{accountNumber}</p>
                        <p>{ifscCode}</p>
                        <p id="branchName">{BranchName}</p>
                        <p>{upiID}</p>
                     </div>
                </div>
               
            </div>
        </div>
        <div className="signatureBlock">
            <div className="imagesTextBlockHeading">
                <div className="imagesBlockHeading">
                    <Signature32Regular/><h3>Authorized Signatory</h3>
                </div>
                <div className="main">
                    <p>These elements will be automatically applied to all outgoing invoices
for legal validity. High-resolution PNG or SVG recommended.</p>
                </div>

            </div>
                <div className="image">
                 {signature ? (
                    <img src={signature} alt="Signature" />
                ) : (
                    <p>No signature available</p>
                )}
                </div>
        </div>
        <div className="StampBlock">
<div className="imagesTextBlockHeading">
                <div className="imagesBlockHeading">
                    <Stamp32Light/><h3>Authorized Stamp</h3>
                    
                </div>
                 <div className="main">
                    <p>These elements will be automatically applied to all outgoing invoices
for legal validity. High-resolution PNG or SVG recommended.</p>
                </div>
               
            </div>
            <div className="image">
                {stamp ? (
                    <img src={stamp} alt="Stamp" /> 
                ) : (
                       <p>No Stamp available</p>
                )}
            </div>
        </div>
        </div>
       )}
 

   
        
      </div>
    );
};

export default Setting;