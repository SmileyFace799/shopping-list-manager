<template>
  <IonPage>
    <IonHeader :translucent="true">
      <IonToolbar>
        <IonTitle>{{ list.name }}</IonTitle>
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
        <IonItem :class="'item-container ion-activatable ripple-parent' + (item.checked ? '' : ' unchecked')"
        v-for="item in list.items" @click="item.checked = !item.checked">
          <IonRippleEffect></IonRippleEffect>
          <div class="dot"></div>
          <p class="item-text">
            {{ item.name }}
          </p>
        </IonItem>
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
  IonRippleEffect,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import MessageListItem from '@/components/MessageListItem.vue';
import { getMessages, Message } from '@/data/messages';
import { List } from '@/data/item';
import { ref } from 'vue';
import { menu as menuIcon } from 'ionicons/icons';
import { RouterLink } from 'vue-router';

const list = ref<List>({name: "test list", items: [{name: "Soap", checked: false}, {name: "Butter", checked: true}, {name: "Flour", checked: false}]});

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

<style scoped lang="css">

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