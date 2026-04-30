async function seed() {
  console.log("Starting seed...");
  try {
    const res = await fetch("http://localhost:3000/api/auth/seed", {
      method: "POST",
    });
    const result = await res.json();
    console.log("Seed Result:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Seed failed:", e);
  }
}

seed();
