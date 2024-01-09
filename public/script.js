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
	
const fetchEmails = () => {
	fetch(`/return_unread.json?key=${api_key}`).then(response => response.json()).then(data => {
		localStorage.setItem("letterData", JSON.stringify(data));
		populateMenu(data)
	})
}

if (api_key) {
	fetchEmails()
}


const populateMenu = (data) => {
	document.getElementById("menucontents").innerHTML = ""
	data.forEach(email => {
		
		let headerdiv = document.createElement("div");
		let date = new Date(Date.parse(email.date))
		headerdiv.classList.add("nl-header")
		let headerTopDiv = document.createElement("div");
		headerTopDiv.classList.add("headerTop")
		let newsletterName = document.createElement("div");
		newsletterName.classList.add("newsletterName")
		newsletterName.innerText = email.sender
		let editionDate = document.createElement("div");
		
		editionDate.innerText = date.toLocaleString('default', { month: 'long' , day: "numeric"});

		let editionName = document.createElement("div");
		editionName.classList.add("editionName")
		editionName.innerText = email.title
		headerTopDiv.appendChild(newsletterName)
		headerTopDiv.appendChild(editionDate)
		headerdiv.appendChild(headerTopDiv)
		headerdiv.appendChild(editionName)
		

		headerdiv.setAttribute("emailId",email.uid)
		headerdiv.addEventListener("click", clickIntoEmail)
		document.getElementById("menucontents").appendChild(headerdiv);

	})
}
const populateReader = (emailId) => {
	let email = JSON.parse(localStorage.getItem("letterData")).filter(l => l.uid == emailId)[0]
	const html = email.htmlbody;
	const parsed = parser.parseFromString(html, 'text/html');
	let bodydiv = document.getElementById("rbody")
	let tempDiv = document.createElement("div")
	document.getElementById("mark_as_read").setAttribute("emailId",emailId)

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
	document.getElementById("settings").style.display = "none"

}
const clickIntoEmail = (e) => {
	console.log(e)
	let emailId = e.target.getAttribute("emailId")
	populateReader(emailId)
	document.getElementById("menu").style.display = "none"
	document.getElementById("reader").style.display = "flex"
	document.getElementById("settings").style.display = "none"

	
	
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
		body: JSON.stringify({key: api_key, emailId: emailId, read: 1})
	}).then(response => {
		fetchEmails()
		clickToMenu()
	})
}


const setNewsletterName = (sender,name) => {
	fetch(`/update_newsletter_list.json`,{
		headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
		method: "POST",
		body: JSON.stringify({key: api_key, sender: sender, name: name})
	}).then(response => 
		response.json()
	).then(data => {
		refreshSettingsTable(data)
	})
}

const submitNewsletterName = (e) => {
	let name = e.target.parentNode.getElementsByTagName("input")[0].value
	let sender = e.target.parentNode.parentNode.getElementsByTagName("td")[0].innerText
	setNewsletterName(sender,name)
}

const refreshSettingsTable = (data) => {
	document.getElementById("settingstable").innerHTML = ""
		data.forEach(newsletter => {
			let letterRow = document.createElement("tr")
			let senderCell = document.createElement("td")
			senderCell.innerHTML = newsletter.sender
			let nameCell = document.createElement("td")
			if (newsletter.name) {
				nameCell.innerHTML = newsletter.name
			} else {
				let input = document.createElement("input")
				let button = document.createElement("button")
				button.innerText = "."
				button.addEventListener("click",submitNewsletterName)
				nameCell.appendChild(input)
				nameCell.appendChild(button)
			}
			
			letterRow.appendChild(senderCell)
			letterRow.appendChild(nameCell)
			document.getElementById("settingstable").appendChild(letterRow)
		})
}
const openSettings = () => {
	document.getElementById("menu").style.display = "none"
	document.getElementById("reader").style.display = "none"
	document.getElementById("settings").style.display = "flex"
	
	fetch(`/fetch_newsletter_list.json?key=${api_key}`).then(response => response.json()).then(data => {
		refreshSettingsTable(data)
	})
}

document.getElementsByClassName("backbutton")[0].addEventListener("click",clickToMenu)
document.getElementsByClassName("backbutton")[1].addEventListener("click",clickToMenu)

document.getElementById("mark_as_read").addEventListener("click",markAsRead)

document.getElementById("settingsbutton").addEventListener("click",openSettings)
