let allOrders = [];

window.addEventListener("DOMContentLoaded", () => {
    loadOrders();
    const input = document.getElementById("searchInput");
    if (input) {
        input.addEventListener("input", () => {
            const query = input.value.trim().toLowerCase();
            const filtered = allOrders.filter(order => {
                const name = String(order.customer_name || "").toLowerCase();
                const phone = String(order.customer_phone || "").toLowerCase();
                const idNumber = String(order.customer_id_number || "").toLowerCase();
                return name.includes(query) || phone.includes(query) || idNumber.includes(query);
            });
            renderOrders(filtered);
        });
    }
});

function loadOrders() {
    fetch("/api/seettu-orders")
        .then(res => res.json())
        .then(data => {
            allOrders = Array.isArray(data) ? data : [];
            renderOrders(allOrders);
        })
        .catch(err => {
            console.error("Error loading seettu orders:", err);
            renderEmpty("Failed to load seettu orders");
        });
}

function renderOrders(orders) {
    const container = document.getElementById("orders");
    if (!container) return;

    container.innerHTML = "";

    if (!orders || orders.length === 0) {
        renderEmpty("No seettu orders found");
        return;
    }

    orders.forEach(order => {
        const card = document.createElement("div");
        card.className = "order-card";

        const header = document.createElement("div");
        header.className = "order-header";

        header.appendChild(createHeaderItem("Seettu ID", order.seettu_id));
        header.appendChild(createHeaderItem("Customer", order.customer_name || "-"));
        header.appendChild(createHeaderItem("Phone", order.customer_phone || "-"));
        header.appendChild(createHeaderItem("ID Number", order.customer_id_number || "-"));
        header.appendChild(createHeaderItem("Address", order.customer_address || "-"));
        header.appendChild(createHeaderItem("Date", formatDate(order.created_at)));

        const total = document.createElement("div");
        total.className = "order-total";
        total.textContent = `Total Amount: Rs ${formatAmount(order.total_amount)}`;

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        ["Product", "Category", "Qty", "Price", "Total"].forEach(text => {
            const th = document.createElement("th");
            th.textContent = text;
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);

        const tbody = document.createElement("tbody");
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach(item => {
            const row = document.createElement("tr");
            row.appendChild(createCell(item.product_name || "-"));
            row.appendChild(createCell(item.category || "-"));
            row.appendChild(createCell(item.quantity));
            row.appendChild(createCell(`Rs ${formatAmount(item.price)}`));
            row.appendChild(createCell(`Rs ${formatAmount(item.total)}`));
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);

        card.appendChild(header);
        card.appendChild(total);
        card.appendChild(table);
        container.appendChild(card);
    });
}

function renderEmpty(message) {
    const container = document.getElementById("orders");
    if (!container) return;

    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = message;

    container.innerHTML = "";
    container.appendChild(empty);
}

function createHeaderItem(label, value) {
    const wrapper = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    const span = document.createElement("span");
    span.textContent = value === null || value === undefined || value === "" ? "-" : String(value);
    wrapper.appendChild(strong);
    wrapper.appendChild(span);
    return wrapper;
}

function createCell(value) {
    const td = document.createElement("td");
    td.textContent = value === null || value === undefined || value === "" ? "-" : String(value);
    return td;
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
}

function formatAmount(value) {
    const amount = Number(value || 0);
    return amount.toFixed(2);
}
