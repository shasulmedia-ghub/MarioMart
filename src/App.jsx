import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingSpinner from "./component/LoadingSpinner";
import ProtectedRoute from "./component/ProtectedRoute";
const Home = lazy(() => import("./pages/home"));
const Login = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {

    return (

        <BrowserRouter>

            <Suspense
                fallback={<LoadingSpinner />}
            >

                <Routes>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/pages/login"
                        element={<Login />}
                    />

                    <Route
                        path="/pages/register"
                        element={<Register />}
                    />

                    <Route
                        path="/pages/dashboard"
                        element={

                            <ProtectedRoute>

                                <Dashboard />

                            </ProtectedRoute>

                        }
                    />

                    <Route
                        path="*"
                        element={<NotFound />}
                    />

                </Routes>

            </Suspense>

        </BrowserRouter>

    );

}

export default App;