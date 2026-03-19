# 🇯🇵 Kana Practice

A premium, interactive web application designed to master Japanese Hiragana, Katakana, and Kanji through high-fidelity tools, customizable quizzes, and deep progress tracking.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)

## ✨ Features

-   **日本語の Hub**: A central, beautifully designed dashboard for all your learning tools.
-   **Complete Kana Mastery**: Interactive charts for Hiragana and Katakana with multi-select quiz generation.
-   **Kanji Compendium**: Explore JLPT N5 through N1 Kanji with detailed stroke data, meanings, and examples.
-   **Deep Customization**: 
    -   **Theme Editor**: Create your own look with custom Primary and Secondary accent colours.
    -   **Question Filtering**: Toggle specific question types (Matching, Drawing, Sequencing, etc.) to focus your practice.
    -   **UI Preferences**: Toggle animations for a snappier experience.
-   **Smart Quizzes**: Pre-generated decks with no-repeat logic and an 80/20 focus on your weakest characters.
-   **Progress Analytics**: Visualized accuracy and mastery tracking persisted in local storage.
-   **Mobile First**: Responsive layouts including a compact horizontal hub and sticky action bars for long lists.

## 🛠️ Tech Stack

-   **Framework**: [React](https://react.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: Modern CSS with Glassmorphism and CSS Variables.
-   **State Management**: Context API with LocalStorage persistence.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (Latest LTS version recommended)
-   [npm](https://pnpm.io/installation) or [pnpm]

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/davidbelesp/kana-practice.git
    cd kana-practice
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

## 📖 Usage

1.  **The Hub**: Navigate between Practice, Kanji, Stats, and a Free Canvas for drawing.
2.  **Settings**: Click the ⚙️ icon next to the title to customize your theme, quiz length, and enabled question types.
3.  **Practice**: Select characters (individual, all, or weakest) and start a quiz. The control bar stays sticky as you scroll.
4.  **Kanji**: Switch between "View" and "Select" modes. Click any Kanji for a detailed breakdown.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
