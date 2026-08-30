import "./LoadingScreen.css";

// Oturum kontrolu (ilk yukleme) surerken tam ekran gosterilir. Ucretsiz
// sunucu barindirma (Render) bir sure hareketsiz kalinca "uyur"; ilk
// istek sunucuyu uyandirdigi icin 30-60 saniye surebilir. Bos/beyaz ekran
// yerine bunu acikca belirten bir mesaj gosterilir.
export default function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-screen-spinner" />
            <p className="loading-screen-title">Yükleniyor...</p>
            <p className="loading-screen-hint">
                Sunucumuz bir süredir kullanılmadıysa uyanıyor olabilir, bu birkaç saniye sürebilir.
            </p>
        </div>
    );
}
