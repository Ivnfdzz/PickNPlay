document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('backButton');
    
    backButton.addEventListener('click', function (e) {
        e.preventDefault();
        location.assign('/frontend/html/index.html');
    });
});