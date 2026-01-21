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

@app.route("/api/view", methods=["GET"])
def get_products():
    

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products")
        products = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify(products)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

@app.route("/low_stock")
def low_stock():
    return render_template("low_stock.html")
    
@app.route("/api/low_stock", methods=["GET"])
def stock_status():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM products WHERE quantity BETWEEN 1 AND 10"
        )
        low_stock = cursor.fetchall()

        cursor.execute(
            "SELECT * FROM products WHERE quantity = 0"
        )
        out_stock = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "low_stock": low_stock,
            "out_stock": out_stock
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/report")
def report():
    return render_template("report.html")

@app.route("/bill")
def bill_page():
    return render_template("bill.html")

@app.route("/api/bill", methods=["POST"])
def save_bill():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = None
    try:
        cursor = conn.cursor()

        data = request.get_json(force=True)

        grand_total = float(data.get("grandTotal", 0))
        paid_amount = float(data.get("paidAmount", 0))
        balance = float(data.get("balance", 0))
        payment_type = data.get("paymentType", "UNKNOWN")
        items = data.get("items", [])

        if not items:
            return jsonify({"error": "No bill items provided"}), 400

        cursor.execute(
            """
            INSERT INTO bills (total_amount, paid_amount, balance)
            VALUES (%s,%s,%s)
            """,
            (grand_total, paid_amount, balance)
        )

        bill_id = cursor.lastrowid 

        # Save items & update stock
        for item in items:
            product_id = item.get("product_id")
            qty = int(item.get("qty", 0))
            price = float(item.get("price", 0))
            discount = float(item.get("discount", 0))
            total = float(item.get("total", 0))

            if not product_id or qty <= 0:
                return jsonify({"error": "Invalid item data"}), 400

            cursor.execute(
                """
                INSERT INTO bill_items (bill_id, product_id, quantity, price, discount, total)
                VALUES (%s,%s,%s,%s,%s,%s)
                """,
                (bill_id, product_id, qty, price, discount, total)
            )

            cursor.execute(
                """
                UPDATE products
                SET quantity = quantity - %s
                WHERE product_id = %s
                """,
                (qty, product_id)
            )

        conn.commit()

        return jsonify({"success": True, "bill_id": bill_id})

    except mysql.connector.Error as err:
        if conn:
            conn.rollback()
        return jsonify({"error": str(err)}), 500
    except Exception as err:  
        if conn:
            conn.rollback()
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


@app.route("/api/installment", methods=["POST"])
def save_installment():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = None
    try:
        cursor = conn.cursor()

        data = request.get_json(force=True)
        bill_id = data.get("bill_id")
        customer_name = data.get("customer_name")
        customer_phone = data.get("customer_phone")
        initial_payment = float(data.get("initial_payment", 0))
        installment_count = int(data.get("installment_count", 1))
        per_installment = float(data.get("per_installment", 0))
        total_amount = float(data.get("total_amount", 0))
        remaining_amount = total_amount - initial_payment

        if not bill_id or not customer_name:
            return jsonify({"error": "Bill ID and Customer Name required"}), 400

        # Create installment record (matching actual table structure)
        cursor.execute(
            """
            INSERT INTO installments (bill_id, customer_name, phone, initial_payment, remaining_amount, installment_count, per_installment)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            """,
            (bill_id, customer_name, customer_phone, initial_payment, remaining_amount, installment_count, per_installment)
        )

        installment_id = cursor.lastrowid

        # Create installment schedule
        for i in range(1, installment_count + 1):
            due_date = datetime.now().strftime('%Y-%m-%d')
            cursor.execute(
                """
                INSERT INTO installment_schedule (installment_id, installment_no, amount, due_date, paid)
                VALUES (%s,%s,%s,%s,%s)
                """,
                (installment_id, i, per_installment, due_date, 0)
            )

        conn.commit()

        return jsonify({"success": True, "installment_id": installment_id})

    except mysql.connector.Error as err:
        if conn:
            conn.rollback()
        return jsonify({"error": str(err)}), 500
    except Exception as err:
        if conn:
            conn.rollback()
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


@app.route("/logout")
def logout():
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)