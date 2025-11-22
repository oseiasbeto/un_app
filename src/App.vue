<script setup>
import SplashScreen from "./components/UI/SplashScreen.vue"
import Sidebar from "./components/UI/Sidebar.vue"
import { useStore } from "vuex"
import { computed, onMounted, ref, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import Cookies from "js-cookie";
import { getSocket, disconnectSocket } from '@/services/socket';
import { getPlayerId } from "webtonative/OneSignal";
import { statusBar } from "webtonative"

// Estado para o tema
const isDark = ref(false);
const loading = ref(true)
const store = useStore()
const route = useRoute()
const sessionId = Cookies.get("session_id")

const user = computed(() => {
  return store.getters.currentUser
})

const isAuthenticated = computed(() => {
  const accessToken = store.getters.accessToken

  if (accessToken) return true
  else return false
})

const sendMessageSound = new Audio('/sounds/chat-bca16b82.mp3');
const notificationSound = new Audio('/sounds/boop.mp3');

notificationSound.preload = 'auto'
sendMessageSound.preload = 'auto'

const playSendMessageSound = async () => {
  try {
    // Reseta o áudio pro início (permite tocar várias vezes seguidas)
    sendMessageSound.currentTime = 0;
    await sendMessageSound.play();

  } catch (err) {
    console.log(err)
    // Usuário não interagiu ainda com a página → navegador bloqueia som
    // Isso é normal no Chrome/Firefox. Só toca após primeira interação.
    console.log("Som bloqueado (sem interação do usuário ainda)");
  }
}

// Função para tocar o som (com fallback silencioso)
const playNotificationSound = async () => {
  try {
    // Reseta o áudio pro início (permite tocar várias vezes seguidas)
    notificationSound.currentTime = 0;
    await notificationSound.play();

  } catch (err) {
    console.log(err)
    // Usuário não interagiu ainda com a página → navegador bloqueia som
    // Isso é normal no Chrome/Firefox. Só toca após primeira interação.
    console.log("Som bloqueado (sem interação do usuário ainda)");
  }
}

onMounted(async () => {
  /* 
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark');
  }*/

  statusBar({
    style: "light",
    color: "18222d",
    overlay: true //Only for android
  });

  if (sessionId && !isAuthenticated.value) {
    await store.dispatch('refreshToken', sessionId)
      .then(() => {
        const socket = getSocket();

        if (socket) {
          socket.on('newMessage', async (msg) => {
            const myId = user.value?._id;
            const isFromMe = msg.sender?._id === myId;
            const currentConvId = route.params?.convId || route.query?.convId;

            // Atualiza conversa na sidebar
            store.commit("ADD_OR_UPDATE_CONVERSATION", msg.conversation);

            // Se não for mensagem minha
            if (!isFromMe) {
              // Adiciona mensagem no chat (mesmo se estiver em outra conversa)
              store.commit("ADD_MESSAGE_REALTIME", {
                convId: msg.conversation._id,
                message: msg
              });

              // Toca som SOMENTE se:
              // - Não estou na conversa que recebeu a mensagem
              // OU
              // - Estou na conversa, mas a aba está em segundo plano (opcional)
              const isChatOpen = currentConvId === msg.conversation._id;
              const isAppVisible = !document.hidden;

              if (!isChatOpen || !isAppVisible) {
                playNotificationSound();
              }

              // Marca como lido automaticamente só se eu estiver vendo exatamente essa conversa
              if (isChatOpen && isAppVisible && route.name === 'Messages') {
                await store.dispatch("markAsRead", msg.conversation._id);
              }
            } else {
              playSendMessageSound()
            }
          })
        } else {
          console.log('Nenhum socket encontrado');
          return false;
        }
        
        if (!user.value?.player_id_onesignal) {
          getPlayerId().then(async function (playerId) {
            if (playerId) {
              // handle for playerId
              await store.dispatch("updateUser", {
                playerIdOneSignal: playerId
              })
            }
          });
        }
      })
      .finally(() => {
        loading.value = false
      })
  } else {
    loading.value = false
  }
})

onUnmounted(() => {
  const socket = getSocket();
  if (socket) {
    socket.off('newMessage');
    disconnectSocket()
  }
});
</script>

<template>

  <div
    class="font-primary w-screen text-sm h-screen text-light-text-primary dark:text-dark-text-primary bg-light-bg dark:bg-dark-bg">
    <!-- start main app area-->
    <div v-if="!loading">
      <!--start content-->
      <div class="h-full">
        <router-view v-slot="{ Component }">
          <keep-alive :include="['Chats', 'NewMessage', 'Messages']">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
      <!--end content-->

      <!--start sidebar-->
      <!--<sidebar v-show="isAuthenticated && route.meta.rootPage == 'main'" />-->
      <!--end sidebar-->

      <!--start modals-->
      <!--end modals-->
    </div>
    <div v-else>
      <splash-screen />
    </div>
    <!-- end main app area-->
  </div>

</template>
