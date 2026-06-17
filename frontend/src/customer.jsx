import { useState, useEffect } from "react";
import instance from "./api/axios";
import "./customer.css";
import { PeopleAddRegular,InfoRegular } from "@fluentui/react-icons";

const Client = () => {
    const [clients, setClients] = useState([]);
    const [length, setLength] = useState(0);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [editingClient, setEditingClient] = useState(null);

    const fetchClients = async () => {
        try {
            const response = await instance.get("/client/get");
            const data = response.data;

            setClients(data.clients);
            setLength(data.clientLength);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

const deleteClient = async () => {
    try {
        await instance.delete(`/client/delete/${activeDropdown}`);

        setClients(prev =>
            prev.filter(client => client._id !== activeDropdown)
        );

        setAlertMessage(
            `Client ${clients.find(c => c._id === activeDropdown)?.clientName} deleted successfully!`
        );

        setTimeout(() => {
            setAlertMessage("");
        }, 3000);

    } catch (error) {
        setAlertMessage("Failed to delete client!");

        setTimeout(() => {
            setAlertMessage("");
        }, 3000);
    }
};

    const message =
        length === 0
            ? "No clients found. Please add a client to get started."
            : "";

    return (
        <div className="clientContainer">
            <div className="header">
                <div className="heading">
                    <h1>Clients</h1>
                    <p id="clientDescription">
                        Manage your clients relationships and financial history.
                    </p>
                </div>

                <div className="buttons">
                    <button id="addClient" onClick={() => window.location.href = "/clientform"}>
                        <div className="add">
                            <PeopleAddRegular />
                        </div>
                        Add Client
                    </button>
                </div>
            </div>

            <div className="info">
                {length === 0 && <p>{message}</p>}
            </div>

            <div className="clients">
                {clients.map((client) => (
                    <div className="clientBox" key={client._id}>
    <div className="clientTop">
        <div className="icon-client">
            {client.clientName
                .trim()
                .split(" ")
                .map(word => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
        </div>

        <div className="clientName">
            <h3>{client.clientName}</h3>
            <span>Client</span>
        </div>
        <div className="info_button">
            <button type="button" id="btn-client"
            onClick={()=> setActiveDropdown(activeDropdown === client._id ? null : client._id)}
            ><InfoRegular/></button>
            {activeDropdown === client._id && (
        <div className="dropdown">
           <div
    className="dropdown-item"
    onClick={() => {

        localStorage.setItem(
            "editingClient",
            JSON.stringify(client)
        );

        window.location.href = "/clientform";
    }}
>
    Edit Client
</div>
            <div className="dropdown-item delete" onClick={deleteClient}>
                Delete Client
            </div>
        </div>
    )}
        </div>
    </div>

    <div className="details">
        <div className="detailCard">
            <label>GST Number</label>
            <p>{client.gstNumber || "N/A"}</p>
        </div>

        <div className="detailCard">
            <label>Phone Number</label>
            <p>{client.phoneNumber}</p>
        </div>

        <div className="detailCard emailCard" >
            <label>Email Address</label>
            <p>{client.email}</p>
        </div>

        <div className="detailCard addressCard">
            <label>Address</label>
            <p>{client.address}</p>
        </div>
    </div>
</div>

                ))}
            </div>
          {alertMessage && (
    <div className="alert">
        {alertMessage}
    </div>
)}
        </div>
    );
};

export default Client;