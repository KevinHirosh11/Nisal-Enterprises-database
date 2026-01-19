// Sample data (replace with real data from your backend)
let products = [
    { id: "001", name: "Rice", category: "Grocery", quantity: 50 },
    { id: "002", name: "Sugar", category: "Grocery", quantity: 8 },
    { id: "003", name: "Soap", category: "Toiletries", quantity: 0 },
    { id: "004", name: "Milk", category: "Dairy", quantity: 6 },
    { id: "005", name: "Oil", category: "Grocery", quantity: 0 }
];

let bills = [
    { id: "B001", total: 150, status: "completed" },
    { id: "B002", total: 300, status: "pending" },
    { id: "B003", total: 200, status: "completed" },
    { id: "B004", total: 100, status: "pending" }
];

// Render stock summary cards
function renderStockSummary() {
    let total = products.length;
    let inStock = products.filter(p => p.quantity >= 10).length;
    let lowStock = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
    let outStock = products.filter(p => p.quantity === 0).length;

    document.getElementById("totalProducts").innerText = total;
    document.getElementById("inStock").innerText = inStock;
    document.getElementById("lowStock").innerText = lowStock;
    document.getElementById("outStock").innerText = outStock;
}

// Render daily bills summary
function renderBillSummary() {
    let totalBills = bills.length;
    let pendingBills = bills.filter(b => b.status === "pending").length;
    let completedBills = bills.filter(b => b.status === "completed").length;

    document.getElementById("totalBills").innerText = totalBills;
    document.getElementById("pendingBills").innerText = pendingBills;
    document.getElementById("completedBills").innerText = completedBills;
}

// Generate CSV report
function generateReport() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Product ID,Product Name,Category,Quantity\n";

    products.forEach(p => {
        csvContent += `${p.id},${p.name},${p.category},${p.quantity}\n`;
    });

    csvContent += "\nBill ID,Total,Status\n";
    bills.forEach(b => {
        csvContent += `${b.id},${b.total},${b.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "daily_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initial render
renderStockSummary();
renderBillSummary();
