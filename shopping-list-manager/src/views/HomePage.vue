<template>
  <IonPage>
    <IonHeader :translucent="true">
      <IonToolbar>
        <IonTitle>Inbox</IonTitle>
        <IonButton @click="openMenu" slot="start" fill="clear">
          <IonIcon :icon="menuIcon" color="dark"/>
        </IonButton>
      </IonToolbar>
    </IonHeader>

    <IonMenu side="start" menuId="first" content-id="main-content">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem button>Home</IonItem>
          <IonItem button>About</IonItem>
          <IonItem button>Settings</IonItem>
        </IonList>
      </IonContent>
    </IonMenu>

    <IonContent id="main-content" :fullscreen="true">
      <IonRefresher slot="fixed" @ionRefresh="refresh($event)">
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <IonList>
        <MessageListItem v-for="message in messages" :key="message.id" :message="message" />
      </IonList>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonMenu,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import MessageListItem from '@/components/MessageListItem.vue';
import { getMessages, Message } from '@/data/messages';
import { ref } from 'vue';
import { menu as menuIcon } from 'ionicons/icons';

const messages = ref<Message[]>(getMessages());

const refresh = (ev: CustomEvent) => {
  setTimeout(() => {
    ev.detail.complete();
  }, 3000);
};

function openMenu() {
  document.querySelector("ion-menu")?.open();
}
</script>
