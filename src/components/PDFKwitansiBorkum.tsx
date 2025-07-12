// components/PDFKwitansiBorkum.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.3,
    color: '#333'
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  logoContainer: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerTextContainer: {
    width: '75%',
    paddingLeft: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#00000', // Warna biru tua
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 2,
    color: '#374151', // Warna abu-abu gelap
  },
  divider: {
    height: 1,
    backgroundColor: '#00000', // Warna biru tua
    marginVertical: 10,
  },
  section: {
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
    fontSize: 9,
    color: '#00000', // Warna biru tua
  },
  value: {
    width: '60%',
    fontSize: 9,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#00000', // Warna biru tua
    marginTop: 10,
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#00000', // Warna biru tua
  },
  tableHeader: {
    backgroundColor: '#dbeafe', // Biru muda
    fontWeight: 'bold',
  },
  cell: {
    padding: 5,
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#00000', // Warna biru tua
    fontSize: 8,
  },
  cell1: {
    flex: 2,
  },
  cell2: {
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe', // Biru muda
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    paddingHorizontal: 20,
  },
  signature: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#00000', // Warna biru tua
    width: 150,
    textAlign: 'center',
    paddingTop: 3,
    fontSize: 9,
  },
  boardingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#00000',
    color: 'white',
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 8,
    borderRadius: 3,
  }
});

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  try {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return format(date, 'dd MMMM yyyy', { locale: id });
  } catch {
    return '-';
  }
};

interface KwitansiBorkumData {
  namaSiswa: string;
  nisn: string;
  level: string;
  akademik: string;
  tanggalPembayaran: string;
  pembayaran: {
    boarding: number;
    konsumsi: number;
    total: number;
  };
  catatan?: string;
}

export default function PDFKwitansiBorkum({ data }: { data: KwitansiBorkumData }) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Header: logo kiri, teks tengah */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Image src="/logo.png" style={{ width: 50, height: 50, marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>KWITANSI PEMBAYARAN</Text>
            <Text style={styles.subtitle}>PRAXIS ACADEMY</Text>
            <Text style={styles.subtitle}>Jl. Contoh No. 123, Jakarta - Indonesia</Text>
            <Text style={styles.subtitle}>Telp: (021) 123-4567</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Nomor & tanggal kwitansi */}
        <View style={styles.section}>
          <View style={styles.grid}>
            <Text style={styles.label}>Nomor Kwitansi</Text>
            <Text style={styles.value}>BK/{format(new Date(), 'yyyyMMdd')}/001</Text>
          </View>
          <View style={styles.grid}>
            <Text style={styles.label}>Tanggal Pembayaran</Text>
            <Text style={styles.value}>{formatDate(data.tanggalPembayaran)}</Text>
          </View>
        </View>

        {/* Data siswa */}
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 3, fontSize: 9, color: '#00000' }}>Data Siswa</Text>
          <View style={styles.grid}>
            <Text style={styles.label}>Nama Siswa</Text>
            <Text style={styles.value}>{data.namaSiswa || '-'}</Text>
          </View>
          <View style={styles.grid}>
            <Text style={styles.label}>NISN</Text>
            <Text style={styles.value}>{data.nisn || '-'}</Text>
          </View>
          <View style={styles.grid}>
            <Text style={styles.label}>Level</Text>
            <Text style={styles.value}>{data.level || '-'}</Text>
          </View>
          <View style={styles.grid}>
            <Text style={styles.label}>Kelas</Text>
            <Text style={styles.value}>{data.akademik || '-'}</Text>
          </View>
        </View>

        {/* Tabel pembayaran */}
        <Text style={{ fontWeight: 'bold', marginTop: 5, fontSize: 9, color: '#00000' }}>Rincian Pembayaran</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cell, styles.cell1]}>Jenis Pembayaran</Text>
            <Text style={[styles.cell, styles.cell2]}>Jumlah</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.cell, styles.cell1]}>Boarding</Text>
            <Text style={[styles.cell, styles.cell2]}>
              {formatRupiah(data.pembayaran.boarding)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.cell, styles.cell1]}>Konsumsi</Text>
            <Text style={[styles.cell, styles.cell2]}>
              {formatRupiah(data.pembayaran.konsumsi)}
            </Text>
          </View>
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.cell, styles.cell1, { fontWeight: 'bold' }]}>TOTAL</Text>
            <Text style={[styles.cell, styles.cell2, { fontWeight: 'bold' }]}>
              {formatRupiah(data.pembayaran.total)}
            </Text>
          </View>
        </View>

        {/* Catatan */}
        {data.catatan && (
          <View style={styles.section}>
            <Text style={{ fontWeight: 'bold', marginBottom: 3, fontSize: 9, color: '#00000' }}>Catatan:</Text>
            <Text style={{ fontSize: 9 }}>{data.catatan}</Text>
          </View>
        )}

        {/* Tanda tangan */}
        <View style={styles.signature}>
          <View>
            <Text style={{ fontSize: 9 }}>Jakarta, {formatDate(new Date().toISOString())}</Text>
            <Text style={{ fontSize: 9 }}>Penerima,</Text>
            <View style={styles.signatureLine}>
              <Text>(__________________________)</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Kwitansi ini sah tanpa tanda tangan dan cap</Text>
          <Text>Terima kasih telah melakukan pembayaran</Text>
        </View>
      </Page>
    </Document>
  );
}