const pool = require("../db");

const getUserByEmail = async (email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email.toLowerCase()]
    );
    return result.rows[0];
};

const createUser = async (user) => {
    const {
        first_name,
        last_name,
        email,
        password_hash,
        gender,
        date_of_birth,
        address,
        marketing_opt_in,
    } = user;

    const result = await pool.query(
        `INSERT INTO users
        (
            first_name,
            last_name,
            email,
            password_hash,
            gender,
            date_of_birth,
            address,
            marketing_opt_in
        )

        VALUES(
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
        )

        RETURNING
            id,
            first_name,
            last_name,
            email,
            gender,
            date_of_birth,
            address,
            marketing_opt_in,
            created_at;`,

        [
            first_name,
            last_name,
            email,
            password_hash,
            gender || null,
            date_of_birth || null,
            address || null,
            marketing_opt_in || false
        ]

    );

    return result.rows[0];

};

const getUserById = async (id) => {
    const result = await pool.query(
        "SELECT id, first_name, last_name, email, role, gender, date_of_birth, address, marketing_opt_in, created_at FROM users WHERE id=$1",
        [id]
    );
    return result.rows[0];
};

const updateLastLogin = async (id) => {
    const result = await pool.query(
        "UPDATE users SET last_login=CURRENT_TIMESTAMP WHERE id=$1 RETURNING id, last_login",
        [id]
    );
    return result.rows[0];
};

module.exports = {
    getUserByEmail,
    createUser,
    getUserById,
    updateLastLogin
};