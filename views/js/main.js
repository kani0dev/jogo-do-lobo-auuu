const socket = io();
const criar = document.querySelector("#criar")

criar.addEventListener("click", () => {
    socket.emit("CriarSala", {nome: "TESTE"})
})

