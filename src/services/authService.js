import axios from "axios";

const API = axios.create({

    baseURL: "http://localhost:5000/api",

});

const authService = {

    register: async (userData) => {

        const response = await API.post(

            "/auth/register",

            userData

        );

        return response.data;

    },

    login: async (credentials) => {

        const response = await API.post(

            "/auth/login",

            credentials

        );

        return response.data;

    },

    getProfile: async () => {

        const token = localStorage.getItem("token");

        const response = await API.get(

            "/auth/profile",

            {

                headers: {

                    Authorization: `Bearer ${token}`,

                },

            }

        );

        return response.data;

    },

    logout: () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

    },

};

export default authService;