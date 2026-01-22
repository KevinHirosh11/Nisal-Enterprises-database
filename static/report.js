let reportData = { stock: {}, daily: [], today: null };

async function loadReport() {
    try {
        const res = await fetch("/api/report/daily");
        if (!res.ok) {
            throw new Error(`Failed to load report (${res.status})`);
        }
        const data = await res.json();
        reportData = {
            stock: data.stock || {},
            daily: Array.isArray(data.daily) ? data.daily : [],
            today: data.today || null
        };
        renderStockSummary();
        renderBillSummary();
    } catch (err) {
        console.error("Report load error:", err);
        alert(err.message || "Failed to load report");
    }
}

function renderStockSummary() {
    const stock = reportData.stock || {};
    document.getElementById("totalProducts").innerText = stock.total_products || 0;
    document.getElementById("inStock").innerText = stock.in_stock || 0;
    document.getElementById("lowStock").innerText = stock.low_stock || 0;
    document.getElementById("outStock").innerText = stock.out_stock || 0;
}

function renderBillSummary() {
    const todayRow = reportData.daily.find(r => r.bill_date === reportData.today) || reportData.daily[0] || {};
    document.getElementById("totalBills").innerText = todayRow.total_bills || 0;
    document.getElementById("pendingBills").innerText = todayRow.pending_bills || 0;
    document.getElementById("completedBills").innerText = todayRow.completed_bills || 0;
}

function generateReport() {
    const stock = reportData.stock || {};
    const daily = reportData.daily || [];

    let csv = "Bill Date,Total Bills,Pending Bills,Completed Bills,Total Amount (Rs),Paid (Rs),Balance (Rs)\n";
    daily.forEach(row => {
        const billDate = row.bill_date ? row.bill_date.toString() : "";
        const totalBills = row.total_bills || 0;
        const pendingBills = row.pending_bills || 0;
        const completedBills = row.completed_bills || 0;
        const totalAmount = Number(row.total_amount || 0).toFixed(2);
        const paidAmount = Number(row.paid_amount || 0).toFixed(2);
        const balance = Number(row.balance || 0).toFixed(2);
        
        csv += `"${billDate}",${totalBills},${pendingBills},${completedBills},${totalAmount},${paidAmount},${balance}\n`;
    });

    csv += "\n\nStock Summary\n";
    csv += "Metric,Count\n";
    csv += `Total Products,${stock.total_products || 0}\n`;
    csv += `In Stock,${stock.in_stock || 0}\n`;
    csv += `Low Stock,${stock.low_stock || 0}\n`;
    csv += `Out of Stock,${stock.out_stock || 0}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "daily_summary.csv";
    link.click();
    URL.revokeObjectURL(link.href);
}

window.onload = loadReport;
