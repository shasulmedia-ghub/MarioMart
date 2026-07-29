// src/constants/api.js

const API = {

    BASE_URL: "http://localhost:5173/api",

    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        PROFILE: "/auth/profile",
        LOGOUT: "/auth/logout",
    },

    PRODUCT: {
        ALL: "/products",
        SEARCH: "/products/search",
        DETAILS: "/products",
    },

    CART: {
        ALL: "/cart",
        ADD: "/cart",
    },

    ORDER: {
        ALL: "/orders",
        CHECKOUT: "/orders/checkout",
    },

};

export default API;