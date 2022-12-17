import { ref } from "vue";

import axios from "axios";

export interface News {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  text: string;
};

export interface GetNewsResponse {
  data: News[];
};

export default function newsApi(){

  const news = ref<News[]>();

  const getNews = async () => {
    const response = await axios.get<GetNewsResponse>("http://127.0.0.1:8000/api/news");
    news.value = response.data.data;
  };

  const destroyNews = async (id:number) =>{
    if(!window.confirm("Are you sure?")){
        return;
    }
    await axios.delete("http://127.0.0.1:8000/api/news/" + id);
    await getNews();
  }

  const storeNews = async (data:{title:string, text:string}) => {
    await axios.post("http://127.0.0.1:8000/api/news", data);
    await getNews();
}

  return {
    news,
    getNews,
    storeNews,
    destroyNews,
  };

}