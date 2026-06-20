import { useState, useEffect } from "react";
import instance from "./api/axios";
import "./client_form.css";
import { CheckmarkStarburst32Regular } from "@fluentui/react-icons";

const ClientForm = () => {

    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [clientGST, setClientGST] = useState("");
    const [editingClient, setEditingClient] = useState(null);


    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const clearForm = () => {
        setClientName("");
        setClientEmail("");
        setClientPhone("");
        setClientAddress("");
        setClientGST("");
    };

    
const handleSubmit = async () => {

    if (loading) return;

    setLoading(true);
    setSuccess("");
    setError("");

    try {

        if (editingClient) {

            await instance.put(
                `/client/update/${editingClient._id}`,
                {
                    clientName,
                    email: clientEmail,
                    phoneNumber: clientPhone,
                    address: clientAddress,
                    gstNumber: clientGST
                }
            );

            localStorage.removeItem("editingClient");

            setSuccess("✅ Client updated successfully!");
            setTimeout(() => {
                window.location.href = "/clients";
            }, 1500);

        } else {

            await instance.post(
                "/client/create",
                {
                    clientName,
                    email: clientEmail,
                    phoneNumber: clientPhone,
                    address: clientAddress,
                    gstNumber: clientGST
                }
            );

            setSuccess("✅ Client created successfully!");
            setTimeout(() => {
                window.location.href = "/clients";
            }, 1500);
        }

        clearForm();
        setEditingClient(null);

        setTimeout(() => {
            window.location.href = "/clients";
        }, 1500);

    } catch (err) {

        const errorMessage =
            err.response?.data?.error ||
            err.response?.data?.message ||
            "Something went wrong";

        setError(`❌ ${errorMessage}`);

        setTimeout(() => {
            setError("");
        }, 3000);

    } finally {

        setLoading(false);

    }
};

        useEffect(() => {

    const storedClient =
        localStorage.getItem("editingClient");

    if (storedClient) {

        const client =
            JSON.parse(storedClient);

        setEditingClient(client);

        setClientName(client.clientName);
        setClientEmail(client.email);
        setClientPhone(client.phoneNumber);
        setClientAddress(client.address);
        setClientGST(client.gstNumber || "");
    }

}, []);
    return (
        

        <div className="formContainer">

            <div className="form">

                <div className="form-header">
                  <h2>
    {editingClient
        ? "Edit Client"
        : "Create Client"}
</h2>
                    <p>
                        A complete client profile ensures accurate invoicing
                        and tax compliance.
                    </p>
                </div>

                {success && (
                    <div className="successBox">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="errorBox">
                        {error}
                    </div>
                )}

                <div className="section">

                    <h3>Client Information</h3>

                    <div className="grid">

                        <div className="field">
                            <label>Client Name</label>
                            <input
                                type="text"
                                placeholder="Enter client name"
                                value={clientName}
                                onChange={(e) =>
                                    setClientName(e.target.value)
                                }
                            />
                        </div>

                        <div className="field">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter email"
                                value={clientEmail}
                                onChange={(e) =>
                                    setClientEmail(e.target.value)
                                }
                            />
                        </div>

                        <div className="field">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                placeholder="Enter phone number"
                                value={clientPhone}
                                onChange={(e) =>
                                    setClientPhone(e.target.value)
                                }
                            />
                        </div>

                        <div className="field">
                            <label>GST Number</label>
                            <input
                                type="text"
                                placeholder="Enter GST Number"
                                value={clientGST}
                                onChange={(e) =>
                                    setClientGST(e.target.value)
                                }
                            />
                        </div>

                    </div>

                    <div className="field addressField">
                        <label>Address</label>

                        <textarea
                            placeholder="Enter complete address"
                            value={clientAddress}
                            onChange={(e) =>
                                setClientAddress(e.target.value)
                            }
                        />
                    </div>

                        <button
                            className="submitBtn"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                           {loading
    ? editingClient
        ? "Updating Client..."
        : "Creating Client..."
    : editingClient
        ? "Update Client"
        : "Create Client"}
                        </button>

                </div>

            </div>

            <div className="promotion">

                <div className="invoizor">

                    <div className="heading-ino">

                        <h3 id="text">
                            Why Invoizor?
                        </h3>

                        <div className="icon">
                            <CheckmarkStarburst32Regular />
                        </div>

                    </div>

                    <p id="textPara">
                        Adding complete client profiles ensures
                        automated tax compliance, accurate invoice
                        aging reports, and seamless payment
                        collection cycles.
                    </p>

                    <div className="featureList">

                        <div className="featureItem">
                            ✓ Faster Invoice Generation
                        </div>

                        <div className="featureItem">
                            ✓ GST Ready Client Records
                        </div>

                        <div className="featureItem">
                            ✓ Better Payment Tracking
                        </div>

                        <div className="featureItem">
                            ✓ Professional Client Management
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ClientForm;