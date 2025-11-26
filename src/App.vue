<script setup>
import SplashScreen from "./components/UI/SplashScreen.vue"
import Sidebar from "./components/UI/Sidebar.vue"
import { useStore } from "vuex"
import { computed, onMounted, ref, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import Cookies from "js-cookie";
import { getSocket, connectSocket, disconnectSocket } from '@/services/socket';
import { getPlayerId } from "webtonative/OneSignal";
import { statusBar } from "webtonative"
import { logger } from "./utils/logger";

// Estado para o tema
const isDark = ref(false);
const loading = ref(true)
const store = useStore()
const route = useRoute()
const sessionId = Cookies.get("session_id")
const savedTheme = ref(Cookies.get("theme") || 'dark')

const isOnline = ref(true)

const user = computed(() => {
  return store.getters.currentUser
})
const accessToken = computed(() => {
  return store.getters.accessToken
})

const isAuthenticated = computed(() => {
  if (accessToken.value) return true
  else return false
})

const notificationSound = new Audio('/sounds/boop.mp3');
notificationSound.preload = 'auto'

const reloadApp = () => {
  window.location.reload();
}

// Função para tocar o som (com fallback silencioso)
const playNotificationSound = async () => {
  try {
    // Reseta o áudio pro início (permite tocar várias vezes seguidas)
    notificationSound.currentTime = 0;
    await notificationSound.play();

  } catch (err) {
    logger.log(err)
    // Usuário não interagiu ainda com a página → navegador bloqueia som
    // Isso é normal no Chrome/Firefox. Só toca após primeira interação.
    logger.log("Som bloqueado (sem interação do usuário ainda)");
  }
}

// Função quando o usuário fica offline
const handleOffline = async () => {
  isOnline.value = false;
  // Tentar enviar disconnect antes de perder totalmente a conexão
  try {
    await disconnectSocket();
  } catch (error) {
    logger.log('Não foi possível enviar disconnect:', error)
  }
}

// Função quando o usuário volta online
const handleOnline = () => {
  reloadApp()
}

// Configurar listeners de conexão
const setupConnectionListeners = () => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
}

// Remover listeners de conexão
const removeConnectionListeners = () => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
}

const setThemeColor = (theme) => {
  if (savedTheme.value !== theme) {
    Cookies.set('theme', theme)
    savedTheme.value = theme
  }

  if (savedTheme.value === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  statusBar({
    style: 'light',
    color: theme == 'dark' ? '151d28' : "fff",
    overlay: false //Only for android
  });
}

onMounted(async () => {
  /* 
  if (savedTheme.value === 'dark' || (!savedTheme.value && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
    statusBar({
      style: "light",
      color: "151d28",
      overlay: false //Only for android
    });
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark');
    statusBar({
      style: "light",
      color: "fff",
      overlay: false //Only for android
    });
  }*/

  setThemeColor(savedTheme.value)

  // Configurar listeners de conexão
  setupConnectionListeners();


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

              // Marca como lido automaticamente só se eu estiver vendo exatamente essa conversa
              if (isChatOpen && isAppVisible && route.name === 'Messages') {
                await store.dispatch("markAsRead", msg.conversation._id);
              }
            }
          })
        } else {
          logger.log('Nenhum socket encontrado');
          return false;
        }

        // setar com base no valor do corrente usuario
        setThemeColor('dark')

        getPlayerId().then(async function (playerId) {
          if (playerId) {
            if (!user.value?.player_id_onesignal || user.value?.player_id_onesignal !== playerId) {
              await store.dispatch("updateUser", {
                playerIdOneSignal: playerId
              })
            }
          }
        });
      })
      .finally(() => {
        loading.value = false
      })
  } else {
    loading.value = false
  }


  setTimeout(() => {
    setThemeColor(savedTheme.value)
  }, 2000);
})

onUnmounted(() => {
  const socket = getSocket();
  if (socket) {
    socket.off('newMessage');
    disconnectSocket()
  }

  // Remover listeners de conexão
  removeConnectionListeners();
});
</script>

<template>

  <div
    class="font-primary bg-background-primary text-text-primary relative w-screen text-sm h-screen text-light-text-primary">
    <!-- start main app area-->
    <div v-if="!loading">
      <!--start content-->
      <div v-if="isOnline" class="h-full">
        <router-view v-slot="{ Component }">
          <keep-alive :include="['Chats', 'NewMessage', 'Messages']">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
      <!--end content-->

      <!--start content offline-->
      <div v-else>
        <h1>Conecta-se a Rede</h1>
      </div>
      <!--end content offline-->

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
