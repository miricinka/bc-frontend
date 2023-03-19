import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/home/HomeView.vue";

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
      component: () => import("../views/about/AboutView.vue"),
    },
    {
      path: "/chess/:id?",
      name: "chess",
      component: () => import("../views/chess/Chess.vue"),
      props: true,
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
    {
      path: "/activities",
      name: "activities",
      component: () => import("../views/activities/ActivitiesView.vue"),
    },
    {
      path: "/attendance",
      name: "attendance",
      component: () => import("../views/attendance/AttendanceView.vue"),
    },
    {
      path: "/tournaments",
      name: "tournaments",
      component: () => import("../views/tournaments/TournamentsView.vue"),
    },
    {
      path: "/tournaments/:id",
      name: "tournament",
      component: () => import("../views/tournaments/TournamentView.vue"),
      props: true,
    },
  ],
});

export default router;
