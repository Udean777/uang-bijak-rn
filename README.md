# Uang Bijak 💰

**Uang Bijak** is a smart and modern personal finance tracker application designed to help you manage your income, expenses, savings, and debts with ease. Built with the latest technologies to provide a fast, responsive, and delightful user experience.

## ✨ Key Features

The app includes a wide range of features to support your financial health:

- **📊 Dashboard Overview**: View a summary of your balance, total income, and expenses in real-time with engaging visualizations.
- **💸 Transaction Recording**: Record daily transactions (Income, Expense, Transfer) quickly and easily.
- **📂 Wallets & Accounts**: Manage multiple funding sources (Cash, Bank, E-Wallet) in one place.
- **📅 Transaction History**: Browse your transaction history based on specific time periods.
- **📈 Financial Analysis**: Get deep insights into your spending patterns through informative charts and diagrams.
- **🎯 Wishlist & Savings**: Set saving goals for your dream items and track your progress.
- **🧾 Debt Management**: Record and monitor debts so nothing gets missed.
- **🔁 Subscriptions**: Manage your recurring monthly bills (Netflix, Spotify, Utilities, etc.) to avoid late payments.
- **📝 Transaction Templates**: Save favorite transactions to speed up recording of repetitive entries.
- **🌗 Dark Mode**: A comfortable viewing experience with automatic dark mode support.

## 🛠️ Tech Stack

This project is built using:

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 50+)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety.
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing).
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native).
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) for real-time cloud data storage.
- **Authentication**: Firebase Authentication.
- **Icons**: Ionicons (@expo/vector-icons).

## 🚀 Getting Started

Follow these steps to customize and run the application on your local machine.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Expo Go](https://expo.dev/client) on your Android/iOS device (or Emulator).

### Installation

1.  **Clone this repository:**

    ```bash
    git clone https://github.com/username/uang-bijak.git
    cd uang-bijak
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in your project root (if not already present) and add your Firebase configuration.
    _(Adjust according to your Firebase project configuration)_

4.  **Run the Application:**

    ```bash
    npm start
    ```

5.  **Open the App:**
    - Scan the QR Code shown in the terminal using the **Expo Go** app (Android) or **Camera** (iOS).
    - Press `a` in the terminal to open in Android Emulator.
    - Press `i` in the terminal to open in iOS Simulator.

## 📂 Project Structure

```
uang-bijak/
├── src/
│   ├── app/                 # Screens & Routing (Expo Router)
│   │   ├── (auth)/          # Authentication screens (Login/Register)
│   │   ├── (tabs)/          # Main Tab Navigation (Home, History, etc.)
│   │   ├── (modals)/        # Modal screens (Add Transaction, etc.)
│   │   └── _layout.tsx      # Root Layout
│   ├── components/          # Reusable UI Components
│   ├── config/              # Configuration (Firebase, Theme)
│   ├── constants/           # App Constants (Colors, Fonts)
│   ├── hooks/               # Custom React Hooks
│   ├── services/            # API & Business Logic (Firebase Wrappers)
│   ├── types/               # TypeScript Type Definitions
│   └── utils/               # Helper Functions
├── assets/                  # Images, Fonts, Icons
├── .env                     # Environment Variables
├── babel.config.js          # Babel Configuration
├── tailwind.config.js       # Tailwind CSS Configuration
└── package.json             # Dependencies & Scripts
```

## 🤝 Contribution

Contributions are welcome! If you want to fix bugs or add new features:

1.  Fork this repository.
2.  Create a new feature branch (`git checkout -b cool-feature`).
3.  Commit your changes (`git commit -m 'Add cool feature'`).
4.  Push to the branch (`git push origin cool-feature`).
5.  Create a Pull Request.

---

Made with ❤️ by [Sajudin]
