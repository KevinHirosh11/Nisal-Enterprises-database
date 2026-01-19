function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const error = document.getElementById("error");

    if (user === "" || pass === "") {
        error.textContent = "⚠ Please fill all fields!";
    } 
    else if (user === "admin" && pass === "1234") {
        alert("🎉 Login Successful!");
        window.location.href = "/dashboard";
    } 
    else {
        error.textContent = "❌ Invalid username or password!";
    }
}
