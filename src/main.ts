import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";

import "primevue/resources/themes/saga-orange/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

import "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

import "./assets/base.css";

import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import InputNumber from "primevue/inputnumber";
import Paginator from "primevue/paginator";
import RadioButton from "primevue/radiobutton";
import Password from "primevue/password";
import Fieldset from "primevue/fieldset";
import ProgressSpinner from "primevue/progressspinner";
import Skeleton from "primevue/skeleton";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import Textarea from "primevue/textarea";
import Checkbox from "primevue/checkbox";
import Divider from "primevue/divider";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Column from "primevue/column";
import Card from "primevue/card";

import Toast from "primevue/toast";
import Tooltip from "primevue/tooltip";

import News from "./views/home/news/components/News.vue";
import Comment from "./views/home/news/components/Comment.vue";
import Event from "./views/home/news/components/Event.vue";
import Tournament from "./views/tournaments/components/Tournament.vue";

import Footer from "./components/Footer.vue";
import CardLoading from "./components/CardLoading.vue";
import TableLoading from "./components/TableLoading.vue";

const app = createApp(App);

app.use(router);
app.use(PrimeVue);
app.use(ToastService);

app.component("InputText", InputText);
app.component("Button", Button);
app.component("Card", Card);
app.component("Divider", Divider);
app.component("Dialog", Dialog);
app.component("Textarea", Textarea);
app.component("Column", Column);
app.component("Checkbox", Checkbox);
app.component("InputNumber", InputNumber);
app.component("Calendar", Calendar);
app.component("RadioButton", RadioButton);
app.component("TabView", TabView);
app.component("TabPanel", TabPanel);
app.component("Paginator", Paginator);
app.component("ProgressSpinner", ProgressSpinner);
app.component("Toast", Toast);
app.component("Skeleton", Skeleton);
app.component("Password", Password);
app.component("Fieldset", Fieldset);

app.directive("tooltip", Tooltip);

app.component("News", News);
app.component("Comment", Comment);
app.component("Tournament", Tournament);
app.component("Event", Event);
app.component("Footer", Footer);

app.component("CardLoading", CardLoading);
app.component("TableLoading", TableLoading);

app.mount("#app");
