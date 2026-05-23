const QRCode = require('qrcode');

async function generarQR(texto) {
  return QRCode.toDataURL(texto, {
    errorCorrectionLevel: 'M',
    width: 320,
    margin: 2,
    color: { dark: '#1e293b', light: '#ffffff' },
  });
}

module.exports = { generarQR };
