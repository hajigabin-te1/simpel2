import nodemail from 'nodemailer';

const buatTrasporter = () =>  nodemail.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true untuk port 465, false untuk port lainnya
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const kirimNotifikasiEmail = async (to, subject, text) => {

    if (process.env.NODE_ENV === 'development') {
        console.log(`Simulasi pengiriman email ke ${to} dengan subject "${subject}" dan isi "${text}"`);
        return;
    } 

    try {
        const transporter = buatTrasporter();
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log(`Email berhasil dikirim ke ${to} dengan subject "${subject}"`);
    } catch (error) {
        console.error('Error sending email:', error);
    }

}

// Template email untuk notifikasi tiket baru
export const templateEmailNotifikasi = (namaUser, namaLayanan, nomorTiket, status, pesan) => {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #66FFA3; border-radius: 5px; overflow: hidden;">
<div style="background-color: #2ba648; padding: 24px; color: #252626; text-align: center;">
<h2 style="margin: 0;">Sistem Pelayanan Terpadu</h2>
</div>
<div style="padding: 20px;">
<h3>Update Layanan Anda</h3>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
<tbody>
<tr>
<td style="padding: 8px; color: #888a86;">Nomor Tiket</td>
<td style="padding: 8px;"><strong>${nomorTiket}</strong></td>
</tr>
<tr>
<td style="padding: 8px; color: #888a86;">Nama Layanan</td>
<td style="padding: 8px;">${namaLayanan}</td>
</tr>
<tr>
<td style="padding: 8px; color: #888a86;">Status</td>
<td style="padding: 8px;">${status.toUpperCase()}</td>
</tr>
</tbody>
</table>
</div>
<p><em>${pesan}</em></p>
<p>Terima kasih telah menggunakan layanan kami, ${namaUser}.</p>
<p>Mohon agar tidak membalas pesan ini.</p>
<div style="background-color: #2ba648; padding: 16px; color: #dadbd7; text-align: center; font-size: 12px;">&copy; 2024 Sistem Pelayanan Terpadu. All rights reserved.</div>
</div>`;
}




