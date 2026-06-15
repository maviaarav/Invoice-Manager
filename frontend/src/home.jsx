import { useState, useEffect } from "react";
import instance from "./api/axios";
import "./home.css";
import { People32Filled } from "@fluentui/react-icons";

function Home() {
    const [name, setName] = useState("");
    const [numberOfClients, setNumberOfClients] = useState(0);
    const [recentClients, setRecentClients] = useState([]);

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
        getUserName();
        getClient();
        getRecentClients();
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
                    <div className="icon"></div>
                </div>

                <div className="box">
                    <div className="icon"></div>
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