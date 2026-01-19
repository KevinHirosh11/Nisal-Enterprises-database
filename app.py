from flask import Flask, render_template,redirect,url_for, request, jsonify
import json
import os
import mysql.connector
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)


def get_db_connection():
    try:
        return mysql.connector.connect(
            host="localhost",
            user="root",
            password="", 
            database="nisal_db"
        )
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

DATABASE_FILE = "bills_database.json"

def load_database():
    """Load bills from JSON file"""
    if os.path.exists(DATABASE_FILE):
        try:
            with open(DATABASE_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {"bills": [], "installments": []}
    return {"bills": [], "installments": []}

def save_database(data):
    """Save bills to JSON file"""
    with open(DATABASE_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route("/")
def login():
    return render_template("login.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/api/dashboard")
def api_dashboard():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM products")
        total_products = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM products WHERE quantity > 10")
        in_stock = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM products WHERE quantity > 0 AND quantity <= 10")
        low_stock = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM products WHERE quantity = 0")
        out_of_stock = cursor.fetchone()[0]

        cursor.close()
        conn.close()

        return jsonify({
            "products": total_products,
            "in_stock": in_stock,
            "low_stock": low_stock,
            "out_of_stock": out_of_stock
        })
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()
            

@app.route("/product")
def product():
    return render_template("product.html")

@app.route("/api/products")
def api_products():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products ORDER BY product_id")
        products = cursor.fetchall()
        
        for product in products:
            qty = product.get('quantity', 0)
            if qty == 0:
                product['status'] = 'Out'
            elif qty <= 10:
                product['status'] = 'Low'
            else:
                product['status'] = 'In Stock'
        
        cursor.close()
        conn.close()
        
        return jsonify(products)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route("/api/add-product", methods=["POST"])
def add_product():
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "error": "Database connection failed"}), 500
    
    try:
        data = request.get_json()
        cursor = conn.cursor()
        
        query = "INSERT INTO products (product_name, category, price, quantity) VALUES (%s, %s, %s, %s)"
        values = (data['product_name'], data['category'], data['price'], data['quantity'])
        
        cursor.execute(query, values)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Product added successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"success": False, "error": str(err)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route("/api/edit-product", methods=["PUT"])
def edit_product():
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "error": "Database connection failed"}), 500

    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "No JSON data received"}), 400

        required_fields = ["product_id", "product_name", "category", "price", "quantity"]
        if not all(field in data for field in required_fields):
            return jsonify({"success": False, "error": "Missing required fields"}), 400

        cursor = conn.cursor()

        query = """
            UPDATE products
            SET product_name = %s,
                category = %s,
                price = %s,
                quantity = %s
            WHERE product_id = %s
        """

        values = (
            data["product_name"],
            data["category"],
            float(data["price"]),
            int(data["quantity"]),
            int(data["product_id"])
        )

        cursor.execute(query, values)
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "error": "Product not found"}), 404

        return jsonify({"success": True, "message": "Product updated successfully"})

    except ValueError:
        return jsonify({"success": False, "error": "Invalid data type"}), 400

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route("/api/delete-product/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"success": False, "error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM products WHERE product_id=%s", (product_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"success": False, "error": "Product not found"}), 404
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Product deleted successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"success": False, "error": str(err)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route("/view")
def view():
    return render_template("view.html")

@app.route("/low_stock")
def low_stock():
    return render_template("low_stock.html")

@app.route("/report")
def report():
    return render_template("report.html")

@app.route("/bill")
def bill():
    return render_template("bill.html")

@app.route("/api/save-bill", methods=["POST"])
def save_bill():
    """API endpoint to save bill to database"""
    try:
        bill_data = request.get_json()
        
        # Generate bill ID
        bill_id = f"BILL-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Add bill ID and timestamp
        bill_data["billId"] = bill_id
        bill_data["savedAt"] = datetime.now().isoformat()
        
        # Load existing database
        db = load_database()
        
        # Add new bill
        db["bills"].append(bill_data)
        
        # Save to file
        save_database(db)
        
        return jsonify({"success": True, "billId": bill_id}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/get-bill/<bill_id>", methods=["GET"])
def get_bill(bill_id):
    """API endpoint to retrieve bill by ID"""
    try:
        db = load_database()
        bill = next((b for b in db["bills"] if b["billId"] == bill_id), None)
        
        if bill:
            return jsonify({"success": True, "bill": bill}), 200
        else:
            return jsonify({"success": False, "error": "Bill not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/logout")
def logout():
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)