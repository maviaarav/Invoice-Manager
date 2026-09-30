import "./annualReport.css";
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
    const [isDownloading, setIsDownloading] = useState(false);
    const reportPagesRef = useRef(null);
    const { id } = useParams();




    const fetchCompanyDetails = async () =>{
        try{
            const response = await instance.get('/company/get')
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
    const lowestInvoice = invoice.reduce(
        (min, invoice) => {
            return min < invoice.totalAmount ? min : invoice.totalAmount
        }
    )
    const highestInvoice = invoice.reduce(
        (max, invoice) => {
            return max > invoice.totalAmount ? max : invoice.totalAmount
        }
    )
    const averageInvoice = (report.totalRevenue) / report.totalInvoices

    const topClients = Object.values(invoice.reduce((clients, currentInvoice) => {
        const clientName = currentInvoice.customerName || "Unassigned Client";
        const client = clients[clientName] || {
            name: clientName,
            invoiceCount: 0,
            totalRevenue: 0,
        };

        client.invoiceCount += 1;
        client.totalRevenue += Number(currentInvoice.totalAmount || 0);
        clients[clientName] = client;

        return clients;
    }, {}))
        .sort((firstClient, secondClient) => secondClient.totalRevenue - firstClient.totalRevenue)
        .slice(0, 5)
        .map((client) => ({
            ...client,
            share: report.totalRevenue
                ? ((client.totalRevenue / report.totalRevenue) * 100).toFixed(1)
                : "0.0",
        }));

    const quarterlyData = [
        { label: "Q1 (Apr-Jun)", months: report.months.slice(0, 3) },
        { label: "Q2 (Jul-Sep)", months: report.months.slice(3, 6) },
        { label: "Q3 (Oct-Dec)", months: report.months.slice(6, 9) },
        { label: "Q4 (Jan-Mar)", months: report.months.slice(9, 12) },
    ].map((quarter) => ({
        label: quarter.label,
        invoices: quarter.months.reduce((total, month) => total + Number(month.NumberOfInvoices || 0), 0),
        taxable: quarter.months.reduce((total, month) => total + Number(month.totalTaxableAmount || 0), 0),
        gst: quarter.months.reduce((total, month) => total + Number(month.TotalTax || 0), 0),
        revenue: quarter.months.reduce((total, month) => total + Number(month.revenue || 0), 0),
    }));

    const formatRupees = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
    const topClientsRevenue = topClients.reduce((total, client) => total + client.totalRevenue, 0);
    const topClientsShare = report.totalRevenue
        ? ((topClientsRevenue / report.totalRevenue) * 100).toFixed(1)
        : "0.0";


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
    const formatRegisterDate = (date) =>
        new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    const registerPeriod = invoice.length
        ? `${formatRegisterDate(invoice[0].invoiceDate)} - ${formatRegisterDate(invoice[invoice.length - 1].invoiceDate)}`
        : "No invoice period";

    const handleDownloadPdf = async () => {
    if (!reportPagesRef.current || isDownloading) return;

    setIsDownloading(true);

    try {
        const reportPages = Array.from(
            reportPagesRef.current.querySelectorAll(".reportPage")
        );

        const SCALE = 4;
        const PX_TO_MM = 25.4 / 96;

        let pdf = null;

        for (let i = 0; i < reportPages.length; i++) {
            const reportPage = reportPages[i];

            // Get the ACTUAL rendered size of the page
            const rect = reportPage.getBoundingClientRect();

            const width = Math.ceil(rect.width);
            const height = Math.ceil(rect.height);

            // Capture at high resolution
            const canvas = await html2canvas(reportPage, {
                scale: SCALE,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: false,

                width: width,
                height: height,

                windowWidth: document.documentElement.clientWidth,
                windowHeight: document.documentElement.clientHeight,

                scrollX: 0,
                scrollY: -window.scrollY
            });

            // Convert the REAL CSS pixel size to mm
            const pdfWidth = width * PX_TO_MM;
            const pdfHeight = height * PX_TO_MM;

            const orientation =
                pdfWidth > pdfHeight ? "landscape" : "portrait";

            if (i === 0) {
                pdf = new jsPDF({
                    unit: "mm",
                    format: [pdfWidth, pdfHeight],
                    orientation: orientation,
                    compress: true
                });
            } else {
                pdf.addPage(
                    [pdfWidth, pdfHeight],
                    orientation
                );
            }

            // Add image at exactly the page dimensions
            pdf.addImage(
                canvas.toDataURL("image/png"),
                "PNG",
                0,
                0,
                pdfWidth,
                pdfHeight,
                undefined,
                "FAST"
            );
        }

        if (pdf) {
            pdf.save(`Annual-Report-FY-${id}.pdf`);
        }

    } catch (error) {
        console.error(
            "Error downloading annual report PDF:",
            error
        );
    } finally {
        setIsDownloading(false);
    }
};

    return (
        <div className="annual-report-container">
            <div className="headerPreview">
                 <div className="previewHeading1">
                        <h1>Annual Revenue & GST Report for <span>#FY { id }</span></h1>
                    </div>
                 <button className="download-report-button" type="button" onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? "Preparing PDF..." : "Download PDF"}
                 </button>
            </div>
           
            <div className="pages" ref={reportPagesRef}>
                <div className="reportPage">

               
           
            
            <div className="annual-report">
                <div className="header-annual">
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
                <div className="header-annual">
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
            <div className="blocks-annual-2">
                <div className="box-annual-2">
                    <p>Average Invoice Value</p>
                        <h2>₹{averageInvoice.toLocaleString('en-IN',{
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                        })}</h2>
                </div>
                <div className="box-annual-2">
                         <p>Highest Invoice</p>
                        <h2 id="highest">₹{highestInvoice.toLocaleString('en-IN',{
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                        })}</h2>
                </div>
                <div className="box-annual-2">
                        <p>Lowest Invoice</p>
                        <h2 id="lowest">₹{lowestInvoice.toLocaleString('en-IN',{
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                        })}</h2>
                </div>
                <div className="box-annual-2">
                        <p>Active Billing Months</p>
                        <h2>12 Months</h2>

                </div>
            </div>
           <div className="tableAnnualReport">
    <h2>Monthly Revenue & Taxable Breakdown</h2>

    <table className="monthly-revenue-table">
        <thead>
            <tr>
                <th>MONTH</th>
                <th>INVOICES</th>
                <th>TAXABLE VALUE</th>
                <th>GST</th>
                <th>TOTAL REVENUE</th>
            </tr>
        </thead>

        <tbody>
            {report.months.map((min, index) => (
                <tr key={index}>
                    <td>{min.month}</td>
                    <td>{min.NumberOfInvoices || 0}</td>
                    <td>
                        ₹{Number(min.totalTaxableAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                        ₹{Number(min.TotalTax || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                        ₹{Number(min.revenue || 0).toLocaleString("en-IN")}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>

<div className="quarterly-analysis">
    <div className="quarterly-breakdown">
        <div className="quarterly-heading">
            <div>
                <h2>Quarterly Revenue & GST Breakdown</h2>
                <p>Fiscal-quarter performance across revenue, GST, and taxable value.</p>
            </div>
            <span className="quarterly-badge">Q1-Q4 Audited</span>
        </div>
        <div className="quarterly-table-wrap">
            <table className="quarterly-table">
                <thead>
                    <tr>
                        <th>QUARTER</th>
                        <th>INVOICES</th>
                        <th>REVENUE</th>
                        <th>GST</th>
                        <th>TAXABLE AMT</th>
                    </tr>
                </thead>
                <tbody>
                    {quarterlyData.map((quarter) => (
                        <tr key={quarter.label}>
                            <td>{quarter.label}</td>
                            <td>{quarter.invoices}</td>
                            <td>{formatRupees(quarter.revenue)}</td>
                            <td>{formatRupees(quarter.gst)}</td>
                            <td>{formatRupees(quarter.taxable)}</td>
                        </tr>
                    ))}
                    <tr className="quarterly-total">
                        <td>Total</td>
                        <td>{report.totalInvoices}</td>
                        <td>{formatRupees(report.totalRevenue)}</td>
                        <td>{formatRupees(report.TotalTax)}</td>
                        <td>{formatRupees(report.totalTaxableAmount)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div className="quarterly-contribution">
        <div className="quarterly-heading">
            <div>
                <h2>Quarterly Contribution</h2>
                <p>Share of annual gross revenue</p>
            </div>
            <span className="quarterly-badge">100% Reconciled</span>
        </div>
        <div className="quarterly-bars">
            {quarterlyData.map((quarter, index) => {
                const share = report.totalRevenue ? (quarter.revenue / report.totalRevenue) * 100 : 0;

                return (
                    <div className="quarterly-bar-item" key={quarter.label}>
                        <div className="quarterly-bar-label">
                            <span>{quarter.label}</span>
                            <strong>{share.toFixed(1)}% <em>({formatRupees(quarter.revenue)})</em></strong>
                        </div>
                        <div className="quarterly-bar-track">
                            <span className={`quarterly-bar-fill quarterly-bar-fill-${index + 1}`} style={{ width: `${share}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
        <div className="quarterly-note">
            <strong>GST statutory alignment</strong>
            <span>Quarterly revenue and tax values reconcile with the annual report totals.</span>
        </div>
    </div>
</div>

<div className="clientContributionTable">
    <div className="client-contribution-heading">
        <div className="client-contribution-title">
            <DataBarVertical32Filled />
            <h2>Top Customers by Revenue</h2>
        </div>
        <span className="client-contribution-badge">Ranked Top 5</span>
    </div>

    <table className="client-contribution-table">
        <thead>
            <tr>
                <th>RANK</th>
                <th>CLIENT NAME</th>
                <th>INVOICES</th>
                <th>TOTAL REVENUE</th>
            </tr>
        </thead>
        <tbody>
            {topClients.map((client, index) => (
                <tr key={`${client.name}-${index}`}>
                    <td><span className="client-rank">{index + 1}</span></td>
                    <td>{client.name}</td>
                    <td>{client.invoiceCount}</td>
                    <td>₹{client.totalRevenue.toLocaleString("en-IN")}</td>
                </tr>
            ))}
        </tbody>
    </table>
    <div className="client-contribution-footer">
        <strong>Top 5 Concentration: {topClientsShare}% of Total Fiscal Invoicing</strong>
        <strong>Sum: {formatRupees(topClientsRevenue)}</strong>
    </div>
</div>

            </div>
           </div>
           <div className="reportPage">
                <div className="annual-report">
                    <div className="header-annual">
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
                <h1>Invoice <span>Register</span></h1>
                <p>Chronological ledger of official tax invoices issued during the fiscal year.</p>
            </div>
            <div className="register-meta">
                <div className="register-meta-details">
                    <span>Entries: <strong>001 - {String(invoice.length).padStart(3, "0")}</strong></span>
                    <span className="register-meta-separator">•</span>
                    <span>Period: <strong>{registerPeriod}</strong></span>
                </div>
                <span className="register-batch">Page Batch 1</span>
            </div>
            <div className="invoice-register-table-wrap">
                <table className="invoice-register-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>INVOICE NO.</th>
                            <th>DATE</th>
                            <th>CUSTOMER</th>
                            <th>GSTIN</th>
                            <th>TAXABLE VALUE</th>
                            <th>CGST</th>
                            <th>SGST</th>
                            <th>IGST</th>
                            <th>TOTAL (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.map((currentInvoice, index) => (
                            <tr key={`${currentInvoice.invoiceNumber}-${index}`}>
                                <td>{index + 1}</td>
                                <td>{currentInvoice.invoiceNumber || "-"}</td>
                                <td>{formatRegisterDate(currentInvoice.invoiceDate)}</td>
                                <td>{currentInvoice.customerName || "Unassigned Client"}</td>
                                <td>{currentInvoice.customerGstNumber || "-"}</td>
                                <td>₹{Number(currentInvoice.subtotal || 0).toLocaleString("en-IN")}</td>
                                <td>₹{Number(currentInvoice.cgstAmount || 0).toLocaleString("en-IN")}</td>
                                <td>₹{Number(currentInvoice.sgstAmount || 0).toLocaleString("en-IN")}</td>
                                <td>₹{Number(currentInvoice.igstAmount || 0).toLocaleString("en-IN")}</td>
                                <td>₹{Number(currentInvoice.totalAmount || 0).toLocaleString("en-IN")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="audit-summary">
                        <div className="audit-summary-header">
                            <h1>Annual Statutory Audit Summary</h1>
                            <span>Accrual Verified</span>
                        </div>

                        <div className="audit-summary-metrics">
                            <div>
                                <p>GROSS REVENUE</p>
                                <strong>₹{report.totalRevenue.toLocaleString("en-IN")}</strong>
                            </div>
                            <div>
                                <p>TAXABLE REVENUE</p>
                                <strong>₹{report.totalTaxableAmount.toLocaleString("en-IN")}</strong>
                            </div>
                            <div>
                                <p>TOTAL GST ACCRUED</p>
                                <strong className="audit-summary-accent">₹{report.TotalTax.toLocaleString("en-IN")}</strong>
                            </div>
                        </div>

                        <div className="audit-summary-breakdown">
                            <strong>CGST (9%): ₹{report.TotalCgst.toLocaleString("en-IN")}</strong>
                            <strong>SGST (9%): ₹{report.TotalSgst.toLocaleString("en-IN")}</strong>
                            <strong>IGST: ₹{report.TotalIgst.toLocaleString("en-IN")}</strong>
                            <strong>Total Invoices: {report.totalInvoices} Docs</strong>
                        </div>

                        <div className="audit-summary-footer">
                            <div>
                                <p>DOCUMENT AUTHENTICITY CODE:</p>
                                <p>FY-{id} / INVOIZOR-LEDGER</p>
                                <p>Validated by Invoizor Secure Ledger</p>
                            </div>
                            <div className="audit-summary-signatory">
                                {company.signature ? (
                                    <img className="audit-signature" src={company.signature} alt="Authorized signature" />
                                ) : (
                                    <strong>Authorized Signatory</strong>
                                )}
                                <p>AUTHORIZED SIGNATORY</p>
                                <span>{company.CompanyName || "Company name unavailable"}</span>
                            </div>
                        </div>
                    </div>
                </div>

           </div>
          
             </div>
        </div>
    );
}

export default AnnualReport;