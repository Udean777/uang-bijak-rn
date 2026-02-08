export const MESSAGES = {
  AUTH: {
    USER_NOT_FOUND: "Profil akun tidak ditemukan.",
    LOGIN_FAILED: "Email atau password salah.",
    REGISTER_FAILED: "Gagal mendaftar.",
    GOOGLE_LOGIN_FAILED: "Gagal login Google: ",
    NO_USER_LOGGED_IN: "Tidak ada user yang login.",
    DELETE_ACCOUNT_FAILED: "Gagal menghapus akun: ",
    REAUTH_REQUIRED:
      "Untuk keamanan, silakan logout dan login kembali sebelum menghapus akun.",
  },
  TRANSACTION: {
    WALLET_NOT_FOUND: "Dompet tidak ditemukan!",
    TARGET_WALLET_REQUIRED: "Dompet tujuan harus dipilih untuk transfer!",
    SAME_WALLET_ERROR: "Dompet sumber dan tujuan tidak boleh sama!",
    TARGET_WALLET_NOT_FOUND: "Dompet tujuan tidak ditemukan!",
    SAVE_FAILED: "Gagal menyimpan transaksi",
    DELETE_FAILED: "Gagal menghapus: ",
    UPDATE_FAILED: "Gagal mengupdate transaksi",
    CHECK_BUDGET_FAILED: "Gagal mengecek penggunaan budget: ",
  },
  WALLET: {
    CREATE_FAILED: "Gagal membuat dompet: ",
    UPDATE_FAILED: "Gagal update dompet: ",
    DELETE_FAILED: "Gagal hapus dompet: ",
  },
  BUDGET: {
    CALC_FAILED: "Gagal menghitung kebutuhan bulanan: ",
    SAVE_FAILED: "Gagal menyimpan budget: ",
    DELETE_FAILED: "Gagal menghapus budget: ",
  },
  RECURRING: {
    CREATE_FAILED: "Gagal membuat transaksi berulang: ",
    DELETE_FAILED: "Gagal menghapus: ",
    UPDATE_STATUS_FAILED: "Gagal update status: ",
    UPDATE_FAILED: "Gagal update transaksi: ",
  },
  SUBSCRIPTION: {
    ADDED_TITLE: "Langganan Ditambahkan 📥",
    ADDED_BODY: "telah berhasil ditambahkan ke daftar langganan Anda.",
    RENEWED_TITLE: "Langganan Diperbarui 🔄",
    RENEWED_BODY:
      "Pembayaran telah dikonfirmasi dan jatuh tempo berikutnya diperbarui.",
  },
  GOAL: {
    CREATE_FAILED: "Gagal membuat goal: ",
    UPDATE_PROGRESS_FAILED: "Gagal memperbarui progress: ",
    UPDATE_STATUS_FAILED: "Gagal memperbarui status: ",
    UPDATE_FAILED: "Gagal memperbarui goal: ",
    DELETE_FAILED: "Gagal menghapus goal: ",
  },
  WISHLIST: {
    DELETE_FAILED: "Gagal menghapus wishlist: ",
  },
} as const;
