import axios from "axios";
import API from "../constants/api";
import storage from "../utils/storage";

const client = axios.create({

    baseURL: API.BASE_URL,
});

client.interceptors.request.use((config) => {

    const token = storage.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

});

const authService = {

    register: (data) =>
        client.post(API.AUTH.REGISTER, data),
    login: (data) =>

        client.post(API.AUTH.LOGIN, data),
    profile: () =>

        client.get(API.AUTH.PROFILE),

};

export default authService;