let allBills = [];
let filteredBills = [];

function formatDate(dateString) {
    if (!dateString || dateString === "N/A" || dateString === "0000-00-00") {
        return "N/A";
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "N/A";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

window.onload = function() {
    loadBills();
};

function loadBills() {
    fetch("/api/bills")
        .then(res => res.json())
        .then(data => {
            allBills = data;
            filteredBills = data;
            displayBills(allBills);
        })
        .catch(err => {
            console.error("Error loading bills:", err);
            alert("Failed to load bills");
        });
}

function displayBills(bills) {
    const tableBody = document.getElementById("billsTable");
    tableBody.innerHTML = "";

    if (bills.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No bills found</td></tr>';
        return;
    }

    bills.forEach(bill => {
        const row = document.createElement("tr");
        const status = bill.balance <= 0 ? "paid" : "pending";
        const statusText = bill.balance <= 0 ? "Paid" : "Pending";
        const billDate = formatDate(bill.bill_date);

        row.innerHTML = `
            <td>#${bill.bill_id}</td>
            <td>${billDate}</td>
            <td>${bill.customer_name || "N/A"}</td>
            <td>Rs ${parseFloat(bill.total_amount).toFixed(2)}</td>
            <td>Rs ${parseFloat(bill.paid_amount).toFixed(2)}</td>
            <td>Rs ${parseFloat(bill.balance).toFixed(2)}</td>
            <td><span class="status ${status}">${statusText}</span></td>
            <td><button class="btn-view" onclick="viewBillDetails(${bill.bill_id})">View</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function searchBills() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;

    filteredBills = allBills.filter(bill => {
        const matchesSearch = 
            bill.bill_id.toString().includes(searchInput) ||
            (bill.customer_name && bill.customer_name.toLowerCase().includes(searchInput));

        const statusMatch = statusFilter === "" ||
            (statusFilter === "paid" && bill.balance <= 0) ||
            (statusFilter === "pending" && bill.balance > 0);

        return matchesSearch && statusMatch;
    });

    displayBills(filteredBills);
}

function filterBills() {
    searchBills();
}

function viewBillDetails(billId) {
    fetch(`/api/bill/${billId}`)
        .then(res => res.json())
        .then(data => {
            displayBillDetails(data);
            document.getElementById("billDetailsModal").style.display = "block";
        })
        .catch(err => {
            console.error("Error loading bill details:", err);
            alert("Failed to load bill details");
        });
}

function displayBillDetails(data) {
    const bill = data.bill;
    const items = data.items;
    const installment = data.installment;
    const schedule = data.schedule;

    document.getElementById("modalBillId").textContent = `#${bill.bill_id}`;
    document.getElementById("modalBillDate").textContent = formatDate(bill.bill_date);
    document.getElementById("modalCustomerName").textContent = bill.customer_name || "N/A";
    document.getElementById("modalTotalAmount").textContent = `Rs ${parseFloat(bill.total_amount).toFixed(2)}`;
    document.getElementById("modalPaidAmount").textContent = `Rs ${parseFloat(bill.paid_amount).toFixed(2)}`;
    document.getElementById("modalBalance").textContent = `Rs ${parseFloat(bill.balance).toFixed(2)}`;
    
    const statusText = bill.balance <= 0 ? "Paid" : "Pending";
    document.getElementById("modalStatus").textContent = statusText;

    const itemsBody = document.getElementById("billItemsTable");
    itemsBody.innerHTML = "";

    items.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.product_name || "N/A"}</td>
            <td>${item.category || "N/A"}</td>
            <td>${item.quantity}</td>
            <td>Rs ${parseFloat(item.price).toFixed(2)}</td>
            <td>${parseFloat(item.discount).toFixed(2)}%</td>
            <td>Rs ${parseFloat(item.total).toFixed(2)}</td>
        `;
        itemsBody.appendChild(row);
    });

    const installmentSection = document.getElementById("installmentSection");
    if (installment) {
        installmentSection.style.display = "block";
        document.getElementById("modalInitialPayment").textContent = `Rs ${parseFloat(installment.initial_payment).toFixed(2)}`;
        document.getElementById("modalRemainingAmount").textContent = `Rs ${parseFloat(installment.remaining_amount).toFixed(2)}`;
        document.getElementById("modalInstallmentCount").textContent = installment.installment_count;
        document.getElementById("modalPerInstallment").textContent = `Rs ${parseFloat(installment.per_installment).toFixed(2)}`;

        const scheduleBody = document.getElementById("scheduleTable");
        scheduleBody.innerHTML = "";

        schedule.forEach(sch => {
            const row = document.createElement("tr");
            const statusText = sch.paid ? "Paid" : "Unpaid";
            const statusClass = sch.paid ? "paid" : "pending";
            row.innerHTML = `
                <td>${sch.installment_no}</td>
                <td>Rs ${parseFloat(sch.amount).toFixed(2)}</td>
                <td>${sch.due_date}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
            `;
            scheduleBody.appendChild(row);
        });
    } else {
        installmentSection.style.display = "none";
    }
}

function closeBillDetails() {
    document.getElementById("billDetailsModal").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("billDetailsModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function printBill() {
    window.print();
}
