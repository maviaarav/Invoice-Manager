import { useState, useEffect } from "react";
import instance from "./api/axios";
import "./company-form.css";
import { CheckmarkStarburstRegular } from "@fluentui/react-icons";



const CompanyForm = () =>{
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
   const [BranchName, setBranchName] = useState("");
   const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [step, setStep] = useState(0);

    const registerCompany = async () =>{
        try{    
           const formData = new FormData();

        formData.append("CompanyName", companyName);
        formData.append("OwnerName", ownerName);
        formData.append("Email", companyEmail);
        formData.append("phoneNumber", companyPhone);
        formData.append("Address", companyAddress);
        formData.append("BankName", bankName);
        formData.append("AccountNumber", accountNumber);
        formData.append("BranchName", BranchName);
        formData.append("GSTNumber", taxId);
        formData.append("panNumber", panNumber);
        formData.append("IFSCCode", ifscCode);

        if(stamp){
            formData.append("stamp", stamp);
        }

        if(signature){
            formData.append("signature", signature);
        }

        const response = await instance.post(
            '/company/create',
            formData
        );
        clearForm();
        setSuccess("Company created successfully!");
        setTimeout(() => {window.location.href = "/settings"}, 2000);
        }catch(error){
            console.log(error.response?.data.Msg)
            setError(error.response?.data.Msg)
        }
    }
    const clearForm = () =>{
        setCompanyName("");
        setOwnerName("");
        setCompanyEmail("");
        setCompanyPhone("");
        setCompanyAddress("");
        setBankName("");
        setAccountNumber("");
        setBranchName("");
        setTaxId("");
        setPanNumber("");
        setIfscCode("");
        setStamp(null);
        setSignature(null);


    }



    return (
        <div className="companyFormContainer">
            <h1 id="text">Complete Your Company Profile</h1>
            <div className="container">
                <div className="leftSide">
                    <h3 id="text2"> <div className="icon2"><CheckmarkStarburstRegular /></div> Get Compliance Ready</h3>
                    <div className="para">
                        <p>Completing your profile ensures your invoices are
100% compliant with the latest regulatory
standards.</p>
                    </div>
                </div>
           <div className="rightSide">

    <div className="steps">
        <div className={`step ${step === 0 ? "active" : ""}`}>
            Basic Information
        </div>

        <div className={`step ${step === 1 ? "active" : ""}`}>
            Bank Details
        </div>

        <div className={`step ${step === 2 ? "active" : ""}`}>
            Upload Documents
        </div>
    </div>

    <div className="sliderWrapper">

        <div
            className="formSliders"
            style={{
                transform: `translateX(-${step * 100}%)`
            }}
        >

            {/* STEP 1 */}

            <div className="form-step">

                <div className="sameInput">

                    <div className="inputFieldsCompany">
                        <label>Company Name</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>

                    <div className="inputFieldsCompany">
                        <label>Owner Name</label>
                        <input
                            type="text"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                        />
                    </div>
                    <div className="inputFieldsCompany">
                        <label>Email</label>
                        <input
                            type="text"
                            value={companyEmail}
                            onChange={(e) => setCompanyEmail(e.target.value)}
                        />
                    </div>
                    <div className="inputFieldsCompany">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            value={companyPhone}
                            onChange={(e) => setCompanyPhone(e.target.value)}
                        />
                    </div>

                    <div className="inputFieldsCompany">
                        <label>GSTIN</label>
                        <input
                            type="text"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                        />
                    </div>

                    <div className="inputFieldsCompany">
                        <label>PAN Number</label>
                        <input
                            type="text"
                            value={panNumber}
                            onChange={(e) => setPanNumber(e.target.value)}
                        />
                    </div>

                </div>

                <div className="largeInput">
                    
                    <label>Registered Address</label>
                    <textarea
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                    />
                </div>

                <div className="buttonRow">
                    <button onClick={() => setStep(1)}>
                        Next
                    </button>
                </div>
               
            </div>

            {/* STEP 2 */}

            <div className="form-step">

                <div className="sameInput">

                    <div className="inputFieldsCompany">
                        <label>Bank Name</label>
                        <input
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                        />
                    </div>

                    <div className="inputFieldsCompany">
                        <label>Account Number</label>
                        <input
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                        />
                    </div>

                    <div className="inputFieldsCompany">
                        <label>Branch Name</label>
                        <input
                            value={BranchName}
                            onChange={(e) => setBranchName(e.target.value)}
                        />
                    </div>

                    <div className="inputFieldsCompany">
                        <label>IFSC Code</label>
                        <input
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value)}
                        />
                    </div>

                </div>

                <div className="buttonRow">
                    <button onClick={() => setStep(0)}>
                        Back
                    </button>

                    <button onClick={() => setStep(2)}>
                        Next
                    </button>
                </div>

            </div>

            {/* STEP 3 */}

            <div className="form-step">

                <div className="sameInput">

                    <div className="inputFieldsCompany">
                        <label>Stamp</label>
                        <input
                            type="file"
                            onChange={(e) => setStamp(e.target.files[0])}
                        />
                    </div>

                    <div className="inputFieldsCompany">
                        <label>Signature</label>
                        <input
                            type="file"
                            onChange={(e) => setSignature(e.target.files[0])}
                        />
                    </div>
           
                </div>

                <div className="buttonRow">
                    <button onClick={() => setStep(1)}>
                        Back
                    </button>

                    <button onClick={registerCompany}>
                        Submit
                    </button>
                    
                </div>
              <div className="message">
                    {error ? <p>{error}</p> : <p>{success}</p>}

                </div>
            </div>

        </div>

    </div>

</div>
            </div>
        </div>
    )
}

export default CompanyForm