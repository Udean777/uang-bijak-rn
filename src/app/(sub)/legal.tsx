import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppText } from "@/src/components/atoms/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";

const PRIVACY_POLICY = `
Kebijakan Privasi Uang Bijak

Terakhir diperbarui: ${new Date().toLocaleDateString("id-ID")}

1. Informasi yang Kami Kumpulkan

Uang Bijak mengumpulkan informasi berikut untuk menyediakan layanan pengelolaan keuangan pribadi:

• Informasi Akun: Email, nama, dan foto profil (jika menggunakan Google Sign-In)
• Data Keuangan: Transaksi, saldo dompet, tagihan, utang, dan wishlist yang Anda masukkan
• Data Perangkat: Informasi teknis untuk debugging dan peningkatan layanan

2. Bagaimana Kami Menggunakan Informasi

Data Anda digunakan untuk:
• Menyimpan dan menampilkan catatan keuangan Anda
• Menghitung analisis pengeluaran dan safe-to-spend
• Mengirim pengingat tagihan (jika diaktifkan)
• Meningkatkan kualitas aplikasi

3. Keamanan Data

• Semua data disimpan terenkripsi di Firebase (Google Cloud)
• Autentikasi menggunakan Firebase Authentication
• PIN dan biometrik melindungi akses ke aplikasi
• Kami tidak menjual data Anda kepada pihak ketiga

4. Penyimpanan Data

Data Anda disimpan selama akun Anda aktif. Anda dapat menghapus akun dan semua data terkait kapan saja melalui menu pengaturan.

5. Hak Anda

Anda berhak untuk:
• Mengakses data Anda
• Mengekspor data Anda
• Menghapus akun dan semua data

6. Perubahan Kebijakan

Kami dapat memperbarui kebijakan ini. Perubahan signifikan akan diberitahukan melalui aplikasi.

7. Kontak

Untuk pertanyaan tentang privasi, hubungi: privacy@uangbijak.app
`;

const TERMS_OF_SERVICE = `
Syarat dan Ketentuan Uang Bijak

Terakhir diperbarui: ${new Date().toLocaleDateString("id-ID")}

1. Penerimaan Syarat

Dengan menggunakan Uang Bijak, Anda menyetujui syarat dan ketentuan ini.

2. Deskripsi Layanan

Uang Bijak adalah aplikasi pengelolaan keuangan pribadi yang membantu Anda:
• Mencatat pemasukan dan pengeluaran
• Mengelola berbagai dompet/rekening
• Melacak tagihan dan utang
• Menganalisis pola pengeluaran

3. Akun Pengguna

• Anda bertanggung jawab menjaga kerahasiaan akun
• Satu orang satu akun
• Anda harus berusia minimal 17 tahun

4. Penggunaan yang Dilarang

Anda tidak boleh:
• Menggunakan aplikasi untuk aktivitas ilegal
• Mencoba merusak atau mengeksploitasi sistem
• Membagikan akses ke pihak tidak berwenang

5. Batasan Tanggung Jawab

• Uang Bijak adalah alat bantu, bukan penasihat keuangan
• Kami tidak bertanggung jawab atas keputusan keuangan berdasarkan data di aplikasi
• Layanan disediakan "sebagaimana adanya"

6. Perubahan Layanan

Kami berhak mengubah atau menghentikan fitur dengan pemberitahuan wajar.

7. Penghentian

Kami dapat menangguhkan akun yang melanggar ketentuan ini.

8. Hukum yang Berlaku

Ketentuan ini tunduk pada hukum Republik Indonesia.

9. Kontak

Untuk pertanyaan: support@uangbijak.app
`;

export default function LegalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type: "privacy" | "terms" }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const isPrivacy = params.type === "privacy";
  const title = isPrivacy ? "Kebijakan Privasi" : "Syarat & Ketentuan";
  const content = isPrivacy ? PRIVACY_POLICY : TERMS_OF_SERVICE;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        className="px-5 pb-4 border-b flex-row items-center"
        style={{ borderBottomColor: theme.divider }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h3" weight="bold" className="ml-2">
          {title}
        </AppText>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5 py-4">
        <AppText style={{ lineHeight: 24 }} color="default">
          {content.trim()}
        </AppText>
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
