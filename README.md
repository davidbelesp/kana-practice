# 🇯🇵 Kana Practice

A modern, interactive web application designed to help you master Japanese Hiragana and Katakana characters through customizable quizzes and progress tracking.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)

## ✨ Features

- **Complete Kana Charts**: Interactive tables for both Hiragana and Katakana.
- **Smart Quizzes**: Test your knowledge with customizable quizzes.
- **Progress Tracking**: Automatically tracks your performance and identifies your weakest characters.
- **Adaptive Learning**: "Weakest 10" mode lets you focus specifically on characters you struggle with.
- **Modern UI**: Clean, responsive interface with Dark Mode support.
- **Keyboard Support**: Efficient navigation and input.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: CSS Modules / Custom CSS
- **Routing**: [React Router](https://reactrouter.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [pnpm](https://pnpm.io/installation) (Preferred package manager)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/kana-practice.git
    cd kana-practice
    ```

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Start the development server**

    ```bash
    pnpm dev
    ```

    Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📖 Usage

1.  **Select Characters**: On the home screen, click individual characters to select them for your quiz.
    - Use the **Hiragana/Katakana** tabs to switch charts.
    - Click **All** to select all characters in the current view.
    - Click **Weakest 10** to automatically select the characters you miss most often.
2.  **Start Quiz**: Once you have selected at least 3 characters, click the **Start Quiz** button.
3.  **Review Stats**: Click **View Stats** to see a detailed breakdown of your performance.

## 📦 Scripts

- `pnpm dev`: Starts the development server with HMR.
- `pnpm build`: Builds the application for production.
- `pnpm preview`: Locally previews the production build.
- `pnpm lint`: Runs ESLint to check for code quality issues.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
