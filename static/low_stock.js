async function loadStockData() {
    try {
        const res = await fetch("/api/low_stock");
        const data = await res.json();

        const lowTable = document.getElementById("lowStockTable");
        const outTable = document.getElementById("outStockTable");

        lowTable.innerHTML = "";
        outTable.innerHTML = "";

        document.getElementById("lowStockCount").innerText = data.low_stock.length;
        document.getElementById("outStockCount").innerText = data.out_stock.length;

        data.low_stock.forEach(p => {
            lowTable.innerHTML += `
                <tr>
                    <td>${p.product_id}</td>
                    <td>${p.product_name}</td>
                    <td>${p.category}</td>
                    <td>${p.quantity}</td>
                    <td style="color:orange;font-weight:bold;">Low Stock</td>
                </tr>
            `;
        });

        data.out_stock.forEach(p => {
            outTable.innerHTML += `
                <tr>
                    <td>${p.product_id}</td>
                    <td>${p.product_name}</td>
                    <td>${p.category}</td>
                    <td>${p.quantity}</td>
                    <td style="color:red;font-weight:bold;">Out of Stock</td>
                </tr>
            `;
        });

    } catch (err) {
        alert("Error loading stock data");
        console.error(err);
    }
}

window.onload = loadStockData;
