import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./logIn";
import SignUp from "./signup";
import Home from "./home";
import SideMenu from "./sideMenu";
import Client from "./customer";
import Setting from "./setting";
import Invoices from "./invoices";
import instance from "./api/axios";
import ProtectedRoute from "./components/protech";
import ClientForm from "./clientform";
import CompanyForm from "./companyForm";
import InvoiceForm from "./invoiceForm";
import InvoicePreview from "./invoicePreview";
import ProformaInvoices from "./preforma-invoice";
import ProformaForm from "./proformaForm";
import ProformaInvoicePreview from "./proforma-preview";
import PrivacyPolicy from "./privacy"
import Pay from "./pay"
import Terms from "./terms"
import "./App-2.css";


function App() {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const checkAuth = async () => {

            try {

                const response =
                    await instance.get("/user/me");

                setUser(response.data.user);

            } catch (err) {

                setUser(null);

            } finally {

                setLoading(false);

            }

        };

        checkAuth();

    }, []);

    if (loading) {
        return <h1>Loading...</h1>;
    }

    return (
        <div className="app">
            <Routes>

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/signUp"
                element={<SignUp />}
            />

            <Route
                path="/"
                element={
                    <ProtectedRoute user={user}>
                        <div className="layout">
                            <SideMenu />
                        <Home user={user} />
                        </div>
                         
                    </ProtectedRoute>
                }
            />
            <Route
                path="/clients"
                element={
                    <ProtectedRoute user={user}>
                        <div className="layout">
                            <SideMenu />
                            <Client />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute user={user}>
                        <div className="layout">
                            <SideMenu />
                            <Setting />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/privacy"
                element={<PrivacyPolicy />}
            />
            <Route
                path="/pay"
                element={<Pay />}
            />
            <Route
                path="/terms"
                element={<Terms />}
            />
            <Route
                path="/invoices"
                element={
                    <ProtectedRoute user={user}>
                        <div className="layout">
                            <SideMenu />
                            <Invoices />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/proforma-invoices"
                element={
                    <ProtectedRoute user={user}>
                        <div className="layout">
                            <SideMenu />
                            <ProformaInvoices />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/clientForm"
                element={
                    <ProtectedRoute user={user}>
                        <div className="layout">
                            <SideMenu />
                            <ClientForm />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/companyForm"
                element={
                    <ProtectedRoute user={user}>
                        <div className="layout">
                            <SideMenu />
                            <CompanyForm />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/invoiceForm"
                element={
                    <ProtectedRoute user={user}>
                        <div className="layout">
                            <SideMenu />
                            <InvoiceForm />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/invoice/preview/:id"
                element={
                    <ProtectedRoute user={user}>
                        <div className="layout">
                            <SideMenu />
                            <InvoicePreview />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/proforma-invoice-form"
                element={
                    <ProtectedRoute user={user}>
                        <div className="layout">
                            <SideMenu />
                            <ProformaForm />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/proforma-invoice/preview/:id"
                element={
                    <ProtectedRoute user={user}>
                        <div className="layout">
                            <SideMenu />
                            <ProformaInvoicePreview />
                        </div>
                    </ProtectedRoute>
                }
            />


        </Routes>
        </div>
    );
}

export default App;