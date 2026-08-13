import axios from "axios";
import API from "../constants/api";

const authService = {

  register: async (userData) => {
    const response = await axios.post(
      `${API.BASE_URL}${API.USERS.REGISTER}`,
      userData
    );

    return response.data;
  },

  login: async (credentials) => {
    const response = await axios.post(
      `${API.BASE_URL}${API.USERS.LOGIN}`,
      credentials
    );

    return response.data;
  },

};

export default authService;