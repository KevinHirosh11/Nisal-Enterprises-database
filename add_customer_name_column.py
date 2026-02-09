import mysql.connector

try:
    conn = mysql.connector.connect(
        host='127.0.0.1',
        user='root',
        password='',
        database='nisal_db'
    )
    cursor = conn.cursor()
    
    try:
        cursor.execute('ALTER TABLE bills ADD COLUMN customer_name varchar(255) DEFAULT NULL AFTER customer_id')
        conn.commit()
        print('✓ Successfully added customer_name column to bills table')
    except mysql.connector.Error as e:
        if "Duplicate column name" in str(e):
            print('✓ Column customer_name already exists')
        else:
            print(f'Error: {e}')
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f'Connection error: {e}')
