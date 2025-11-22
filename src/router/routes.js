import auth from '../app/auth/routes'
import chats from '../app/chats/routes'
import users from '../app/users/routes'

export default [
    ...auth,
    ...chats,
    ...users
]