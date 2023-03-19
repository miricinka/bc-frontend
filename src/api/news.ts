import { ref } from "vue";

import axios, { AxiosError } from "axios";

export interface News {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  text: string;
}

export interface IComment {
  id: number;
  created_at: string;
  updated_at: string;
  text: string;
  news_id: number;
  username: string;
}

export interface IStoreNewsError {
  errors: {
    title: string[];
    text: string[];
  };
}

export interface IStoreCommentError {
  errors: {
    text: string[];
  };
}

export interface INewsWithComment {
  commentCount: number;
  news: News;
}

export default function newsApi() {
  const news = ref<INewsWithComment[]>();
  const errors = ref<IStoreNewsError>();

  const getNews = async () => {
    const response = await axios.get<INewsWithComment[]>(
      "http://127.0.0.1:8000/api/news"
    );
    news.value = response.data;
  };

  const destroyNews = async (id: number) => {
    if (!window.confirm("Are you sure?")) {
      return;
    }
    await axios.delete("http://127.0.0.1:8000/api/news/" + id);
  };

  const storeNews = async (data: { title: string; text: string }) => {
    try {
      await axios.post("http://127.0.0.1:8000/api/news", data);
    } catch (error) {
      if (error instanceof AxiosError) {
        errors.value = error.response?.data;
        console.log(errors.value);
      } else {
        console.log("Unexpected error", error);
      }
    }
  };

  return {
    news,
    errors,
    getNews,
    storeNews,
    destroyNews,
  };
}
