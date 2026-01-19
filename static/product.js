let products = [];

function addProduct() {
    const name = addName.value;
    const price = addPrice.value;
    const qty = addQty.value;

    if (!name || !price || !qty) {
        alert("Fill all fields");
        return;
    }

    products.push({ name, price, qty });
    output.innerText = "Product Added Successfully";

    addName.value = addPrice.value = addQty.value = "";
}

function editProduct() {
    const id = editId.value;

    if (!products[id]) {
        alert("Invalid Product ID");
        return;
    }

    products[id].name = editName.value || products[id].name;
    products[id].price = editPrice.value || products[id].price;
    products[id].qty = editQty.value || products[id].qty;

    output.innerText = "Product Updated Successfully";

    editId.value = editName.value = editPrice.value = editQty.value = "";
}

function deleteProduct() {
    const id = deleteId.value;

    if (!products[id]) {
        alert("Invalid Product ID");
        return;
    }

    products.splice(id, 1);
    output.innerText = "Product Deleted Successfully";

    deleteId.value = "";
}
