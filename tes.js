let objTagihan = [
    {
        id: 1,
        bulan: 'Januari',
        jumlah_tagihan: 180000,
        sisa_tagihan: 180000
    },
    {
        id: 2,
        bulan: 'Februari',
        jumlah_tagihan: 14000,
        sisa_tagihan: 14000
    },
    {
        id: 3,
        bulan: 'Maret',
        jumlah_tagihan: 36000,
        sisa_tagihan: 36000
    },
]

let jumlah_bayar = 200000
let tanggal_jatuh_tempo = 10
let tanggal_bayar = 11

for (let i = 0; i < objTagihan.length; i++) {
    if (objTagihan[i].jumlah_tagihan <= jumlah_bayar) {
        // console.log(objTagihan[i]);
        jumlah_bayar -= objTagihan[i].jumlah_tagihan
        objTagihan[i].sisa_tagihan = 0
        if (tanggal_bayar > tanggal_jatuh_tempo) {
            objTagihan[i].denda = 10000
        }
    } else {
        // console.log(objTagihan[i]);
        objTagihan[i].sisa_tagihan -= jumlah_bayar
        jumlah_bayar = 0 
        if (tanggal_bayar > tanggal_jatuh_tempo) {
            objTagihan[i].denda = 10000
        }
    }
}

// console.log(objTagihan);
// console.log(jumlah_bayar);

