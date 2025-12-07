import auth from '../app/auth/routes'
import chats from '../app/chats/routes'
import users from '../app/users/routes'
import wallets from '../app/wallets/routes'

export default [
    ...auth,
    ...chats,
    ...users,
    ...wallets
]