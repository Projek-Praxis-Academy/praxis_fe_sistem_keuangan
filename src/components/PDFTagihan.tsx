// components/PDFTagihan.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  line: {
    height: 2,
    backgroundColor: '#000',
    marginBottom: 10,
    marginTop: 4,
  },
  subtext: {
    fontSize: 10,
    marginBottom: 12,
    textAlign: 'justify',
  },
  section: {
    marginBottom: 14,
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCol: {
    width: '50%',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  cell: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  cellRight: {
    textAlign: 'right',
  },
});

const formatRupiah = (val: number | string) =>
  'Rp ' + (parseInt(val as string) || 0).toLocaleString('id-ID');

export default function PDFTagihan({
  data,
}: {
  data: {
    namaSiswa: string;
    nisn: string;
    level: string;
    akademik: string;
    semester: string;
    periode: string;
    tanggal: string;
    jatuhTempo: string;
    tunggakan: string;
    catatan: string;
    inputTagihan: any;
    totalTagihan: any;
  };
}) {
  const tagihanPokok = [
    { key: 'kbm', label: 'KBM' },
    { key: 'spp', label: 'SPP' },
    { key: 'pemeliharaan', label: 'Pemeliharaan' },
    { key: 'sumbangan', label: 'Sumbangan' },
  ];
  const tagihanBulanan = [
    { key: 'konsumsi', label: 'Konsumsi' },
    { key: 'boarding', label: 'Boarding' },
    { key: 'ekstra', label: 'Ekstrakurikuler' },
    { key: 'uang_belanja', label: 'Uang Belanja' },
  ];
  const sisaTagihan = [...tagihanPokok, ...tagihanBulanan].map(({ key, label }) => ({
    label,
    jumlah: data.totalTagihan[key] - parseInt(data.inputTagihan[key] || '0'),
  }));

  const renderTable = (items: { key: string; label: string }[]) => (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={styles.cell}>Jenis</Text>
        <Text style={[styles.cell, styles.cellRight]}>Jumlah</Text>
      </View>
      {items.map(({ key, label }, i) => (
        <View style={styles.tableRow} key={i}>
          <Text style={styles.cell}>{label}</Text>
          <Text style={[styles.cell, styles.cellRight]}>
            {formatRupiah(data.inputTagihan[key])}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderSisaTagihan = () => (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={styles.cell}>Jenis</Text>
        <Text style={[styles.cell, styles.cellRight]}>Jumlah</Text>
      </View>
      {sisaTagihan.map((item, i) => (
        <View style={styles.tableRow} key={i}>
          <Text style={styles.cell}>{item.label}</Text>
          <Text style={[styles.cell, styles.cellRight]}>{formatRupiah(item.jumlah)}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Image src="/logo.png" style={styles.logo} />
          <Text style={styles.headerText}>Praxis Academy</Text>
        </View>
        <View style={styles.line} />

        <Text style={styles.subtext}>
          Yth. Bapak/Ibu Wali Murid,{'\n'}Dengan hormat,{'\n'}Mohon untuk melakukan pembayaran sesuai dengan nominal yang tertera dalam rincian tagihan di bawah ini. Kami mengimbau agar pembayaran dapat dilakukan sebelum tanggal jatuh tempo guna menghindari keterlambatan dan memastikan kelancaran administrasi keuangan sekolah. Pembayaran ini ditujukan untuk siswa dengan nama berikut:
        </Text>

        <View style={[styles.section, styles.grid]}>
          <Text style={styles.gridCol}>
            <Text style={styles.bold}>Nama:</Text> {data.namaSiswa}
          </Text>
          <Text style={styles.gridCol}>
            <Text style={styles.bold}>NISN:</Text> {data.nisn}
          </Text>
          <Text style={styles.gridCol}>
            <Text style={styles.bold}>Kelas:</Text> {data.level}
          </Text>
          <Text style={styles.gridCol}>
            <Text style={styles.bold}>Semester:</Text> {data.semester}
          </Text>
          <Text style={styles.gridCol}>
            <Text style={styles.bold}>Periode:</Text> {data.periode}
          </Text>
          <Text style={styles.gridCol}>
            <Text style={styles.bold}>Akademik:</Text> {data.akademik}
          </Text>
          <Text style={styles.gridCol}>
            <Text style={styles.bold}>Tanggal Tagihan:</Text> {data.tanggal}
          </Text>
          <Text style={styles.gridCol}>
            <Text style={styles.bold}>Jatuh Tempo:</Text> {data.jatuhTempo}
          </Text>
        </View>

        <Text style={styles.bold}>Tunggakan Tahun Ajaran Sebelumnya</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.cell}>Tahun Ajaran</Text>
            <Text style={[styles.cell, styles.cellRight]}>Jumlah</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cell}>2023/2024</Text>
            <Text style={[styles.cell, styles.cellRight]}>{formatRupiah(data.tunggakan)}</Text>
          </View>
        </View>

        <Text style={styles.bold}>Tagihan Pokok</Text>
        {renderTable(tagihanPokok)}

        <Text style={styles.bold}>Tagihan Bulanan</Text>
        {renderTable(tagihanBulanan)}

        <View break>
          <Text style={styles.bold}>Sisa Tagihan</Text>
          {renderSisaTagihan()}
          </View>
          
        {data.catatan && (
          <View style={styles.section}>
            <Text>
              <Text style={styles.bold}>Catatan:</Text> {data.catatan}
            </Text>
          </View>
        )}

        <Text style={styles.subtext}>
          Demikian bukti tagihan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
        </Text>
      </Page>
    </Document>
  );
}
