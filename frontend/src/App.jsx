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

        </Routes>
        </div>
    );
}

export default App;