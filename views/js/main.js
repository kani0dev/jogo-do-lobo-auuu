const socket = io();

const input = document.querySelector("#codigo")
const entrar = document.querySelector("#entrar")
const criar = document.querySelector("#criar")

entrar.addEventListener("click", () => {
    if(input.value){
        socket.emit("JoinRoom", input.value)
        input.value = ''
    }
})

criar.addEventListener("click", () => {
    socket.emit("CreateRoom")
})

