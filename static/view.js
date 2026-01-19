// Example products array (replace with your backend data later)
let products = [
    { id: "001", name: "Rice", category: "Grocery", quantity: 50 },
    { id: "002", name: "Sugar", category: "Grocery", quantity: 8 },
    { id: "003", name: "Soap", category: "Toiletries", quantity: 0 },
    { id: "004", name: "Milk", category: "Dairy", quantity: 20 },
    { id: "005", name: "Oil", category: "Grocery", quantity: 5 }
];

// Function to render products in table
function renderProducts(list = products) {
    const table = document.getElementById("productTable");
    table.innerHTML = "";

    list.forEach(p => {
        let status = "In Stock";
        let statusClass = "status-ok";

        if (p.quantity === 0) {
            status = "Out";
            statusClass = "status-out";
        } else if (p.quantity < 10) {
            status = "Low";
            statusClass = "status-low";
        }

        table.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${p.quantity}</td>
                <td class="${statusClass}">${status}</td>
            </tr>
        `;
    });
}

// Search function
function searchProducts() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    renderProducts(filtered);
}

// Initial render
renderProducts();
