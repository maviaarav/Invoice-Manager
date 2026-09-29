import "./annualReport.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import instance from "./api/axios";
import {
  DataBarVertical32Filled,
  BuildingGovernment32Filled,
  Receipt48Filled,
} from "@fluentui/react-icons";

const AnnualReport = () => {
    const [invoice, setInvoice] = useState(null);
    const [report, setReport] = useState(null)
    const [company, setCompany] = useState(null)
    const { id } = useParams();


    const fetchCompanyDetails = async () =>{
        try{
            const response = await instance.get('/company/only-company-and-owner-details')
            setCompany(response.data.company)
            console.log(response.data.company)
        }catch(error){
            console.log("error while fetching compnay details for annual", error)
        }
    }
    const fetchInvoice = async () => {
    try {
        const response = await instance.get(`/invoice/only-required-fields/${id}`);


        setInvoice(response.data);
    } catch (error) {
        console.error("Error fetching invoice:", error);
    }
};
const fetchReport = async () => {
    try{
        const response = await instance.get(`/invoice/annual-report/${id}`)
        setReport(response.data)
    }catch(error){
         console.error("Error fetching report:", error);
    }
}

    useEffect(() => {
        fetchInvoice();
        fetchReport();
        fetchCompanyDetails();
    }, [id]);
    if (!invoice || !report || !company) {
        return <h2>Loading...</h2>;
    }
    return (
        <div className="annual-report-container">
            <div className="headerPreview">
                <div className="previewHeading1">
                        <h1>Annual Revenue & GST Report for <span>#FY { id }</span></h1>
                    </div>
            </div>
            <div className="annual-report">
                <div className="header">
                    <div className="leftSide-annual">
                        <div className="logoA"></div>
                        <div className="textAnnual">
                            <h3>INVOIZOR</h3>
                            <p>Simple Invoicing. Smarter Business.</p>
                        </div>
                    </div>
                    <div className="rightSide-annual">
                        <div className="annualP">
                                 <p className="rightSide-annualP">STATUTORY DOCUMENT</p>
                                   <h3>FY { id }</h3>
                        </div>
                      
                           
                        </div>
                        
                        </div>
                        <div className="subject-annual">
                <div className="left-subject">
                    <div className="leftUpper">
                    <h2>{company.CompanyName ||
                    "Company name unavailable"}</h2>
                    <div className="activeGst">
                        <p>Active Regular GST</p>
                    </div>
                    </div>
                    <p>GSTIN: <span>{company.GSTNumber || "GSTIN unavailable"}</span></p>
                    <p>Address: <span>{company.Address || "Address unavailable"}</span></p>
                    <p className="contact-row">
                        Contact: <span>
                            {company.phoneNumber
                                ? `+91 ${company.phoneNumber}`
                                : "Contact unavailable"}
                            {company.Email && (
                                <> <span id="dot">•</span> {company.Email}</>
                            )}
                        </span>
                    </p>

                </div>
                <div className="right-subject">
                    <div className="reportgenerated">
                    <span>Report Generated:</span>
                    <h2>{new Date().toLocaleDateString("en-IN",{
                        day: "2-digit",
                        month: "long",
                        year: "numeric"

                    })}</h2>
                    
                    </div>
                    <div className="accounting">
                        <span>Accounting Period:</span>
                    <h2>01 April {new Date().getFullYear()} - 31 March {new Date().getFullYear() + 1}</h2>
                    </div>
                    
                </div>
            </div>
            <div className="heading-annual-1">
                <h1>Annual <span>Revenue & GST</span> Summary</h1>
                <p>Official audited summary of business revenue and statutory tax liabilities for FY {id}.</p>
            </div>
            <div className="box-container-annual">
                <div className="boxes-annual">
                    <div className="box-upper">
                        <p>TOTAL INVOICE <br /> VALUE</p>
                        <div className="icon-annual">
                            ₹
                        </div>
                    </div>
                    <div className="box-lower">
                        <h1>₹{report.totalRevenue.toLocaleString("en-IN")}</h1>
                        <p>Gross Billed Value</p>
                    </div>
                </div>
                <div className="boxes-annual">
                      <div className="box-upper">
                        <p>TAXABLE <br />VALUE</p>
                        <div className="icon-annual">
                            <DataBarVertical32Filled />
                        </div>
                    </div>
                    <div className="box-lower">
                        <h1>₹{report.totalTaxableAmount.toLocaleString("en-IN")}</h1>
                        <p>Net Pre-Tax Base</p>
                    </div>
                </div>
                <div className="boxes-annual">
                      <div className="box-upper">
                        <p>TOTAL<br />GST</p>
                        <div className="icon-annual">
                            <BuildingGovernment32Filled />
                        </div>
                    </div>
                    <div className="box-lower">
                        <h1>₹{report.TotalTax.toLocaleString("en-IN")}</h1>
                        <p>Combined Tax Liability</p>
                    </div>
                </div>
                <div className="boxes-annual">
                          <div className="box-upper">
                        <p>TOTAL<br />INVOICE</p>
                        <div className="icon-annual">
                            <Receipt48Filled />
                        </div>
                    </div>
                    <div className="box-lower">
                        <h1>{report.totalInvoices}</h1>
                        <p>Official Tax Invoices</p>
                    </div>
                </div>
            </div>
            </div>
            
           
            
        </div>
    );
}

export default AnnualReport;