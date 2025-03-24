document.addEventListener('DOMContentLoaded', () => {
    const statusCells = document.querySelectorAll('.status-cell');

    statusCells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (cell.classList.contains('active')) {
                cell.classList.remove('active');
                cell.classList.add('inactive');
                cell.textContent = '待機中';
            } else {
                cell.classList.remove('inactive');
                cell.classList.add('active');
                cell.textContent = '出動中';
            }
        });
    });
});
