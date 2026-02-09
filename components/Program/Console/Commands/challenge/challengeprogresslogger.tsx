import { v4 as uuidv4 } from 'uuid';
import {API_URL, enableCookies, getUserId} from "@/util/session";
import {Result, Txt} from "@/components/Program/Console/commandHandler";
import {getUsername} from "@/components/Program/Console/Commands/challenge/challenge";



const getUserUniqueId = () => {
  let id = localStorage.getItem("userID")
  if (id) return id
  id = uuidv4()
  localStorage.setItem("userID", id)
  return id
}


export const doCheck = async (quest: string, answer: string) => {
  const status = {
    pending: true,
    error: false,
    ok: false,
  }
  await fetch(`${API_URL}/check`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({quest, answer: answer.toLowerCase(), userId: getUserUniqueId(), username: getUsername() || "?"}),
  }).then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Request failed');
        });
      }
      return response.json();
    })
    .then(data => {
      if (data.correct) {
        status.pending = false
        status.ok = true
      } else {
        status.pending = false
        status.ok = false
      }
    })
    .catch(err => {
      status.pending = false
      status.error = true
    });
  return status
}


export const doSubscribe = (email: string) => {
  fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, userId: getUserUniqueId()}),
  })
}

