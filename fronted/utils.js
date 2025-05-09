const BASE_URL = "http://localhost:3000";  // 按实际后端地址修改

async function request(path, method = "GET", data = null) {
  const token = localStorage.getItem("token");
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    },
    ...(data ? { body: JSON.stringify(data) } : {})
  };

  const res = await fetch(BASE_URL + path, options);
  return await res.json();
}
