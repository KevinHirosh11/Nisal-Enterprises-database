let products = [];
let seatItems = [];
let grandTotal = 0;
let activeSearchIndex = -1;

window.addEventListener("DOMContentLoaded", () => {
	loadProducts();
});

function loadProducts() {
	fetch("/api/products")
		.then(res => res.json())
		.then(data => {
			products = Array.isArray(data) ? data : [];
			populateProductDropdown();
			setupProductSearch();
		})
		.catch(err => {
			console.error("Error loading products:", err);
			alert("Failed to load products");
		});
}

function populateProductDropdown() {
	const select = document.getElementById("productSelect");
	if (!select) return;

	select.innerHTML = '<option value="">-- Select Product --</option>';

	products.forEach(product => {
		const option = document.createElement("option");
		option.value = product.product_id;
		option.textContent = product.product_name;
		select.appendChild(option);
	});
}

function setupProductSearch() {
	const input = document.getElementById("productSearch");
	const results = document.getElementById("productResults");
	const select = document.getElementById("productSelect");

	if (!input || !results || !select) {
		return;
	}

	const clearResults = () => {
		results.innerHTML = "";
		activeSearchIndex = -1;
	};

	const normalize = (value) => String(value || "").toLowerCase().trim();

	const getMatches = (query) => {
		const q = normalize(query);
		if (!q) {
			return products.slice(0, 12);
		}
		return products
			.filter(p => normalize(p.product_name).includes(q) || normalize(p.category).includes(q))
			.slice(0, 20);
	};

	const renderResults = (items) => {
		results.innerHTML = "";
		activeSearchIndex = -1;

		if (!items || items.length === 0) {
			const empty = document.createElement("div");
			empty.className = "product-result-item";
			empty.textContent = "No products found";
			results.appendChild(empty);
			return;
		}

		items.forEach((p, idx) => {
			const row = document.createElement("div");
			row.className = "product-result-item";
			row.dataset.productId = p.product_id;
			row.dataset.index = String(idx);

			const title = document.createElement("div");
			title.className = "product-result-title";
			title.textContent = p.product_name;

			const meta = document.createElement("div");
			meta.className = "product-result-meta";
			meta.textContent = `${p.category || "-"} | Rs ${p.price} | Stock ${p.quantity}`;

			row.appendChild(title);
			row.appendChild(meta);
			results.appendChild(row);
		});
	};

	const selectProductById = (productId) => {
		if (!productId) return;
		select.value = String(productId);
		const product = products.find(p => String(p.product_id) === String(productId));
		if (product) {
			input.value = product.product_name;
		}
		clearResults();
		populateProductDetails();
	};

	const refresh = () => {
		renderResults(getMatches(input.value));
	};

	input.addEventListener("input", refresh);
	input.addEventListener("focus", refresh);

	input.addEventListener("keydown", (e) => {
		const rows = Array.from(results.querySelectorAll(".product-result-item[data-product-id]"));
		if (e.key === "Escape") {
			clearResults();
			return;
		}
		if (rows.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			activeSearchIndex = Math.min(activeSearchIndex + 1, rows.length - 1);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			activeSearchIndex = Math.max(activeSearchIndex - 1, 0);
		} else if (e.key === "Enter") {
			if (activeSearchIndex >= 0 && activeSearchIndex < rows.length) {
				e.preventDefault();
				selectProductById(rows[activeSearchIndex].dataset.productId);
			}
			return;
		} else {
			return;
		}

		rows.forEach((r, i) => r.classList.toggle("active", i === activeSearchIndex));
		if (activeSearchIndex >= 0 && rows[activeSearchIndex]) {
			rows[activeSearchIndex].scrollIntoView({ block: "nearest" });
		}
	});

	results.addEventListener("click", (e) => {
		const row = e.target.closest(".product-result-item[data-product-id]");
		if (!row) return;
		selectProductById(row.dataset.productId);
	});

	document.addEventListener("click", (e) => {
		if (e.target === input || results.contains(e.target)) {
			return;
		}
		clearResults();
	});
}

function populateProductDetails() {
	const productId = document.getElementById("productSelect").value;

	if (!productId) {
		document.getElementById("productCategory").textContent = "-";
		document.getElementById("productPrice").textContent = "0";
		document.getElementById("productQty").textContent = "0";
		document.getElementById("totalAmount").textContent = "0";
		return;
	}

	const product = products.find(p => String(p.product_id) === String(productId));
	if (product) {
		document.getElementById("productCategory").textContent = product.category || "-";
		document.getElementById("productPrice").textContent = Number(product.price || 0).toFixed(2);
		document.getElementById("productQty").textContent = product.quantity;
		calculateTotal();
	}
}

function calculateTotal() {
	const productId = document.getElementById("productSelect").value;
	if (!productId) {
		document.getElementById("totalAmount").textContent = "0";
		return;
	}

	const product = products.find(p => String(p.product_id) === String(productId));
	const quantity = Number(document.getElementById("quantity").value) || 0;

	if (product) {
		const price = Number(product.price || 0);
		const total = price * quantity;
		document.getElementById("totalAmount").textContent = total.toFixed(2);
	}
}

function addToSeat() {
	const productId = document.getElementById("productSelect").value;
	if (!productId) {
		alert("Please select a product");
		return;
	}

	const product = products.find(p => String(p.product_id) === String(productId));
	const quantity = Number(document.getElementById("quantity").value) || 0;

	if (!product) {
		alert("Product not found");
		return;
	}

	if (quantity <= 0) {
		alert("Please enter a valid quantity");
		return;
	}

	if (quantity > Number(product.quantity)) {
		alert(`Only ${product.quantity} units available in stock`);
		return;
	}

	const price = Number(product.price || 0);
	const total = price * quantity;

	const existingItem = seatItems.find(item => String(item.product_id) === String(productId));
	if (existingItem) {
		existingItem.qty += quantity;
		existingItem.total = existingItem.qty * price;
	} else {
		seatItems.push({
			product_id: productId,
			name: product.product_name,
			category: product.category || "-",
			price: price,
			qty: quantity,
			total: total
		});
	}

	updateSeatTable();
	resetProductForm();
}

function updateSeatTable() {
	const tbody = document.getElementById("seatTable");
	if (!tbody) return;

	tbody.innerHTML = "";
	grandTotal = 0;

	seatItems.forEach(item => {
		const row = tbody.insertRow();
		row.innerHTML = `
			<td>${item.name}</td>
			<td>${item.category}</td>
			<td>Rs ${item.price.toFixed(2)}</td>
			<td>${item.qty}</td>
			<td>Rs ${item.total.toFixed(2)}</td>
		`;
		grandTotal += item.total;
	});

	document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
}

function resetProductForm() {
	document.getElementById("productSelect").value = "";
	const searchInput = document.getElementById("productSearch");
	if (searchInput) searchInput.value = "";
	const results = document.getElementById("productResults");
	if (results) results.innerHTML = "";
	document.getElementById("quantity").value = "1";
	document.getElementById("productCategory").textContent = "-";
	document.getElementById("productPrice").textContent = "0";
	document.getElementById("productQty").textContent = "0";
	document.getElementById("totalAmount").textContent = "0";
}

function clearSeatForm() {
	seatItems = [];
	updateSeatTable();
	resetProductForm();

	const customerFields = [
		"billCustomerName",
		"billCustomerPhone",
		"billCustomerID",
		"billCustomerAddress"
	];

	customerFields.forEach(id => {
		const input = document.getElementById(id);
		if (input) input.value = "";
	});
}

function saveSeettu() {
	if (seatItems.length === 0) {
		alert("Please add at least one product");
		return;
	}

	const payload = {
		customerName: document.getElementById("billCustomerName").value.trim(),
		customerPhone: document.getElementById("billCustomerPhone").value.trim(),
		customerIdNumber: document.getElementById("billCustomerID").value.trim(),
		customerAddress: document.getElementById("billCustomerAddress").value.trim(),
		totalAmount: Number(grandTotal.toFixed(2)),
		items: seatItems.map(item => ({
			product_id: item.product_id,
			qty: item.qty,
			price: item.price,
			total: item.total
		}))
	};

	fetch("/api/seettu", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload)
	})
		.then(res => res.json())
		.then(data => {
			if (!data || data.error) {
				alert(data && data.error ? data.error : "Failed to save seettu details");
				return;
			}
			alert(`Seettu saved successfully. ID: ${data.seettu_id}`);
			clearSeatForm();
		})
		.catch(err => {
			console.error("Error saving seettu:", err);
			alert("Failed to save seettu details");
		});
}
