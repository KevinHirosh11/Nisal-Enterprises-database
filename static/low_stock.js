// Sample product data (replace with your real data later)
let products = [
    { id: "001", name: "Rice", category: "Grocery", quantity: 50 },
    { id: "002", name: "Sugar", category: "Grocery", quantity: 8 },
    { id: "003", name: "Soap", category: "Toiletries", quantity: 0 },
    { id: "004", name: "Milk", category: "Dairy", quantity: 6 },
    { id: "005", name: "Oil", category: "Grocery", quantity: 0 },
    { id: "006", name: "Bread", category: "Bakery", quantity: 3 }
];

function renderLowStock() {
    const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity < 10);
    document.getElementById("lowStockCount").innerText = lowStockProducts.length;

    const table = document.getElementById("lowStockTable");
    table.innerHTML = "";

    lowStockProducts.forEach(p => {
        table.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${p.quantity}</td>
                <td class="status-low">Low Stock</td>
            </tr>
        `;
    });

    if (lowStockProducts.length === 0) {
        table.innerHTML = `<tr><td colspan="5">✅ No low stock products!</td></tr>`;
    }
}

function renderOutStock() {
    const outStockProducts = products.filter(p => p.quantity === 0);
    document.getElementById("outStockCount").innerText = outStockProducts.length;

    const table = document.getElementById("outStockTable");
    table.innerHTML = "";

    outStockProducts.forEach(p => {
        table.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${p.quantity}</td>
                <td class="status-out">Out of Stock</td>
            </tr>
        `;
    });

    if (outStockProducts.length === 0) {
        table.innerHTML = `<tr><td colspan="5">🎉 No out of stock products!</td></tr>`;
    }
}

// Render both tables on page load
renderLowStock();
renderOutStock();
