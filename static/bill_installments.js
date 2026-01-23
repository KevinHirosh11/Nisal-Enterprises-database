let allPlans = [];

function formatMoney(value) {
    const n = Number(value || 0);
    if (Number.isNaN(n)) return "0.00";
    return n.toFixed(2);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderPlans(plans) {
    const tableBody = document.getElementById("installmentTable");
    tableBody.innerHTML = "";

    if (!Array.isArray(plans) || plans.length === 0) {
        tableBody.innerHTML = '<tr><td class="empty" colspan="9">No installment plans found</td></tr>';
        return;
    }

    plans.forEach(plan => {
        const installmentId = plan.installment_id;
        const schedule = Array.isArray(plan.schedule) ? plan.schedule : [];

        const scheduleHtml = schedule.length
            ? `
                <table class="inner-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Amount (Rs)</th>
                            <th>Due Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${schedule.map(s => {
                            const paid = !!s.paid;
                            return `
                                <tr>
                                    <td>${escapeHtml(s.installment_no)}</td>
                                    <td>${formatMoney(s.amount)}</td>
                                    <td>${escapeHtml(s.due_date)}</td>
                                    <td><span class="badge ${paid ? "paid" : "pending"}">${paid ? "Paid" : "Pending"}</span></td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            `
            : '<div class="empty">No schedule rows found</div>';

        tableBody.innerHTML += `
            <tr class="summary-row" data-installment-id="${escapeHtml(installmentId)}">
                <td>${escapeHtml(plan.bill_id)}</td>
                <td>${escapeHtml(plan.customer_name)}</td>
                <td>${escapeHtml(plan.phone || "")}</td>
                <td>${formatMoney(plan.total_amount)}</td>
                <td>${formatMoney(plan.initial_payment)}</td>
                <td>${formatMoney(plan.remaining_amount)}</td>
                <td>${escapeHtml(plan.installment_count ?? "")}</td>
                <td>${formatMoney(plan.per_installment)}</td>
                <td>
                    <button class="schedule-btn" onclick="toggleSchedule(${Number(installmentId)})">View</button>
                </td>
            </tr>
            <tr id="schedule-${escapeHtml(installmentId)}" class="schedule-row" style="display:none;">
                <td colspan="9">
                    ${scheduleHtml}
                </td>
            </tr>
        `;
    });
}

async function loadInstallments() {
    try {
        const response = await fetch("/api/bill_installments");
        if (!response.ok) {
            throw new Error(`Failed to load installments (${response.status})`);
        }
        const data = await response.json();
        allPlans = Array.isArray(data) ? data : [];
        renderPlans(allPlans);
        searchInstallments(); // apply any existing filter
    } catch (error) {
        console.error("Installments load error:", error);
        alert(error.message || "Failed to load bill installments");
    }
}

function toggleSchedule(installmentId) {
    const el = document.getElementById(`schedule-${installmentId}`);
    if (!el) return;
    el.style.display = el.style.display === "none" ? "table-row" : "none";
}

function searchInstallments() {
    const input = (document.getElementById("searchInput").value || "").toLowerCase().trim();
    if (!input) {
        renderPlans(allPlans);
        return;
    }

    const filtered = allPlans.filter(p => {
        const billId = String(p.bill_id ?? "").toLowerCase();
        const customer = String(p.customer_name ?? "").toLowerCase();
        return billId.includes(input) || customer.includes(input);
    });

    renderPlans(filtered);
}

window.onload = loadInstallments;
