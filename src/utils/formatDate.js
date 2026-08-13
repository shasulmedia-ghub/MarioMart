// src/utils/formatDate.js

export function formatDate(date) {

    if (!date) return "";
    return new Date(date).toLocaleDateString(
        "en-SG",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    );
}

export function formatDateTime(date) {

    if (!date) return "";
    return new Date(date).toLocaleString(
        "en-SG"
    );
}