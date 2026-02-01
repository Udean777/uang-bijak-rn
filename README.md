# Uang Bijak 💰

**Uang Bijak** is a premium, smart, and modern personal finance tracker designed to provide a high-end experience for managing your financial life. Built with **Expo SDK 54**, it combines powerful features with a sleek, responsive interface to help you achieve financial freedom.

## ✨ Key Features

### 🏢 Core Management

- **📊 Dynamic Dashboard**: real-time summary of balance, income, and expenses with elegant visualizations.
- **� Multi-Wallet Support**: Manage Cash, Bank accounts, and E-wallets in one unified interface.
- **� Seamless Transactions**: Record income, expenses, and transfers with advanced categorization.
- **� Recurring Transactions**: Automate repetitive entries for daily, weekly, monthly, or yearly cycles.

### 🧠 Smart & AI-Driven

- **� Smart Insights**: Automated analysis of spending trends, comparison with previous months, and anomaly detection.
- **🎯 Intelligent Budgeting**: Set category-specific limits with real-time tracking and "Near Limit" alerts.
- **📈 Advanced Analytics**: Deep-dive into your financial habits with interactive charts and historical data.

### �️ Security & Experience

- **🔐 Biometric Authentication**: Shield your sensitive data with FaceID or Fingerprint protection.
- **� Proactive Notifications**: Smart reminders for bill payments, debt due dates, and wishlist milestones.
- **� Data Portability**: Export transactions and monthly summaries to CSV for external auditing or spreadsheets.
- **🌗 Native Dark Mode**: Seamlessly adapts to your device's appearance for a comfortable late-night viewing experience.

## 🛠️ Tech Stack & Architecture

- **Core**: [React Native 0.81](https://reactnative.dev/) with [Expo SDK 54](https://expo.dev/) (Managed Workflow).
- **Navigation**: [Expo Router v4](https://docs.expo.dev/router/introduction/) for robust, file-based routing.
- **State & Backend**: [Firebase v11](https://firebase.google.com/) (Authentication, Cloud Firestore).
- **Styling**: [NativeWind (Tailwind CSS)](https://www.nativewind.dev/) for a utility-first, modern design system.
- **Visualization**: [Gifted Charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) for premium interactive financial graphs.
- **Developer Tools**: TypeScript for maximum type safety and code quality.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Bun](https://bun.sh/)
- [EAS CLI](https://docs.expo.dev/build/setup/) (`npm install -g eas-cli`)
- [Expo Go](https://expo.dev/client) app installed on your physical device.

### Installation

1.  **Clone & Enter:**
    ```bash
    git clone https://github.com/udean777/uang-bijak-rn.git && cd uang-bijak-rn
    ```
2.  **Install Dependencies:**
    ```bash
    bun install
    ```
3.  **Android SDK Setup:**
    Create `android/local.properties` and add your SDK path:
    ```properties
    sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
    ```

## 🛠️ Commands & Scripts

### Development

```bash
bun run start   # Start Expo development server
bun run android # Run on Android emulator/device
bun run ios     # Run on iOS simulator
```

### Testing

```bash
bun run test     # Run all tests
bun run test:all # Run comprehensive test suite
```

### Building (EAS)

```bash
# Android
bun run android:build:dev  # Build Development Client (Internal)
bun run android:build:apk  # Build Installable APK (Preview)
bun run android:build:prod # Build App Bundle (Production/Play Store)

# iOS
bun run ios:build:dev      # Build Development Client (Internal)
bun run ios:build:prod     # Build App Store Version
```

## 📂 Project Structure

```bash
src/
├── app/          # Navigation & Screens (Expo Router)
├── components/   # Atomic UI System (Atoms, Molecules)
├── features/     # Feature-encapsulated logic (Auth, Budget, Debts)
├── services/     # Business Layer (Firebase, Sync, Notifications)
├── hooks/        # Custom React Hooks (Business & UI logic)
├── types/        # Global TypeScript Definitions
└── utils/        # Tactical Helpers (Formatting, Calculations)
```

---

Made with ❤️ by [Sajudin]
