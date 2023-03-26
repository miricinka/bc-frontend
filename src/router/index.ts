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
    {
      path: "/users",
      name: "users",
      component: () => import("../views/users/UsersView.vue"),
    },
    {
      path: "/users/:username",
      name: "user",
      component: () => import("../views/user/OneUserView.vue"),
      props: true,
    },
    {
      path: "/pageNotFound",
      name: "pageNotFound",
      component: () => import("../views/other/PageNotFound.vue"),
    },
    {
      path: "/notAuth",
      name: "notAuth",
      component: () => import("../views/other/PermissionDenied.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      component: () => import("../views/other/PageNotFound.vue"),
    },
  ],
});

export default router;
