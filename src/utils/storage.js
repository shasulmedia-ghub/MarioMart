// src/utils/storage.js

const storage = {

    saveToken(token) {
        localStorage.setItem("token", token);
    },

    getToken() {
        return localStorage.getItem("token");
    },

    removeToken() {
        localStorage.removeItem("token");
    },

    saveUser(user) {
        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );
    },

    getUser() {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    removeUser() {
        localStorage.removeItem("user");
    },

    clearAuth() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },
};

export default storage;