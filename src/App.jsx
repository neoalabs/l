import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Chat } from "./components/Chat";
import { Toaster } from "sonner";

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Header />
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
          <Footer />
          <Toaster position="top-center" />
        </div>
      </Router>
    </ThemeProvider>
  );
}

// SearchPage component to handle search from URL parameters
function SearchPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get("q");

  if (!query) {
    window.location.href = "/";
    return null;
  }

  return <Chat initialQuery={query} />;
}

export default App;