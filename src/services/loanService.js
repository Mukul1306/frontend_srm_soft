import axios from "axios";

const API =
"https://finance-project-0qqk.onrender.com/api/loans";

export const getMembersBySociety =
(id)=>
axios.get(
`${API}/members/${id}`
);

export const getMemberDetails =
(id)=>
axios.get(
`${API}/member/${id}`
);

export const createLoan =
(data)=>
axios.post(
`${API}/create`,
data
);

export const getLoans =
()=>
axios.get(
`${API}/list`
);