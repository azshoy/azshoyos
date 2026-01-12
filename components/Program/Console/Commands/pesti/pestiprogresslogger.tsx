import { v4 as uuidv4 } from 'uuid';


const serverUrl = 'https://mywebsite.example/endpoint/'
const enabled = false

const getUserUniqueId = () => {
  let id = localStorage.getItem("userID")
  if (id) return id
  id = uuidv4()
  localStorage.setItem("userID", id)
  return id
}

export const sendCommandProgressToServer = (command: string, args: string[]) => {
  if (!enabled) return
  fetch(serverUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user: getUserUniqueId(),
      command: command,
      args: args.join(" "),
    })
  })
}