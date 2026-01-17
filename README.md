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

- **Framework**: [React Native](https://reactnative.dev/) (v0.81) with [Expo](https://expo.dev/) (SDK 54)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety.
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing).
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native).
- **Backend/Database**: [Firebase](https://firebase.google.com/) (Auth, Firestore).
- **Charts**: [react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) for beautiful financial visualizations.
- **Date Picking**: [react-native-modal-datetime-picker](https://github.com/mmazzarolo/react-native-modal-datetime-picker).
- **Icons**: Ionicons & Expo Symbols.

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
    # or
    bun install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in your project root (if not already present) and add your Firebase configuration.
    _(Adjust according to your Firebase project configuration)_

4.  **Run the Application:**

    ```bash
    npx expo start
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
│   │   ├── (modals)/        # Modal screens (Add Transaction, Wallet, etc.)
│   │   ├── (sub)/           # Secondary screens (Details, Forms)
│   │   ├── (tabs)/          # Main Tab Navigation (Home, History, etc.)
│   │   ├── _layout.tsx      # Root Layout
│   │   └── ...
│   ├── components/          # Reusable UI Components
│   │   ├── atoms/           # Basic components (Text, Button, Input)
│   │   ├── molecules/       # Composition of atoms (Dialogs, Cards)
│   │   └── ...
│   ├── config/              # Configuration (Firebase, Theme)
│   ├── features/            # Feature-based logic & components
│   │   ├── auth/            # Authentication feature
│   │   ├── budgeting/       # Budgeting hooks
│   │   ├── debts/           # Debt management
│   │   ├── subscriptions/   # Subscription management
│   │   ├── transactions/    # Transaction logic & components
│   │   ├── wallets/         # Wallet logic & components
│   │   └── wishlist/        # Wishlist logic
│   ├── services/            # API & Business Logic
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
