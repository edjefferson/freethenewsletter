async function registerServiceWorker() {
	if ("serviceWorker" in navigator) {
		try {
			const registration = await navigator.serviceWorker.register(
				"serviceworker.js"
			);
			console.log(
				"Service Worker registered with scope:",
				registration.scope
			);
		} catch (error) {
			console.error("Service Worker registration failed:", error);
		}
	}
}

registerServiceWorker();
console.log("bun")

let state = 0
let letterData

const parser = new DOMParser();
const urlParams = new URLSearchParams(window.location.search);

const setCookie = (name, value, days = 7, path = '/') => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=' + path
}

const getCookie = (name) => (
  document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)

let api_key


if (urlParams.get('key')) {
	api_key = urlParams.get('key')
	setCookie('key',api_key,365)
} else {
	api_key = getCookie('key')
}
	
if (api_key) {
	fetchEmails()
}

const fetchEmails = () => {
	fetch(`/return_unread.json?key=${api_key}`).then(response => response.json()).then(data => {
		localStorage.setItem("localStorage", data);
		populateMenu()
	})
}
const populateMenu = () => {
	document.getElementById("menu").innerHTML = ""
	localStorage.getItem("letterData").forEach(email => {
		
		let headerdiv = document.createElement("div");
		let date = new Date(Date.parse(email.date))
		document.getElementById("mark_as_read").setAttribute("emailId",email.uid)
		headerdiv.classList.add("nl-header")
		headerdiv.innerText = email.title + " " + date.toString()
		headerdiv.setAttribute("emailId",email.uid)
		headerdiv.addEventListener("click", clickIntoEmail)
		document.getElementById("menu").appendChild(headerdiv);

		
	})
}
const populateReader = (emailId) => {
	let email = localStorage.getItem("letterData").filter(l => l.uid == emailId)[0]
	const html = email.htmlbody;
	const parsed = parser.parseFromString(html, 'text/html');
	let bodydiv = document.getElementById("rbody")
	let tempDiv = document.createElement("div")
	tempDiv.innerHTML = parsed.body.innerHTML
	if (tempDiv.getElementsByTagName("*")) {
		Array.from(tempDiv.getElementsByTagName("*")).forEach(n => {
				n.removeAttribute('style')
			})
	}
	bodydiv.innerHTML = tempDiv.innerHTML
}
const clickToMenu = (e) => {
	document.getElementById("menu").style.display = "flex"
	document.getElementById("reader").style.display = "none"
}
const clickIntoEmail = (e) => {
	let emailId = e.target.getAttribute("emailId")
	populateReader(emailId)
	document.getElementById("menu").style.display = "none"
	document.getElementById("reader").style.display = "flex"
	
	
	
}

const markAsRead = (e) => {
	let emailId = document.getElementById("mark_as_read").getAttribute("emailId")
	console.log(e)
	fetch(`/mark_read.json`,{
		headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
		method: "POST",
		body: JSON.stringify({key: api_key, emailId: emailId})
	}).then(response => {
		fetchEmails()
		clickToMenu()
	})
}

document.getElementById("backblock").addEventListener("click",clickToMenu)

document.getElementById("mark_as_read").addEventListener("click",markAsRead)
