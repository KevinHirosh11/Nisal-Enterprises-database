
document.getElementById("total").innerText = 120;

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        window.location.href = "/logout"; 
    }
}

function searchProducts() {
    const input = document.getElementById("searchInput");
    const filter = input.value.toLowerCase();
    const table = document.querySelector(".table-box table");
    const rows = table.getElementsByTagName("tr");

    // Loop through all table rows (skip header row)
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let found = false;

        // Search through all cells in the row
        for (let j = 0; j < cells.length; j++) {
            const cellText = cells[j].textContent || cells[j].innerText;
            if (cellText.toLowerCase().indexOf(filter) > -1) {
                found = true;
                break;
            }
        }

        // Show or hide the row based on search result
        if (found) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}
