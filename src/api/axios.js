import axios from "axios";
const BASE_URL = "http://lms278.runasp.net"


export default axios.create ({
    baseURL: BASE_URL,
    headers: {"Content-Type":'application/json'},
})
//test