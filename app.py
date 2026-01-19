from flask import Flask, render_template,redirect,url_for, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

# Database file path
DATABASE_FILE = "bills_database.json"

def load_database():
    """Load bills from JSON file"""
    if os.path.exists(DATABASE_FILE):
        with open(DATABASE_FILE, 'r') as f:
            return json.load(f)
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

@app.route("/product")
def product():
    return render_template("product.html")

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
