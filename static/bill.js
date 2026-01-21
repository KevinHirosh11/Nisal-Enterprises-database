let products = [];
let billItems = [];
let grandTotal = 0;

// Load products when page loads
window.onload = function() {
    loadProducts();
};

// Load products from database
function loadProducts() {
    fetch("/api/products")
        .then(res => res.json())
        .then(data => {
            products = data;
            populateProductDropdown();
        })
        .catch(err => {
            console.error("Error loading products:", err);
            alert("Failed to load products");
        });
}

// Populate product dropdown
function populateProductDropdown() {
    const select = document.getElementById("productSelect");
    select.innerHTML = '<option value="">-- Select Product --</option>';
    
    products.forEach(product => {
        const option = document.createElement("option");
        option.value = product.product_id;
        option.textContent = product.product_name;
        select.appendChild(option);
    });
}

// Populate product details when selected
function populateProductDetails() {
    const productId = document.getElementById("productSelect").value;
    
    if (!productId) {
        document.getElementById("productCategory").textContent = "-";
        document.getElementById("productPrice").textContent = "0";
        document.getElementById("productQty").textContent = "0";
        document.getElementById("totalAmount").textContent = "0";
        return;
    }
    
    const product = products.find(p => p.product_id == productId);
    if (product) {
        document.getElementById("productCategory").textContent = product.category;
        document.getElementById("productPrice").textContent = product.price;
        document.getElementById("productQty").textContent = product.quantity;
        calculateTotal();
    }
}

// Calculate total amount
function calculateTotal() {
    const productId = document.getElementById("productSelect").value;
    if (!productId) {
        document.getElementById("totalAmount").textContent = "0";
        return;
    }
    
    const product = products.find(p => p.product_id == productId);
    const quantity = parseInt(document.getElementById("quantity").value) || 0;
    const discount = parseFloat(document.getElementById("discount").value) || 0;
    
    if (product) {
        const subtotal = product.price * quantity;
        const discountAmount = (subtotal * discount) / 100;
        const total = subtotal - discountAmount;
        document.getElementById("totalAmount").textContent = total.toFixed(2);
    }
}

// Add product to bill
function addToBill() {
    const productId = document.getElementById("productSelect").value;
    if (!productId) {
        alert("Please select a product");
        return;
    }
    
    const product = products.find(p => p.product_id == productId);
    const quantity = parseInt(document.getElementById("quantity").value) || 0;
    const discount = parseFloat(document.getElementById("discount").value) || 0;
    
    if (quantity <= 0) {
        alert("Please enter a valid quantity");
        return;
    }
    
    if (quantity > product.quantity) {
        alert(`Only ${product.quantity} units available in stock`);
        return;
    }
    
    const subtotal = product.price * quantity;
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;
    
    // Check if product already in bill
    const existingItem = billItems.find(item => item.product_id == productId);
    if (existingItem) {
        existingItem.qty += quantity;
        existingItem.total = (product.price * existingItem.qty) - ((product.price * existingItem.qty * existingItem.discount) / 100);
    } else {
        billItems.push({
            product_id: productId,
            name: product.product_name,
            category: product.category,
            price: product.price,
            qty: quantity,
            discount: discount,
            total: total
        });
    }
    
    updateBillTable();
    resetForm();
}

// Update bill table
function updateBillTable() {
    const tbody = document.getElementById("billTable");
    tbody.innerHTML = "";
    
    grandTotal = 0;
    
    billItems.forEach((item, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>Rs ${item.price}</td>
            <td>${item.qty}</td>
            <td>${item.discount}%</td>
            <td>Rs ${item.total.toFixed(2)}</td>
        `;
        grandTotal += item.total;
    });
    
    document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
    calculateBalance();
}

// Calculate balance
function calculateBalance() {
    const paidAmount = parseFloat(document.getElementById("paidAmount").value) || 0;
    const balance = grandTotal - paidAmount;
    document.getElementById("balance").textContent = balance.toFixed(2);
}

// Reset form
function resetForm() {
    document.getElementById("productSelect").value = "";
    document.getElementById("quantity").value = "1";
    document.getElementById("discount").value = "0";
    document.getElementById("productCategory").textContent = "-";
    document.getElementById("productPrice").textContent = "0";
    document.getElementById("productQty").textContent = "0";
    document.getElementById("totalAmount").textContent = "0";
}

// Save bill to database
function saveToDatabase() {
    if (billItems.length === 0) {
        alert("Please add items to the bill");
        return;
    }
    
    const paidAmount = parseFloat(document.getElementById("paidAmount").value) || 0;
    const balance = grandTotal - paidAmount;
    
    fetch("/api/bill", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            grandTotal: grandTotal,
            paidAmount: paidAmount,
            balance: balance,
            paymentType: balance > 0 ? "INSTALLMENT" : "FULL",
            items: billItems
        })
    })
    .then(res => res.json())
    .then(data => {
        const billId = data.bill_id || data.bill_no || "N/A";
        localStorage.setItem("currentBillId", billId);
        alert("Bill Saved Successfully!\nBill ID: " + billId);
        clearBill();
    })
    .catch(err => {
        console.error("Error saving bill:", err);
        alert("Failed to save bill");
    });
}


function clearBill() {
    billItems = [];
    grandTotal = 0;
    updateBillTable();
    document.getElementById("paidAmount").value = "0";
    document.getElementById("balance").textContent = "0";
    resetForm();
}

function saveBill() {
    return saveToDatabase();
}

// Print bill
function printBill() {
    if (billItems.length === 0) {
        alert("No items to print");
        return;
    }
    window.print();
}

// Installment modal functions
function openInstallmentModal() {
    if (billItems.length === 0) {
        alert("Please add items to the bill");
        return;
    }
    document.getElementById("installmentModal").style.display = "block";
    calculateInstallment();
}

function closeInstallmentModal() {
    document.getElementById("installmentModal").style.display = "none";
}

function calculateInstallment() {
    const initialPayment = parseFloat(document.getElementById("initialPayment").value) || 0;
    const installmentCount = parseInt(document.getElementById("installmentCount").value) || 1;
    const remaining = grandTotal - initialPayment;
    const perInstallment = remaining / installmentCount;
    
    document.getElementById("remainingAmount").textContent = remaining.toFixed(2);
    document.getElementById("perInstallment").textContent = perInstallment.toFixed(2);
}

function saveInstallmentPlan() {
    const customerName = document.getElementById("customerName").value.trim();
    const customerPhone = document.getElementById("customerPhone").value.trim();
    const initialPayment = parseFloat(document.getElementById("initialPayment").value) || 0;
    const installmentCount = parseInt(document.getElementById("installmentCount").value) || 1;
    const perInstallment = parseFloat(document.getElementById("perInstallment").textContent) || 0;

    // Validation
    if (!customerName) {
        alert("Please enter customer name");
        return;
    }
    if (!customerPhone) {
        alert("Please enter phone number");
        return;
    }
    if (installmentCount < 1) {
        alert("Please select at least 1 installment");
        return;
    }

    // Get bill ID from localStorage or form
    let billId = localStorage.getItem("currentBillId");
    if (!billId) {
        alert("No bill selected. Please save the bill first.");
        return;
    }

    const installmentData = {
        bill_id: billId,
        customer_name: customerName,
        customer_phone: customerPhone,
        initial_payment: initialPayment,
        installment_count: installmentCount,
        per_installment: perInstallment,
        total_amount: grandTotal
    };

    fetch("/api/installment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(installmentData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("✓ Installment plan saved successfully!\nInstallment ID: " + data.installment_id);
            closeInstallmentModal();
            // Clear form fields
            document.getElementById("customerName").value = "";
            document.getElementById("customerPhone").value = "";
            document.getElementById("initialPayment").value = 0;
            document.getElementById("installmentCount").value = 1;
        } else {
            alert("Error: " + (data.error || "Failed to save installment plan"));
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error saving installment plan: " + error.message);
    });
}

// Bill retrieval modal functions
function getBillDetails() {
    document.getElementById("billModal").style.display = "block";
}

function closeBillModal() {
    document.getElementById("billModal").style.display = "none";
}

function retrieveBill() {
    const billId = document.getElementById("billIdInput").value;
    if (!billId) {
        alert("Please enter a Bill ID");
        return;
    }
    alert("Bill retrieval feature coming soon!");
}
