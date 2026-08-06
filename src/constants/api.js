const API = {
    BASE_URL: "https://mm-api-virid.vercel.app",

    AUTH: {
        REGISTER: "/api/users/register",
        LOGIN: "/api/users/login",
        UPDATE: "/api/users",
    },

    PRODUCTS: {
        ALL: "/api/products",
        CATEGORY: "/api/products/category",
    },

    CART: {
        USER: "/api/cart",
        SUMMARY: "/api/cart",
    },

    ORDERS: {
        ALL: "/api/orders",
        USER: "/api/orders/user",
    },
};

export default API;