import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useMetaData = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        // Backend returns=> data: { categories: [grouped], all: [...] }
        setCategories(data.data.all || []);
      } catch (err) {
        console.error("Failed to load categories", err);
        // fallback for demo
        setCategories([
            { id: 1, name: 'Gardening' },
            { id: 2, name: 'Plumbing' },
            { id: 3, name: 'Electrical' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};

export default useMetaData;