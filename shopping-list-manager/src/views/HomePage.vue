<template>
  <IonPage>
    <IonHeader :translucent="true">
      <IonToolbar>
        <IonButton @click="openMenu" slot="start" fill="clear" color="dark">
          <IonIcon :icon="menuIcon"/>
        </IonButton>
        <IonTitle v-if="listFileName">{{ listInfo[listFileName] }}</IonTitle>
        <IonTitle v-else>(No list selected)</IonTitle>
        <IonButton v-if="listFileName" @click="deleteList" id="delete-list-button" slot="end" fill="clear" color="danger">
          Delete list
        </IonButton>
      </IonToolbar>
    </IonHeader>

    <IonContent id="main-content" fullscreen>
      <IonRefresher slot="fixed" @ionRefresh="refresh($event)">
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <IonList v-if="listFileName">
        <IonItem>
          <IonLabel position="stacked">Add an item</IonLabel>
          <IonInput v-model="newListItem" @keydown.enter="addItem" type="text" required></IonInput>
        </IonItem>
        <IonItem :class="'item-container ion-activatable ripple-parent' + (item.checked ? '' : ' unchecked')"
        v-for="item in list" @click="() => itemClicked(item)">
          <IonRippleEffect></IonRippleEffect>
          <div class="dot" slot="start"></div>
          <p class="item-text">{{ item.name }}</p>
          <IonButton v-if="item.checked" @click="e => {removeItem(item); e.stopPropagation();}" slot="end" fill="clear" color="danger">
            <IonIcon :icon="trashIcon"/>
          </IonButton>
        </IonItem>
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

    <!-- For some reason, alerts seem inconsitent & sometimes just don't appear, no idea why
    <IonAlert
      trigger="delete-list-button"
      header="Are you sure?"
      message="Do you want to delete this item?"
      :buttons="[
        {
          text: 'cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: deleteList
        }
      ]">
    </IonAlert>
    -->
  </IonPage>
</template>

<script setup>
import {
  IonAlert,
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
import { menu as menuIcon, addOutline as addIcon, arrowBack as arrowBackIcon, trash as trashIcon } from 'ionicons/icons';

const listInfoFile = "list-info.json"

// Initialize list info over all lists
const listInfo = ref({})
loadFile(listInfoFile).then(info => listInfo.value = info);

// Initialize the main screen
const newListItem = ref("");
const list = ref([]);
const listFileName = ref("");

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
  sortList();
  saveList();
}

function addItem() {
  list.value.push({name: newListItem.value, checked: false});
  newListItem.value = "";
  sortList();
  saveList();
}

function removeItem(item) {
  list.value = list.value.filter(i => i !== item);
  saveList();
}

function sortList() {
  list.value.sort((item1, item2) => {
    if (item1.checked != item2.checked) {
      return item1.checked ? 1 : -1;
    } else {
      return item1.name.localeCompare(item2.name);
    }
  })
}

function openMenu() {
  document.querySelector("ion-menu")?.open();
}

function closeMenu() {
  document.querySelector("ion-menu")?.close();
}

// File functions

function saveList() {
  saveFile(list.value, listFileName.value)
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
  listFileName.value = fileName;
  sortList();

}

async function loadFile(fileName) {
  try {
    const jsonList = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
    return JSON.parse(jsonList.data);
  } catch (e) {
    console.error("Failed to load file: ", e);
    return [];
  }
}

function deleteList() {
  delete listInfo.value[listFileName.value];
  saveFile(listInfo.value, listInfoFile);
  deleteFile(listFileName.value);

  list.value = [];
  listFileName.value = '';
}

function deleteFile(fileName) {
  Filesystem.deleteFile({
    path: fileName,
    directory: Directory.Data,
  }).catch(e => console.error("Failed to delete file: ", e))
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
    counter++;
  }

  const uniqueFileName = baseFileName + counter + ".json";
  listInfo.value[uniqueFileName] = newListName.value;
  saveFile(listInfo.value, listInfoFile);
  saveFile([], uniqueFileName).then(() => loadList(uniqueFileName));

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