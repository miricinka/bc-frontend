import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/chess",
      name: "chess",
      component: () => import("../views/chess/Chess.vue"),
    },
    {
      path: "/createNews",
      name: "createNews",
      component: () => import("../views/news/CreatePost.vue"),
    },
    {
      path: "/news/:id/edit",
      name: "editNews",
      component: () => import("../views/news/EditPost.vue"),
      props: true,
    },
    {
      path: "/news/:id",
      name: "comments",
      component: () => import("../views/news/comments/Comments.vue"),
      props: true,
    },
  ],
});

export default router;
