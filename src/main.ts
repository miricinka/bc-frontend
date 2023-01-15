import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";

import "primevue/resources/themes/saga-orange/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

import "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

import "./assets/base.css";

import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Divider from "primevue/divider";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Card from "primevue/card";

import News from "./components/News.vue";
import Comment from "./components/Comment.vue";

const app = createApp(App);

app.use(router);
app.use(PrimeVue);

app.component("InputText", InputText);
app.component("Button", Button);
app.component("Card", Card);
app.component("Divider", Divider);
app.component("Dialog", Dialog);
app.component("Textarea", Textarea);

app.component("News", News);
app.component("Comment", Comment);

app.mount("#app");
