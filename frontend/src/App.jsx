import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./logIn";
import Home from "./home";
import instance from "./api/axios";
import ProtectedRoute from "./components/protech";

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
        <Routes>

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/"
                element={
                    <ProtectedRoute user={user}>
                        <Home user={user} />
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}

export default App;