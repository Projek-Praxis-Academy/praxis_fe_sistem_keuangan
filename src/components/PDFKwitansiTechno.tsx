// components/PDFKwitansiTechno.tsx
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
    color: '#1a365d', // Warna biru techno
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 2,
    color: '#2d3748', // Warna abu-abu gelap
  },
  divider: {
    height: 1,
    backgroundColor: '#1a365d', // Warna biru techno
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
    color: '#1a365d', // Warna biru techno
  },
  value: {
    width: '60%',
    fontSize: 9,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#1a365d', // Warna biru techno
    marginTop: 10,
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1a365d', // Warna biru techno
  },
  tableHeader: {
    backgroundColor: '#ebf4ff', // Biru muda
    fontWeight: 'bold',
  },
  cell: {
    padding: 5,
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#1a365d', // Warna biru techno
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
    backgroundColor: '#ebf4ff', // Biru muda
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
    borderTopColor: '#1a365d', // Warna biru techno
    width: 150,
    textAlign: 'center',
    paddingTop: 3,
    fontSize: 9,
  },
  technoBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1a365d',
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

interface KwitansiTechnoData {
  namaSiswa: string;
  nisn: string;
  level: string;
  akademik: string;
  tanggalPembayaran: string;
  pembayaran: {
    kbm: number;
    spp: number;
    pemeliharaan: number;
    sumbangan: number;
    total: number;
  };
  catatan?: string;
}

export default function PDFKwitansiTechno({ data }: { data: KwitansiTechnoData }) {
  const items = [
    { label: 'KBM', value: data.pembayaran.kbm },
    { label: 'SPP', value: data.pembayaran.spp },
    { label: 'Pemeliharaan', value: data.pembayaran.pemeliharaan },
    { label: 'Sumbangan', value: data.pembayaran.sumbangan },
  ];

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Header dengan logo di kiri dan teks di kanan */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Image src="/logo-technonatura.png" style={styles.logo} />
          </View>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>KWITANSI PEMBAYARAN TECHNONATURA</Text>
            <Text style={styles.subtitle}>TechnoNatura School</Text>
            <Text style={styles.subtitle}>
              Jl. Contoh No. 123, Jakarta - Indonesia
            </Text>
            <Text style={styles.subtitle}>Telp: (021) 123-4567</Text>
          </View>
        </View>

        {/* Badge TechnoNatura */}
        <View style={styles.technoBadge}>
          <Text>TechnoNatura</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.grid}>
            <Text style={styles.label}>Nomor Kwitansi</Text>
            <Text style={styles.value}>TN/{format(new Date(), 'yyyyMMdd')}/001</Text>
          </View>
          <View style={styles.grid}>
            <Text style={styles.label}>Tanggal Pembayaran</Text>
            <Text style={styles.value}>{formatDate(data.tanggalPembayaran)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 3, fontSize: 9, color: '#1a365d' }}>
            Data Siswa
          </Text>
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

        <Text style={{ fontWeight: 'bold', marginTop: 5, fontSize: 9, color: '#1a365d' }}>
          Rincian Pembayaran
        </Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cell, styles.cell1]}>Jenis Pembayaran</Text>
            <Text style={[styles.cell, styles.cell2]}>Jumlah</Text>
          </View>
          
          {items.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.cell, styles.cell1]}>{item.label}</Text>
              <Text style={[styles.cell, styles.cell2]}>
                {item.value > 0 ? formatRupiah(item.value) : '-'}
              </Text>
            </View>
          ))}
          
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.cell, styles.cell1, { fontWeight: 'bold' }]}>
              TOTAL
            </Text>
            <Text style={[styles.cell, styles.cell2, { fontWeight: 'bold' }]}>
              {formatRupiah(data.pembayaran.total)}
            </Text>
          </View>
        </View>

        {data.catatan && (
          <View style={styles.section}>
            <Text style={{ fontWeight: 'bold', marginBottom: 3, fontSize: 9, color: '#1a365d' }}>
              Catatan:
            </Text>
            <Text style={{ fontSize: 9 }}>{data.catatan}</Text>
          </View>
        )}

        <View style={styles.signature}>
          <View>
            <Text style={{ fontSize: 9 }}>Jakarta, {formatDate(new Date().toISOString())}</Text>
            <Text style={{ fontSize: 9 }}>Penerima,</Text>
            <View style={styles.signatureLine}>
              <Text>(__________________________)</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Kwitansi ini sah tanpa tanda tangan dan cap</Text>
          <Text>Terima kasih telah melakukan pembayaran</Text>
        </View>
      </Page>
    </Document>
  );
}