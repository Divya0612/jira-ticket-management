let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont")
let addFlag = false;   //false for modal none and true for modal display
let removeFlag = false;
let toolBoxColors = document.querySelectorAll(".color");

let mainCont = document.querySelector(".main-cont")
let textareaCont = document.querySelector(".textarea-cont")
let colors = ["lightpink", "lightblue", "lightgreen", "lightyellow"];
let modalPriorityColor = colors[colors.length-1];
let allPriorityColors = document.querySelectorAll(".priority-color");

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";
//listner for modal priority coloring

let ticketArr = [];

if(localStorage.getItem("jira_ticket")){

    //retrieve and display tickets
    ticketArr = JSON.parse(localStorage.getItem("jira_ticket"));
    ticketArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
    })

}

for(let i=0;i<toolBoxColors.length;i++){
    toolBoxColors[i].addEventListener("click" , (e) => {
        let currentToolBoxColors = toolBoxColors[i].classList[0];

        let filterTicket = ticketArr.filter((ticketObj, idx) => {
            return currentToolBoxColors === ticketObj.ticketColor;
        })

        //remove previous ticket
        let allTicketCont = document.querySelectorAll(".ticket-cont");
        for(let i=0;i<allTicketCont.length;i++){
            allTicketCont[i].remove();
        }

        //show filtered ticket

        filterTicket.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })

    toolBoxColors[i].addEventListener("dblclick", (e) => {
        
        //remove previous ticket
        let allTicketCont = document.querySelectorAll(".ticket-cont");
        for(let i=0;i<allTicketCont.length;i++){
            allTicketCont[i].remove();
        }

        ticketArr.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })
}

allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColorElem, idx) => {
            priorityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");

        modalPriorityColor = colorElem.classList[0];
    })
})

addBtn.addEventListener("click" ,(e) => {

    //display modal
    addFlag = !addFlag;
    if(addFlag){
        modalCont.style.display = "flex";
    }
    else{
        modalCont.style.display = "none";
    }
})

removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
})


// create ticket
modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    if(key === "Shift"){
        createTicket(modalPriorityColor, textareaCont.value);
        addFlag = false;
        setModalDefault();
    }
})

function createTicket(ticketColor, ticketTask, ticketID){
    let id = ticketID || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">${id}</div>
        <div class="task-area">${ticketTask}</div>
        <div class="ticket-lock">
            <i class="fa-solid fa-lock"></i> 
        </div>
    `;
    mainCont.appendChild(ticketCont);

    // create obj of ticket and add in ticket array
    if(!ticketID){
        ticketArr.push({ticketColor, ticketTask, ticketID: id});
        localStorage.setItem("jira_ticket", JSON.stringify(ticketArr));
        
    }
    handleRemoval(ticketCont, id);
    handleLock(ticketCont, id);
    handleColor(ticketCont, id);
}

function handleRemoval(ticket, id){
    //removeFlag = true -> remove
    ticket.addEventListener("click", (e) => {
        if(!removeFlag) return;

        let idx = getTicketIdx(id);

        //DB removal
        ticketArr.splice(idx, 1);
        let strTicketArr = JSON.stringify(ticketArr);
        localStorage.setItem("jira_ticket", strTicketArr);
        
        ticket.remove();  //ui removal
    })
}

function handleLock(ticket, id){
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");
    ticketLock.addEventListener("click", (e) => {
        let tickeIdx = getTicketIdx(id);

        if(ticketLock.classList.contains(lockClass)){
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }else{
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        //modify data in local storage (ticket task)
        ticketArr[tickeIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira_ticket", JSON.stringify(ticketArr));
    })
}

function handleColor(ticket, id){
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e) =>{
        let currentTicketColor = ticketColor.classList[1];
        
        //get tucketIdx from the tickets array
        let  tickeIdx = getTicketIdx(id);
       //get ticket color index

        let currentTicketColorIdx = colors.findIndex((color) => {
        return currentTicketColor === color;
        })

        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx%colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        //modify data in local storage (priority color change)
        ticketArr[tickeIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira_ticket", JSON.stringify(ticketArr));

    })

}


function getTicketIdx(id){
    let tickeIdx = ticketArr.findIndex((ticketObj) => {
        return ticketObj.ticketID === id;
    })
    return tickeIdx;
}
function setModalDefault(){
    modalCont.style.display = "none";
    textareaCont.value = "";
    modalPriorityColor = colors[colors.length-1];
    allPriorityColors.forEach((priorityColorElem, idx) => {
        priorityColorElem.classList.remove("border");
    })

    allPriorityColors[allPriorityColors.length-1].classList.add("border");
}