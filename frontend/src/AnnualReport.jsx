import "./annualReport.css";
import { useState, useEffect } from "react";
import {

    BarChart,
    Bar,
    PieChart,
    Pie,
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
    const gstDistribution = [
        { name: "CGST", value: Number(report.TotalCgst || 0), color: "#2563EB" },
        { name: "SGST", value: Number(report.TotalSgst || 0), color: "#7C3AED" },
        { name: "IGST", value: Number(report.TotalIgst || 0), color: "#CBD5E1" }
    ];
    const totalGst = gstDistribution.reduce((sum, item) => sum + item.value, 0);
    const gstPercentage = (value) =>
        totalGst === 0 ? "0.0" : ((value / totalGst) * 100).toFixed(1);

    return (
        <div className="annual-report-container">
            <div className="headerPreview">
                 <div className="previewHeading1">
                        <h1>Annual Revenue & GST Report for <span>#FY { id }</span></h1>
                    </div>
            </div>
           
            <div className="pages">
                <div className="reportPage">

               
           
            
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
                            
                            <div className="gstbreakdown">
                                <div className="leftGstBreakdown">
                                    <h2>GST Statutory Breakdown</h2>
                                    <div className="gst-table">

                {/* HEADER */}
                <div className="gst-row gst-header">

                    <div className="gst-component">
                        TAX COMPONENT
                    </div>

                    <div className="gst-base">
                        TAXABLE BASE
                    </div>

                    <div className="gst-amount">
                        TAX AMOUNT
                    </div>

                </div>


                {/* CGST */}
                <div className="gst-row">

                    <div className="gst-component">
                        Central GST (CGST 9%)
                    </div>

                    <div className="gst-base">
                        {report.TotalCgst == 0 ? "₹0" : `₹${report.totalTaxableAmount.toLocaleString("en-IN")}`}
                    </div>

                    <div className="gst-amount gst-blue">
                      {report.TotalCgst == 0 ? "₹0" : `₹${report.TotalCgst.toLocaleString("en-IN")}`}
                    </div>

                </div>


                {/* SGST */}
                <div className="gst-row">

                    <div className="gst-component">
                        State GST (SGST 9%)
                    </div>

                    <div className="gst-base">
                         {report.TotalSgst == 0 ? "₹0" : `₹${report.totalTaxableAmount.toLocaleString("en-IN")}`}
                    </div>

                    <div className="gst-amount gst-purple">
                        {report.TotalSgst == 0 ? "₹0" : `₹${report.TotalSgst.toLocaleString("en-IN")}`}
                    </div>

                </div>


                {/* IGST */}
                <div className="gst-row">

                    <div className="gst-component">
                        Integrated GST (IGST 18%)
                    </div>

                    <div className="gst-base">
                        {report.TotalIgst == 0 ? "₹0" : `₹${report.totalTaxableAmount.toLocaleString("en-IN")}`}
                    </div>

                    <div className="gst-amount gst-blue">
                        {report.TotalIgst == 0 ? "₹0" : `₹${report.TotalIgst.toLocaleString("en-IN")}`}
                    </div>

                </div>


                {/* TOTAL */}
                <div className="gst-total">

                    <div className="gst-component">
                        Total GST Liability
                    </div>

                    <div className="gst-amount">
                       {report.totalTaxableAmount == 0 ? "₹0" : `₹${report.totalTaxableAmount.toLocaleString("en-IN")}`}
                    </div>

                    <div className="gst-amount gst-total-amount">
                       {report.TotalTax == 0 ? "₹0" : `₹${report.TotalTax.toLocaleString("en-IN")}`}
                    </div>

                </div>

            </div>
                                </div>
                                <div className="RightGstBreakdown">
                                    <h2>GST Distribution</h2>
                                    <div className="gst-distribution-content">
                                        <div className="gst-donut">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={gstDistribution}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        innerRadius="58%"
                                                        outerRadius="82%"
                                                        startAngle={180}
                                                        endAngle={-180}
                                                        paddingAngle={0}
                                                        stroke="none"
                                                    >
                                                        {gstDistribution.map((item) => (
                                                            <Cell key={item.name} fill={item.color} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="gst-donut-total">
                                                <strong>{formatRevenue(totalGst)}</strong>
                                                <span>TOTAL GST</span>
                                            </div>
                                        </div>
                                        <div className="gst-distribution-legend">
                                            {gstDistribution.map((item) => (
                                                <div className={`gst-legend-item${item.value === 0 ? " is-empty" : ""}`} key={item.name}>
                                                    <span className="gst-legend-label">
                                                        <span className="gst-legend-dot" style={{ backgroundColor: item.color }} />
                                                        {item.name}
                                                    </span>
                                                    <span>({gstPercentage(item.value)}%)</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

  

            </div>
             </div>
            
           <div className="reportPage">
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
                        <div className="heading-annual-1">
                <h1>Financial <span>Analysis & Diagnostics</span></h1>
                <p>Granular month-by-month financial ledger, benchmark invoice statistics, and client contribution analysis.</p>
            </div>
            </div>
           </div>
             </div>
        </div>
    );
}

export default AnnualReport;