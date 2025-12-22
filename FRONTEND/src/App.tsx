import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { UsersPage } from './pages/UsersPage';
import { AuthorsPage } from './pages/AuthorsPage';
import { BooksPage } from './pages/BooksPage';
import { LoansPage } from './pages/LoansPage';
import { MetricsPage } from './pages/MetricsPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/authors" element={<AuthorsPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
