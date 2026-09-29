import "./annualReport.css";
import { useState, useEffect } from "react";
import {

    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
    Cell

} from "recharts";
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
    const [months, setMonths] = useState([]);
    const { id } = useParams();




    const fetchCompanyDetails = async () =>{
        try{
            const response = await instance.get('/company/only-company-and-owner-details')
            const companyData = response.data.company;
            setCompany(Array.isArray(companyData) ? companyData[0] || null : companyData);
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
        setMonths(response.data.months)
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
    const formatRevenue = (value) => {
        if (value >= 100000) {
            return (value / 100000).toFixed(2) + "L";
        }
         if (value >= 1000) {
            return `₹${(value / 1000).toFixed(0)}K`;
        }
        return `₹${value}`;
    }

    const annualRevenueText = `₹${(report.totalRevenue / 100000).toFixed(2)}L`;

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
            <div className="revenue-card">

            {/* HEADER */}

            <div className="chartRevenuee">

                <div>

                    <h2>
                        Monthly Revenue Trajectory
                    </h2>

                    <p>
                        Revenue accrued month-by-month
                        across 12 fiscal months (INR)
                    </p>

                </div>


                {/* ANNUAL REVENUE */}

                <div className="annual-revenue">

                    {annualRevenueText} Annual Gross

                </div>

            </div>


            {/* GRAPH */}

            <div className="revenue-chart">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart
                        data={months}

                        margin={{
                            top: 35,
                            right: 20,
                            left: 10,
                            bottom: 5
                        }}

                        barCategoryGap="28%"
                    >

                        {/* HORIZONTAL DASHED LINES */}

                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="4 4"
                        />


                        {/* MONTHS */}

                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 17
                            }}
                            tickFormatter={(month) =>
                                month.substring(0, 3)
                            }
                        />


                        {/* LEFT NUMBERS */}

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) =>
                                `${value / 100000}L`
                            }
                        />


                        {/* HOVER TOOLTIP */}

                        <Tooltip
                            formatter={(value) => [
                                formatRevenue(value),
                                "Revenue"
                            ]}
                        />


                        {/* BARS */}

                        <Bar
                            dataKey="revenue"
                            radius={[
                                8,
                                8,
                                0,
                                0
                            ]}
                        >

                            {/* VALUE ABOVE BAR */}

                            <LabelList
                                dataKey="revenue"
                                position="top"
                                formatter={formatRevenue}
                                style={{
                                    fontSize: 15,
                                    fontWeight: 600
                                }}
                            />


                            {/* BAR COLORS */}

                            {months.map((item, index) => (

                                <Cell
                                    key={index}
                                    fill={
                                        index >= 8
                                            ? "#4F46E5"
                                            : "#3478E5"
                                    }
                                />

                            ))}

                        </Bar>

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>

  

            </div>
            
           
            
        </div>
    );
}

export default AnnualReport;