<template>
  <IonPage>
    <IonHeader :translucent="true">
      <IonToolbar>
        <IonTitle>{{ listInfo[listFileName] }}</IonTitle>
        <IonButton @click="openMenu" slot="start" fill="clear" color="dark">
          <IonIcon :icon="menuIcon"/>
        </IonButton>
      </IonToolbar>
    </IonHeader>

    <IonContent id="main-content" :fullscreen="true">
      <IonRefresher slot="fixed" @ionRefresh="refresh($event)">
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <IonList>
        <IonItem :class="'item-container ion-activatable ripple-parent' + (item.checked ? '' : ' unchecked')"
        v-for="item in list" @click="() => itemClicked(item)">
          <IonRippleEffect></IonRippleEffect>
          <div class="dot" slot="start"></div>
          <p class="item-text">
            {{ item.name }}
          </p>
        </IonItem>
        <IonItem button @click="saveList">Save list</IonItem>
        <IonItem button @click="() => loadList('test-list.json')">Load list</IonItem>
        <IonItem button @click="() => console.log(getOccupiedFileNames())">Print list names to console</IonItem>
      </IonList>
    </IonContent>

    <IonMenu side="start" menuId="first" content-id="main-content">
      <IonHeader>
        <IonToolbar>
          <IonButton @click="closeMenu" slot="start" fill="clear" color="dark">
            <IonIcon :icon="arrowBackIcon"/>
          </IonButton>
          <IonTitle>Lists</IonTitle>
          <IonButton @click="formIsOpen = true" slot="end" fill="clear" color="dark">
            New list
            <IonIcon :icon="addIcon" slot="end"/>
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem button v-for="[fileName, listName] in Object.entries(listInfo)" @click="() => {loadList(fileName); closeMenu()}">
            {{ listName }}
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>

    <IonModal :is-open="formIsOpen" @did-dismiss="closeModal">
      <IonHeader :translucent="true">
        <IonToolbar>
          <IonButton @click="closeModal" slot="start" fill="clear" color="dark">
            <IonIcon :icon="arrowBackIcon"/>
          </IonButton>
          <IonTitle>Add a new list:</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form @submit.prevent="makeNewList" class="modal-content">
          <IonItem>
            <IonLabel position="stacked">List Name</IonLabel>
            <IonInput v-model="newListName" type="text" required></IonInput>
          </IonItem>
          <IonButton type="submit">Create List</IonButton>
        </form>
      </IonContent>
    </IonModal>
  </IonPage>
</template>

<script setup>
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRippleEffect,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { ref } from 'vue';
import { menu as menuIcon, add as addIcon, arrowBack as arrowBackIcon } from 'ionicons/icons';

const listInfoFile = "list-info.json"

// Initialize list info over all lists
const listInfo = ref({})
loadFile(listInfoFile).then(info => listInfo.value = info);

// Initialize the first list
const list = ref([{name: "Soap", checked: false}, {name: "Butter", checked: true}, {name: "Flour", checked: false}]);
var listFileName = "test-list.json";

// Initialize the form for creating a new list
const formIsOpen = ref(false);
const newListName = ref("");

const refresh = (ev) => {
  setTimeout(() => {
    ev.detail.complete();
  }, 3000);
};

// Simple utility functions

function itemClicked(item) {
  item.checked = !item.checked;
  saveList()
}

function openMenu() {
  document.querySelector("ion-menu")?.open();
}

function closeMenu() {
  document.querySelector("ion-menu")?.close();
}

// File functions

async function saveList() {
  await saveFile(list.value, listFileName)
}

async function saveFile(object, fileName) {
  try {
    const jsonList = JSON.stringify(object);

    await Filesystem.writeFile({
      path: fileName,
      data: jsonList,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
  } catch (e) {
    console.error("Failed to save list: ", e);
  }
}

async function loadList(fileName) {
  list.value = await loadFile(fileName);
  listFileName = fileName;
}

async function loadFile(fileName) {
  try {
    const jsonList = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
    return JSON.parse(jsonList.data)
  } catch (e) {
    console.error("Failed to load file: ", e);
    return {};
  }
}

function getOccupiedFileNames() {
  return Object.keys(listInfo.value).concat([listInfoFile]);
}

// Form functions
function makeNewList() {
  const occupiedFilenames = getOccupiedFileNames();
  console.log(occupiedFilenames)
  const baseFileName = newListName.value.toLowerCase().replace(" ", "-")
  var counter = 0;
  
  while (occupiedFilenames.some(name => name.startsWith(baseFileName + counter))) {
    ++counter;
  }

  const uniqueFileName = baseFileName + counter + ".json";
  listInfo.value[uniqueFileName] = newListName.value;
  saveFile(listInfo.value, listInfoFile);
  saveFile({}, uniqueFileName).then(() => loadList(uniqueFileName));

  closeModal();
}

function closeModal() {
  formIsOpen.value = false;
  newListName.value = '';
}
</script>

<style scoped lang="css">

.modal-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.item-container {
  --padding-start: 0;
  --inner-padding-end: 0;
}

.item-text {
  text-decoration: line-through;
  font-style: italic;
  color: #a9a9aa;
}

.unchecked .item-text {
  color: white;
  font-style: normal;
  text-decoration: none;
}

.dot {
  display: block;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  align-self: start;
  margin: 16px 10px 16px 16px;
}

.unchecked .dot {
  background: var(--ion-color-primary);
}
</style>