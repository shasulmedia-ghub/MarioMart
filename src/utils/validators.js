// src/utils/validators.js

export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password) => {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(password);
};

export const passwordsMatch = (
    password,
    confirmPassword
) => {
    return password === confirmPassword;
};

export const required = (value) => {
    return value.trim() !== "";
};

export const validatePhone = (phone) => {
    return /^[689]\d{7}$/.test(phone);
};