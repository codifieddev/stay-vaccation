async function testLogin() {
  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@stayvacation.com", password: "Admin@123" }),
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response Body (first 500 chars):", text.slice(0, 500));
}

testLogin();
