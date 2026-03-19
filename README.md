# 🇯🇵 Kana Practice

A premium, interactive web application designed to master Japanese Hiragana, Katakana, and Kanji through high-fidelity tools, customizable quizzes, and deep progress tracking. Now featuring full multi-language support.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-English%20%7C%20Espa%C3%B1ol-orange)

## ✨ Features

-   **日本語の Hub**: A central, beautifully designed dashboard for all your learning tools.
-   **🌍 Internationalization**: Switch seamlessly between **English** and **Spanish**. The app automatically detects your browser language and persists your preference.
-   **Complete Kana Mastery**: Interactive charts for Hiragana and Katakana with multi-select quiz generation.
-   **Kanji Compendium**: Explore JLPT N5 through N2 Kanji with detailed radical data, **localized meanings (EN/ES)**, and phonetic readings (Kunyomi/Onyomi).
-   **Deep Customization**: 
    -   **Theme Editor**: Multiple premium presets (Ocean Blue, Emerald Green, Sunset Orange) or full custom Primary/Secondary pairs.
    -   **Question Filtering**: Toggle specific formats like **Sequence Order**, **Pair Match**, and **Handwriting (AI)**.
    -   **UI Preferences**: Toggle animations for a snappier experience on low-end devices.
-   **Smart Quizzes**: Pre-generated decks with no-repeat logic and an 80/20 focus algorithm targeting your weakest characters.
-   **Progress Analytics**: Visualized accuracy, top streaks, and mastery tracking (100+ streak milestones).
-   **Mobile First**: Responsive layouts including sticky action bars, centered mobile controls, and high-contrast glass panels for readability.
-   **Factory Reset**: Easily clear all progress and settings from the General tab.

## 🛠️ Tech Stack

-   **Framework**: [React](https://react.dev/)
-   **i18n**: [i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: Modern Vanilla CSS with variables and glassmorphism.
-   **State Management**: Context API with LocalStorage synchronization.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (Latest LTS version recommended)
-   [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/davidbelesp/kana-practice.git
    cd kana-practice
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # OR
    pnpm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

## 📖 Usage

1.  **The Hub**: Navigate between Practice, Kanji, Stats, and Free Canvas.
2.  **Settings**: Click the ⚙️ icon or "Settings" card to customize appearance, quiz behavior, and language.
3.  **Practice**: Select characters and start a quiz. Use "Weakest 10" for targeted learning.
4.  **Kanji**: View character details or select specific ones for a Kanji session.
5.  **Free Canvas**: Draw any character and use the AI Recognize button to see if you got it right!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
