import { useState, useEffect } from "react";
import instance from "./api/axios";
import "./home.css";
import { People32Filled,Receipt32Filled,Wallet32Filled } from "@fluentui/react-icons";

function Home() {
    const [name, setName] = useState("");
    const [numberOfClients, setNumberOfClients] = useState(0);
    const [numberOfInvoices, setNumberOfInvoices] = useState(0)
    const [recentClients, setRecentClients] = useState([]);
    const [financialYear, setFinancialYear] = useState()
    const [monthlyIncome, setMonthlyIncome] = useState(0)
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())

    const getFinancialYear = async (date = new Date()) =>{
        const fullYear = date.getFullYear()
        const month = date.getMonth() + 1

        if(month >=4){
            setFinancialYear(`${fullYear}-${fullYear+1}`)
        }else{
            setFinancialYear(`${fullYear-1}-${fullYear}`)
        }
    }

    const getUserName = async () => {
        try {
            const response = await instance.get("/user/getUserName");
            setName(response.data.name);
        } catch (error) {
            console.log(error);
        }
    };

    const getClient = async () => {
        try {
            const response = await instance.get("/client/get");
            setNumberOfClients(response.data.clientLength);
        } catch (error) {
            console.log(error);
        }
    };
    const getInvoice = async () =>{
        try{
            const response = await instance.get(`/invoice/year/${financialYear}`);
            setNumberOfInvoices(response.data.InvoiceCount)
        }catch(error){
            console.log(error)
        }
    }

    const getMonthlyIncome = async () => {
        try{
            const response = await instance.get(`/invoice/income/${year}/${month}`)
            setMonthlyIncome(response.data.totalIncome)
        }catch(error){
            console.log(error)
        }
    }
    const getRecentClients = async () => {
        try {
            const response = await instance.get("/client/recent");
            console.log(response.data.recent);
            setRecentClients(response.data.recent);
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
    setFinancialYear(getFinancialYear());
}, []);

useEffect(() => {
    if (financialYear) {
        getInvoice();
    }
}, [financialYear]);
    useEffect(() => {
        getUserName();
        getClient();
        getRecentClients();
        getFinancialYear();
        getMonthlyIncome();

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
                    <Receipt32Filled/></div>
                    <div className="content">
                    <p>Total Invoices for <strong>{financialYear}</strong></p>
                        <div className="number">
                            {numberOfInvoices}
                        </div>
                    </div>
                 
                </div>

                <div className="box">
                    <div className="icon"><Wallet32Filled/></div>
                     <div className="content">
                    <p>Monthly Revenue</p>
                        <div className="number">
                            ₹{monthlyIncome}
                        </div>
                    </div>
                </div>

                <div className="box">
                    <div className="icon"></div>
                </div>
            </div>

            <div className="charts"></div>

            
        </div>
    );
}

export default Home;