body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

h1 {
    margin-top: 20px;
}

table {
    border-collapse: collapse;
    width: 80%;
    max-width: 800px;
    margin-top: 20px;
    border: 2px solid #000; /* テーブル全体を囲む線を追加 */
}

th, td {
    border: 1px solid #000; /* 各セルを囲む線を追加 */
    padding: 10px;
    text-align: center;
}

th {
    background-color: #f4f4f4;
}

.status-cell {
    cursor: pointer;
}

.status-cell.active {
    background-color: red;
    color: white;
}

.status-cell.inactive {
    background-color: green;
    color: white;
}
