
async function loadDashboard() {
    try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        
        document.getElementById('products').textContent = data.products || 0;
        document.getElementById('in_stock').textContent = data.in_stock || 0;
        document.getElementById('low_stock').textContent = data.low_stock || 0;
        document.getElementById('out_of_stock').textContent = data.out_of_stock || 0;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        
        if (!response.ok) {
            console.error('API error:', response.status, response.statusText);
            return;
        }
        
        const products = await response.json();
        console.log('Products received:', products);
        
        const tableBody = document.querySelector('table');
        
        if (!tableBody) {
            console.error('Table not found!');
            return;
        }
        
        while (tableBody.rows.length > 1) {
            tableBody.deleteRow(1);
        }
        
        if (!products || products.length === 0) {
            console.warn('No products in database');
            return;
        }
        
        products.forEach(product => {
            const row = tableBody.insertRow();
            console.log('Adding product:', product);
            row.innerHTML = `
                <td>${product.product_id || 'N/A'}</td>
                <td>${product.product_name || 'N/A'}</td>
                <td>${product.category || 'N/A'}</td>
                <td>${product.quantity || 0}</td>
                <td>Rs ${Number(product.price || 0).toFixed(2)}</td>
                <td class="${product.status === 'Out' ? 'out' : product.status === 'Low' ? 'low' : 'ok'}">${product.status || 'N/A'}</td>
            `;
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function searchProducts() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const table = document.querySelector('table');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td');
        let found = false;
        
        for (let j = 0; j < td.length; j++) {
            if (td[j]) {
                const txtValue = td[j].textContent || td[j].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
        }
        
        tr[i].style.display = found ? '' : 'none';
    }
}

function logout() {
    window.location.href = '/logout';
}

window.onload = function() {
    loadDashboard();
    loadProducts();
};