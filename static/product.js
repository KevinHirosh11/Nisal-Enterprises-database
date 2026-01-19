async function addProduct() {
    const name = document.getElementById('addName').value;
    const category = document.getElementById('addCategory').value;
    const price = document.getElementById('addPrice').value;
    const quantity = document.getElementById('addQty').value;

    if (!name || !category || !price || !quantity) {
        alert('Please fill all fields!');
        return;
    }

    try {
        const response = await fetch('/api/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_name: name,
                category: category,
                price: parseFloat(price),
                quantity: parseInt(quantity)
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('Product added successfully!');
            // Clear inputs
            document.getElementById('addName').value = '';
            document.getElementById('addCategory').value = '';
            document.getElementById('addPrice').value = '';
            document.getElementById('addQty').value = '';
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        alert('Error adding product: ' + error.message);
    }
}

async function editProduct() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('editName').value;
    const category = document.getElementById('editCategory').value;
    const price = document.getElementById('editPrice').value;
    const quantity = document.getElementById('editQty').value;

    if (!id || !name || !category || !price || !quantity) {
        alert('Please fill all fields!');
        return;
    }

    try {
        const response = await fetch('/api/edit-product', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: parseInt(id),
                product_name: name,
                category: category,
                price: parseFloat(price),
                quantity: parseInt(quantity)
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ Product updated successfully!');
            document.getElementById('editId').value = '';
            document.getElementById('editName').value = '';
            document.getElementById('editCategory').value = '';
            document.getElementById('editPrice').value = '';
            document.getElementById('editQty').value = '';
        } else {
            alert('❌ Error: ' + result.error);
        }
    } catch (error) {
        alert('❌ Error updating product: ' + error.message);
    }
}

async function deleteProduct() {
    const id = document.getElementById('deleteId').value;

    if (!id) {
        alert('Please enter Product ID!');
        return;
    }

    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const response = await fetch(`/api/delete-product/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert('Product deleted successfully!');
            document.getElementById('deleteId').value = '';
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        alert('Error deleting product: ' + error.message);
    }
}