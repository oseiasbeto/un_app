export default [
    {
        path: '/chats',
        name: 'Chats',
        meta: {
            requiresAuth: true,
            rootPage: 'chats',
            title: 'Conversas'
        },
        component: () => import('./views/Chats.vue')
    },
     {
        path: '/messages/:convId',
        name: 'Messages',
        meta: {
            requiresAuth: true,
            rootPage: 'chats',
            title: 'Mensagens'
        },
        component: () => import('./views/Messages.vue')
    },
     {
        path: '/new-message',
        name: 'New Message',
        meta: {
            requiresAuth: true,
            rootPage: 'chats',
            title: 'Nova mensagem'
        },
        component: () => import('./views/NewMessage.vue')
    }
]