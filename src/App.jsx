import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingSpinner from "./component/LoadingSpinner";
import ProtectedRoute from "./component/ProtectedRoute";
const Home = lazy(() => import("./pages/home"));
const Login = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
import ROUTES from "./constants/routes";

function App() {

    return (
        <BrowserRouter>
            <Suspense
                fallback={<LoadingSpinner />}
            >
                <Routes>
                    <Route
                        path={ROUTES.HOME}
                        element={<Home />}
                    />

                    <Route
                        path={ROUTES.LOGIN}
                        element={<Login />}
                    />

                    <Route
                        path={ROUTES.REGISTER}
                        element={<Register />}
                    />

                    <Route
                        path={ROUTES.DASHBOARD}
                        element={

                            <ProtectedRoute>

                                <Dashboard />

                            </ProtectedRoute>

                        }
                    />

                    <Route
                        path={ROUTES.NOT_FOUND}
                        element={<NotFound />}
                    />

                </Routes>

            </Suspense>

        </BrowserRouter>

    );

}

export default App;