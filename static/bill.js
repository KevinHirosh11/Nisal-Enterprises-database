
let currentBillId = null;

async function createBillOnLoad() {
    const res = await fetch("/api/bill", { method: "POST" });
    const data = await res.json();
    currentBillId = data.bill_id;
    console.log("Bill Created:", currentBillId);
}

window.onload = () => {
    createBillOnLoad();
    loadProducts();
};

async function addToBill() {
    const id = document.getElementById("productSelect").value;
    const product = products.find(p => p.product_id == id);

    const qty = parseInt(document.getElementById("quantity").value);
    const discount = parseInt(document.getElementById("discount").value);
    const total = parseFloat(document.getElementById("totalAmount").innerText);

    if (!product) return alert("Select product");

    await fetch("/api/bill/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            bill_id: currentBillId,
            product_id: product.product_id,
            product_name: product.product_name,
            category: product.category,
            price: product.price,
            quantity: qty,
            discount: discount,
            total: total
        })
    });

    billItems.push({ ...product, qty, discount, total });
    grandTotal += total;

    document.getElementById("grandTotal").innerText = grandTotal.toFixed(2);
    renderBillTable();

    // Remove product from dropdown
    products = products.filter(p => p.product_id != product.product_id);
    document.getElementById("productSelect").innerHTML =
        `<option value="">-- Select Product --</option>`;
    loadProducts();
}

async function saveToDatabase() {
    const paid = parseFloat(document.getElementById("paidAmount").value) || 0;
    const balance = grandTotal - paid;

    await fetch("/api/bill", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            bill_id: currentBillId,
            grand_total: grandTotal,
            paid_amount: paid,
            balance: balance
        })
    });

    alert("Bill saved successfully!");
}
