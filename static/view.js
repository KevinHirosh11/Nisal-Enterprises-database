async function loadProducts() {
    try {
        const response = await fetch("/api/view");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        
        if (!Array.isArray(products)) {
            throw new Error("Invalid data format received");
        }

        const tableBody = document.getElementById("productTable");
        tableBody.innerHTML = "";

        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No products found</td></tr>';
            return;
        }

        products.forEach(product => {
            let status = "In Stock";
            let statusClass = "in";

            if (product.quantity === 0) {
                status = "Out of Stock";
                statusClass = "out";
            } else if (product.quantity <= 10) {
                status = "Low Stock";
                statusClass = "low";
            }

            tableBody.innerHTML += `
                <tr>
                    <td>${product.product_id}</td>
                    <td>${product.product_name}</td>
                    <td>${product.category}</td>
                    <td>${product.quantity}</td>
                    <td>Rs ${Number(product.price || 0).toFixed(2)}</td>
                    <td class="${statusClass}">${status}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error details:", error);
        alert("Error loading products: " + error.message);
    }
}

function searchProducts() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#productTable tr");
    
    rows.forEach(row => {
        const productName = row.cells[1]?.textContent.toLowerCase() || "";
        row.style.display = productName.includes(input) ? "" : "none";
    });
}

window.onload = loadProducts;
