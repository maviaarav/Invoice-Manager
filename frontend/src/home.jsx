import { useState, useEffect } from "react";
import instance from "./api/axios";
import "./home.css";
import { People32Filled, Receipt32Filled, Wallet32Filled, Trophy32Filled } from "@fluentui/react-icons";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function Home() {
    const [name, setName] = useState("");
    const [numberOfClients, setNumberOfClients] = useState(0);
    const [numberOfInvoices, setNumberOfInvoices] = useState(0)
    const [recentClients, setRecentClients] = useState([]);
    const [financialYear, setFinancialYear] = useState()
    const [monthlyIncome, setMonthlyIncome] = useState(0)
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    const [revenueData, setRevenueData] = useState([]);
    const [chartLoading, setChartLoading] = useState(true);
    const [topClient, setTopClient] = useState(null);

    const monthLabels = [
        "Apr", "May", "Jun", "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
    ];

    const getFinancialYear = async (date = new Date()) => {
        const fullYear = date.getFullYear()
        const month = date.getMonth() + 1

        if (month >= 4) {
            setFinancialYear(`${fullYear}-${fullYear + 1}`)
        } else {
            setFinancialYear(`${fullYear - 1}-${fullYear}`)
        }
    }

    const getUserName = async () => {
        try {
            const response = await instance.get("/user/getUserName");
            setName(response.data.name);
        } catch (error) {
            console.log(error);
        }
    }

    const getClient = async () => {
        try {
            const response = await instance.get("/client/get");
            setNumberOfClients(response.data.clientLength);
        } catch (error) {
            console.log(error);
        }
    };
    const getInvoice = async () => {
        try {
            const response = await instance.get(`/invoice/year/${financialYear}`);
            setNumberOfInvoices(response.data.InvoiceCount)
        } catch (error) {
            console.log(error)
        }
    }

    const getMonthlyIncome = async () => {
        try {
            const response = await instance.get(`/invoice/income/${year}/${month}`)
            setMonthlyIncome(response.data.totalIncome)
        } catch (error) {
            console.log(error)
        }
    }
    const getRecentClients = async () => {
        try {
            const response = await instance.get("/client/recent");
            setRecentClients(response.data.recent);
        } catch (error) {
            console.log(error);
        }
    }

    // Fetches the client with the highest total invoice amount (most expensive services purchased)
    const getTopClient = async () => {
        try {
            const response = await instance.get("/client/top-spender");
            setTopClient(response.data.topClient);
        } catch (error) {
            console.log(error);
        }
    }

    const getYearlyRevenue = async () => {
        if (!financialYear) return;

        setChartLoading(true);
        const [startYear] = financialYear.split("-").map(Number);

        const monthsInOrder = [
            { m: 4, y: startYear }, { m: 5, y: startYear }, { m: 6, y: startYear },
            { m: 7, y: startYear }, { m: 8, y: startYear }, { m: 9, y: startYear },
            { m: 10, y: startYear }, { m: 11, y: startYear }, { m: 12, y: startYear },
            { m: 1, y: startYear + 1 }, { m: 2, y: startYear + 1 }, { m: 3, y: startYear + 1 }
        ];

        try {
            const results = await Promise.all(
                monthsInOrder.map(({ m, y }) =>
                    instance.get(`/invoice/income/${y}/${m}`)
                        .then(res => res.data.totalIncome || 0)
                        .catch(() => 0)
                )
            );

            const chartData = monthsInOrder.map((entry, index) => ({
                month: monthLabels[index],
                revenue: results[index]
            }));

            setRevenueData(chartData);
        } catch (error) {
            console.log(error);
        } finally {
            setChartLoading(false);
        }
    }

    useEffect(() => {
        setFinancialYear(getFinancialYear());
    }, []);

    useEffect(() => {
        if (financialYear) {
            getInvoice();
            getYearlyRevenue();
        }
    }, [financialYear]);

    useEffect(() => {
        getUserName();
        getClient();
        getRecentClients();
        getFinancialYear();
        getMonthlyIncome();
        getTopClient();

    }, []);

    return (
        <div className="homeContainer">
            <div className="headingHome">
                <div className="nameGreeting">
                    <h1>
                        Welcome back, <span id="name">{name}</span>
                    </h1>
                    <p id="greetingText">
                        We are glad to see you again! Here's a summary of
                        your current financial standing.
                    </p>
                </div>
            </div>

            <div className="blocks">
                <div className="box">
                    <div className="icon">
                        <People32Filled />
                    </div>

                    <div className="content">
                        <p>Active Clients</p>

                        <div className="number">
                            {numberOfClients}
                        </div>
                    </div>
                </div>

                <div className="box">
                    <div className="icon">
                        <Receipt32Filled />
                    </div>
                    <div className="content">
                        <p>Total Invoices for <strong>{financialYear}</strong></p>
                        <div className="number">
                            {numberOfInvoices}
                        </div>
                    </div>
                </div>

                <div className="box">
                    <div className="icon"><Wallet32Filled /></div>
                    <div className="content">
                        <p>Monthly Revenue</p>
                        <div className="number">
                            ₹{monthlyIncome}
                        </div>
                    </div>
                </div>

                <div className="box">
                    <div className="icon"><Trophy32Filled /></div>
                    <div className="content">
                        <p>Top Client</p>
                        <div className="number topClientName">
                            {topClient?.name || "—"}
                        </div>
                        {topClient?.totalSpent != null && (
                            <p className="topClientAmount">
                                ₹{topClient.totalSpent.toLocaleString("en-IN")} spent
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="charts">
                <div className="chartCard">
                    <div className="chartHeader">
                        <h3>Monthly Revenue Growth</h3>
                        <p>Comparison of performance trends for the current fiscal year</p>
                    </div>

                    {chartLoading ? (
                        <p className="chartLoadingText">Loading chart...</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={340}>
                            <AreaChart data={revenueData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#1F4FE0" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#1F4FE0" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#EEF0F7" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    fontWeight={600}
                                />
                                <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                                <Tooltip
                                    formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                                    contentStyle={{ borderRadius: "8px", border: "1px solid #C3C6D6" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#1F4FE0"
                                    strokeWidth={3}
                                    fill="url(#revenueGradient)"
                                    dot={{ stroke: "#1F4FE0", strokeWidth: 2, fill: "white", r: 5 }}
                                    activeDot={{ r: 7, stroke: "#1F4FE0", strokeWidth: 2, fill: "white" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;