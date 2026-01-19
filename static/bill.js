// Sample products data
let products = [
    { name: "Rice", category: "Grocery", price: 2, qty: 50 },
    { name: "Sugar", category: "Grocery", price: 3, qty: 20 },
    { name: "Soap", category: "Toiletries", price: 1.5, qty: 0 },
    { name: "Milk", category: "Dairy", price: 2.5, qty: 10 },
    { name: "Oil", category: "Grocery", price: 5, qty: 8 }
];

// Bill array
let bill = [];

// Populate product dropdown
const productSelect = document.getElementById("productSelect");
products.forEach((p, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = p.name;
    productSelect.add(option);
});

// Populate product details
function populateProductDetails() {
    const index = productSelect.value;
    if (index === "") return;

    const p = products[index];
    document.getElementById("productCategory").innerText = p.category;
    document.getElementById("productPrice").innerText = p.price.toFixed(2);
    document.getElementById("productQty").innerText = p.qty;
    calculateTotal();
}

// Calculate total amount
function calculateTotal() {
    const index = productSelect.value;
    if (index === "") return;

    const qty = parseFloat(document.getElementById("quantity").value);
    const discount = parseFloat(document.getElementById("discount").value);
    const price = products[index].price;

    const total = qty * price * (1 - discount / 100);
    document.getElementById("totalAmount").innerText = total.toFixed(2);
}

// Add to bill table
function addToBill() {
    const index = productSelect.value;
    if (index === "") {
        alert("Select a product!");
        return;
    }

    const p = products[index];
    const qty = parseFloat(document.getElementById("quantity").value);
    const discount = parseFloat(document.getElementById("discount").value);

    if (qty > p.qty) {
        alert("Quantity exceeds available stock!");
        return;
    }

    const total = qty * p.price * (1 - discount / 100);

    // Update product stock
    p.qty -= qty;

    // Add to bill array
    bill.push({
        name: p.name,
        category: p.category,
        price: p.price,
        qty: qty,
        discount: discount,
        total: total
    });

    renderBill();
    calculateBalance();
    populateProductDetails(); // Update stock
}

// Render bill table
function renderBill() {
    const table = document.getElementById("billTable");
    table.innerHTML = "";

    let grandTotal = 0;

    bill.forEach(item => {
        table.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.qty}</td>
                <td>${item.discount}%</td>
                <td>$${item.total.toFixed(2)}</td>
            </tr>
        `;
        grandTotal += item.total;
    });

    document.getElementById("grandTotal").innerText = grandTotal.toFixed(2);
}

// Calculate balance
function calculateBalance() {
    const paid = parseFloat(document.getElementById("paidAmount").value);
    const grandTotal = parseFloat(document.getElementById("grandTotal").innerText);
    const balance = paid - grandTotal;
    document.getElementById("balance").innerText = balance.toFixed(2);
}

// Save bill details
function saveBill() {
    if (bill.length === 0) {
        alert("❌ No items in the bill!");
        return;
    }

    const grandTotal = parseFloat(document.getElementById("grandTotal").innerText);
    const paidAmount = parseFloat(document.getElementById("paidAmount").value);
    const balance = parseFloat(document.getElementById("balance").innerText);

    // Generate bill ID with timestamp
    const billId = "BILL-" + Date.now();
    const date = new Date().toLocaleString();

    // Create bill data object
    const billData = {
        billId: billId,
        date: date,
        items: bill,
        grandTotal: grandTotal,
        paidAmount: paidAmount,
        balance: balance
    };

    // Save to localStorage
    let savedBills = JSON.parse(localStorage.getItem("savedBills")) || [];
    savedBills.push(billData);
    localStorage.setItem("savedBills", JSON.stringify(savedBills));

    alert(`✅ Bill saved successfully!\nBill ID: ${billId}\nTotal: $${grandTotal.toFixed(2)}`);
    
    // Optional: Reset bill after saving
    if (confirm("Do you want to clear the current bill?")) {
        bill = [];
        renderBill();
        document.getElementById("paidAmount").value = 0;
        calculateBalance();
    }
}

// Print bill
function printBill() {
    if (bill.length === 0) {
        alert("❌ No items to print!");
        return;
    }

    const grandTotal = parseFloat(document.getElementById("grandTotal").innerText);
    const paidAmount = parseFloat(document.getElementById("paidAmount").value);
    const balance = parseFloat(document.getElementById("balance").innerText);
    const date = new Date().toLocaleString();

    // Create printable content
    let printContent = `
        <html>
        <head>
            <title>Print Bill</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #4CAF50; color: white; }
                .total { text-align: right; font-weight: bold; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>🛒 NISAL Enterprises</h1>
            <p><strong>Date:</strong> ${date}</p>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Discount</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    `;

    bill.forEach(item => {
        printContent += `
            <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.qty}</td>
                <td>${item.discount}%</td>
                <td>$${item.total.toFixed(2)}</td>
            </tr>
        `;
    });

    printContent += `
                </tbody>
            </table>
            <p class="total">Grand Total: $${grandTotal.toFixed(2)}</p>
            <p class="total">Paid Amount: $${paidAmount.toFixed(2)}</p>
            <p class="total">Balance: $${balance.toFixed(2)}</p>
            <p style="text-align: center; margin-top: 30px;">Thank you for your business!</p>
        </body>
        </html>
    `;

    // Open print window
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Installment Modal Functions
function openInstallmentModal() {
    if (bill.length === 0) {
        alert("❌ No items in the bill!");
        return;
    }
    document.getElementById("installmentModal").style.display = "block";
    calculateInstallment();
}

function closeInstallmentModal() {
    document.getElementById("installmentModal").style.display = "none";
}

function calculateInstallment() {
    const grandTotal = parseFloat(document.getElementById("grandTotal").innerText);
    const initialPayment = parseFloat(document.getElementById("initialPayment").value) || 0;
    const installmentCount = parseInt(document.getElementById("installmentCount").value) || 1;
    
    const remaining = grandTotal - initialPayment;
    const perInstallment = remaining / installmentCount;
    
    document.getElementById("remainingAmount").innerText = remaining.toFixed(2);
    document.getElementById("perInstallment").innerText = perInstallment.toFixed(2);
}

function saveInstallmentPlan() {
    const customerName = document.getElementById("customerName").value.trim();
    const customerPhone = document.getElementById("customerPhone").value.trim();
    const grandTotal = parseFloat(document.getElementById("grandTotal").innerText);
    const initialPayment = parseFloat(document.getElementById("initialPayment").value) || 0;
    const installmentCount = parseInt(document.getElementById("installmentCount").value) || 1;
    const remaining = parseFloat(document.getElementById("remainingAmount").innerText);
    const perInstallment = parseFloat(document.getElementById("perInstallment").innerText);
    
    if (!customerName || !customerPhone) {
        alert("❌ Please enter customer name and phone number!");
        return;
    }
    
    if (initialPayment > grandTotal) {
        alert("❌ Initial payment cannot exceed grand total!");
        return;
    }
    
    const installmentId = "INST-" + Date.now();
    const date = new Date().toLocaleString();
    
    const installmentData = {
        installmentId: installmentId,
        customerName: customerName,
        customerPhone: customerPhone,
        date: date,
        items: bill,
        grandTotal: grandTotal,
        initialPayment: initialPayment,
        remainingAmount: remaining,
        installmentCount: installmentCount,
        perInstallment: perInstallment,
        paidInstallments: 0,
        status: "Active"
    };
    
    // Save to localStorage
    let installmentPlans = JSON.parse(localStorage.getItem("installmentPlans")) || [];
    installmentPlans.push(installmentData);
    localStorage.setItem("installmentPlans", JSON.stringify(installmentPlans));
    
    alert(`✅ Installment plan saved!\nID: ${installmentId}\nCustomer: ${customerName}\nPer Installment: $${perInstallment.toFixed(2)}`);
    
    closeInstallmentModal();
    
    // Clear form
    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("initialPayment").value = 0;
    document.getElementById("installmentCount").value = 1;
}

// Bill Retrieval Modal Functions
function getBillDetails() {
    document.getElementById("billModal").style.display = "block";
}

function closeBillModal() {
    document.getElementById("billModal").style.display = "none";
}

function retrieveBill() {
    const billId = document.getElementById("billIdInput").value.trim();
    
    if (!billId) {
        alert("❌ Please enter a Bill ID!");
        return;
    }
    
    const savedBills = JSON.parse(localStorage.getItem("savedBills")) || [];
    const foundBill = savedBills.find(b => b.billId === billId);
    
    if (!foundBill) {
        alert("❌ Bill not found!");
        document.getElementById("billDetailsDisplay").innerHTML = "<p style='color: red;'>No bill found with this ID.</p>";
        return;
    }
    
    // Display bill details
    let displayHTML = `
        <div class="bill-details">
            <h3>Bill Information</h3>
            <p><strong>Bill ID:</strong> ${foundBill.billId}</p>
            <p><strong>Date:</strong> ${foundBill.date}</p>
            <p><strong>Grand Total:</strong> $${foundBill.grandTotal.toFixed(2)}</p>
            <p><strong>Paid Amount:</strong> $${foundBill.paidAmount.toFixed(2)}</p>
            <p><strong>Balance:</strong> $${foundBill.balance.toFixed(2)}</p>
            <h4>Items:</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Qty</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    foundBill.items.forEach(item => {
        displayHTML += `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.qty}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">$${item.price.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">$${item.total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    displayHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById("billDetailsDisplay").innerHTML = displayHTML;
}

// Save to Database (Backend)
async function saveToDatabase() {
    if (bill.length === 0) {
        alert("❌ No items in the bill!");
        return;
    }
    
    const grandTotal = parseFloat(document.getElementById("grandTotal").innerText);
    const paidAmount = parseFloat(document.getElementById("paidAmount").value);
    const balance = parseFloat(document.getElementById("balance").innerText);
    
    const billData = {
        date: new Date().toISOString(),
        items: bill,
        grandTotal: grandTotal,
        paidAmount: paidAmount,
        balance: balance
    };
    
    try {
        const response = await fetch('/api/save-bill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(billData)
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`✅ Bill saved to database!\nBill ID: ${result.billId}`);
        } else {
            alert("❌ Failed to save to database. Please try again.");
        }
    } catch (error) {
        console.error("Error saving to database:", error);
        alert("❌ Error: Could not connect to database. Data saved locally instead.");
        saveBill(); // Fallback to localStorage
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const installmentModal = document.getElementById("installmentModal");
    const billModal = document.getElementById("billModal");
    
    if (event.target == installmentModal) {
        closeInstallmentModal();
    }
    if (event.target == billModal) {
        closeBillModal();
    }
}
