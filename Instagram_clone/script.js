const toggleButton = document.getElementById('toggle-button');
const body = document.body;

// Sayfa yüklendiğinde tema ayarını kontrol et
window.onload = () => {
    const theme = localStorage.getItem('theme');
    if (theme) {
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(theme);
        toggleButton.textContent = theme === 'dark-mode' ? 'Aydınlık Modu Aç' : 'Karanlık Modu Aç';
    }
};

// Butona tıklandığında tema değiştir
toggleButton.addEventListener('click', () => {
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        toggleButton.textContent = 'Aydınlık Modu Aç';
        localStorage.setItem('theme', 'dark-mode'); // Tema ayarını kaydet
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        toggleButton.textContent = 'Karanlık Modu Aç';
        localStorage.setItem('theme', 'light-mode'); // Tema ayarını kaydet
    }
});
