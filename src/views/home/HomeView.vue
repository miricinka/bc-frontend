<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import type { PageState } from "primevue/paginator";
import { useToast } from "primevue/usetoast";
import axios from "axios";
import type { IEvent, INewsWithComment } from "@/shared/interface";

const toast = useToast();
const loggedRole = ref(localStorage.getItem("role"));
const token = ref(localStorage.getItem("token"));

const news = ref<INewsWithComment[]>([]);
const visibleNews = ref<INewsWithComment[]>([]);
const visibleEvents = ref<IEvent[]>([]);
const events = ref<IEvent[]>();
const editingEvent = ref<IEvent>();

const displayAddEventModal = ref<boolean>(false);
const displayEditEventModal = ref<boolean>(false);
const form = reactive({
  name: "",
  date: new Date(),
  description: "",
});

/*
loads news and events
*/
onMounted(async () => {
  await getNews();
  if (news.value) {
    visibleNews.value = news.value.slice(0, 3);
  }
  await getEvents();
});

async function getNews() {
  const response = await axios.get<INewsWithComment[]>(
    "http://127.0.0.1:8000/api/news"
  );
  news.value = response.data;
  visibleNews.value = news.value.slice(0, 3);
}

/*
deletes specific news by id and refreshes all news
triggers success/error delete notification
*/
const deleteNews = async (id: number) => {
  try {
    if (!window.confirm("Are you sure?")) {
      return;
    }
    await axios({
      method: "delete",
      url: "http://127.0.0.1:8000/api/news/" + id,
      headers: { Authorization: `Bearer ${token.value}` },
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Novinku se nepodařilo smazat",
      detail: "Novinku se nepodařilo smazat",
      life: 3000,
    });
    return;
  }
  toast.add({
    severity: "success",
    summary: "Novinka",
    detail: "Novinka smazána",
    life: 3000,
  });
  await getNews();
  if (news.value) {
    visibleNews.value = news.value.slice(0, 3);
  }
};

/*
pagination - updates visible news
*/
function onNewsPage(event: PageState) {
  if (news.value) {
    visibleNews.value = news.value.slice(event.first, event.first + event.rows);
  }
}

/*
pagination - updates visible events
*/
function onEventPage(event: PageState) {
  if (events.value) {
    visibleEvents.value = events.value.slice(
      event.first,
      event.first + event.rows
    );
  }
}

/*
gets events from server
*/
async function getEvents() {
  const response = await axios.get<IEvent[]>("http://127.0.0.1:8000/api/event");
  events.value = response.data;
  if (events.value) {
    visibleEvents.value = events.value.slice(0, 3);
  }
}

/*
gets event from server by id
*/
async function getEvent(id: number) {
  const response = await axios.get<IEvent>(
    "http://127.0.0.1:8000/api/event/" + id
  );
  editingEvent.value = response.data;
}

/*
after confirming pop-up window, deletes event by id
*/
async function deleteEvent(id: number) {
  if (!window.confirm("Are you sure?")) {
    return;
  }
  try {
    await axios({
      method: "delete",
      url: "http://127.0.0.1:8000/api/event/" + id,
      headers: { Authorization: `Bearer ${token.value}` },
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Akce",
      detail: "Akci se nepodařilo smazat",
      life: 3000,
    });
    return;
  }
  toast.add({
    severity: "success",
    summary: "Akce",
    detail: "Akce smazána",
    life: 3000,
  });
  await getEvents();
}

/*
resets event form, sets default values
*/
function resetEventForm() {
  form.name = "";
  form.date = new Date();
  form.description = "";
}

/*
resets event form and opens add event modal
*/
function openAddEventModal() {
  resetEventForm();
  displayAddEventModal.value = true;
}

/*
resets event form and closes add event modal 
*/
function closeAddEventModal() {
  resetEventForm();
  displayAddEventModal.value = false;
}

/*
opens edit event modal and prefills the form
*/
async function openEditEventModal(id: number) {
  await getEvent(id);
  if (editingEvent.value) {
    form.description = editingEvent.value.description;
    form.date = new Date(editingEvent.value.date);
    form.name = editingEvent.value.name;
  }
  displayEditEventModal.value = true;
}

/*
closes edit event modal and resets the form
*/
function closeEditEventModal() {
  resetEventForm();
  editingEvent.value = undefined;
  displayEditEventModal.value = false;
}

/*
stores event, triggers success/error notification and gets again all events
*/
async function storeEvent(name: string, date: Date, description: string) {
  try {
    await axios({
      method: "post",
      url: "http://127.0.0.1:8000/api/event/",
      data: {
        name: name,
        date: new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 19)
          .replace("T", " "),
        description: description,
      },
      headers: { Authorization: `Bearer ${token.value}` },
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Akce",
      detail: "Akci se nepodařilo přidat",
      life: 3000,
    });
    return;
  }
  toast.add({
    severity: "success",
    summary: "Akce",
    detail: "Akce přidána!",
    life: 3000,
  });
  await getEvents();
  closeAddEventModal();
}

/*
updates event, triggers success/error notification and refreshes all events
*/
async function updateEvent(name: string, date: Date, description: string) {
  if (editingEvent.value) {
    try {
      await axios({
        method: "put",
        url: "http://127.0.0.1:8000/api/event/" + editingEvent.value.id,
        data: {
          name: name,
          date: new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),
          description: description,
        },
        headers: { Authorization: `Bearer ${token.value}` },
      });
    } catch {
      toast.add({
        severity: "error",
        summary: "Akce",
        detail: "Akci se nepodařilo upravit",
        life: 3000,
      });
      return;
    }
    toast.add({
      severity: "success",
      summary: "Akce",
      detail: "Akce upravena!",
      life: 3000,
    });
  }
  await getEvents();
  closeEditEventModal();
}
</script>

<template>
  <main>
    <div class="container">
      <div class="row">
        <div class="col-7">
          <div class="news mt-5">
            <Card class="news-cards">
              <template #title>
                <div class="d-flex justify-content-between container my-3">
                  Aktuality
                  <Button
                    v-if="loggedRole === 'admin'"
                    @click="$router.push('/createNews')"
                    label="Nová aktualita"
                    class="p-button-raised p-button-success"
                    icon="pi pi-plus"
                  />
                </div>
              </template>
              <template #content>
                <div v-if="visibleNews.length > 0">
                  <div v-for="oneNews in visibleNews">
                    <News
                      :id="oneNews.news.id"
                      :title="oneNews.news.title"
                      :text="oneNews.news.text"
                      :dateCreated="oneNews.news.created_at"
                      :commentCount="oneNews.commentCount"
                      :role="loggedRole"
                      @delete="deleteNews"
                    ></News>
                  </div>
                  <Paginator
                    :rows="3"
                    :totalRecords="news?.length"
                    @page="onNewsPage($event)"
                  ></Paginator>
                </div>
                <div v-else>
                  <CardLoading></CardLoading>
                  <CardLoading></CardLoading>
                  <CardLoading></CardLoading>
                </div>
              </template>
            </Card>
          </div>
        </div>
        <div class="col">
          <div class="row pb-2">
            <div class="news mt-5">
              <Card>
                <template #title>
                  <div class="d-flex justify-content-between container my-3">
                    Kalendář akcí
                    <Button
                      v-if="loggedRole === 'admin'"
                      label="Nová akce"
                      class="p-button-raised p-button-success"
                      icon="pi pi-plus"
                      @click="openAddEventModal()"
                    />
                  </div>
                </template>
                <template #content>
                  <template v-if="events">
                    <template v-if="events.length === 0"> Zadne akce </template>
                    <div class="events">
                      <Event
                        v-for="event in visibleEvents"
                        :name="event.name"
                        :date="event.date"
                        :description="event.description"
                        :role="loggedRole"
                        @edit="openEditEventModal(event.id)"
                        @delete="deleteEvent(event.id)"
                      ></Event>
                      <Paginator
                        :rows="3"
                        :totalRecords="events?.length"
                        @page="onEventPage($event)"
                      ></Paginator>
                    </div>
                  </template>
                  <template v-else>
                    <CardLoading></CardLoading>
                    <CardLoading></CardLoading>
                  </template>
                </template>
              </Card>
            </div>
          </div>
        </div>
        <Dialog
          header="Přidat akci"
          v-model:visible="displayAddEventModal"
          :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
          :style="{ width: '50vw' }"
          :modal="true"
        >
          <form
            @submit.prevent="storeEvent(form.name, form.date, form.description)"
          >
            <div class="my-6">
              <h5 id="text-area-text">Název</h5>
              <InputText type="text" v-model="form.name" />
              <h5 id="text-area-text">Datum</h5>
              <Calendar
                showIcon
                :manualInput="false"
                v-model="form.date"
                dateFormat="dd. mm. yy"
              />
              <h5 id="text-area-text">Popis</h5>
              <Textarea
                v-model="form.description"
                :autoResize="true"
                rows="5"
                cols="50"
                aria-labelledby="text-area-text"
              />
            </div>
            <div>
              <Button
                label="Zpět"
                icon="pi pi-times"
                @click="closeAddEventModal()"
                class="p-button-text"
              />
              <Button label="Nahrát" icon="pi pi-check" type="submit" />
            </div>
          </form>
        </Dialog>
        <Dialog
          header="Upravit akci"
          v-model:visible="displayEditEventModal"
          :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
          :style="{ width: '50vw' }"
          :modal="true"
        >
          <form
            @submit.prevent="
              updateEvent(form.name, form.date, form.description)
            "
          >
            <div class="my-6">
              <h5 id="text-area-text">Název</h5>
              <InputText type="text" v-model="form.name" />
              <h5 id="text-area-text">Datum</h5>
              <Calendar
                showIcon
                :manualInput="false"
                v-model="form.date"
                dateFormat="dd. mm. yy"
              />
              <h5 id="text-area-text">Popis</h5>
              <Textarea
                v-model="form.description"
                :autoResize="true"
                rows="5"
                cols="50"
                aria-labelledby="text-area-text"
              />
            </div>
            <div>
              <Button
                label="Zpět"
                icon="pi pi-times"
                @click="closeEditEventModal()"
                class="p-button-text"
              />
              <Button label="Nahrát" icon="pi pi-check" type="submit" />
            </div>
          </form>
        </Dialog>
      </div>
    </div>
  </main>
</template>

<style>
.news-cards {
  border-radius: 25px;
  background-color: #f7e2c6;
}
</style>
