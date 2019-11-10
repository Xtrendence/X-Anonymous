document.addEventListener("DOMContentLoaded", function(e) {
	// Connect to Socket.IO.
	var socket = io.connect(window.location.hostname, { reconnection:true, reconnectionDelay:1000, reconnectionDelayMax:5000, reconnectionAttempts:99999 });
	initialize();
	// Socket.io functionality.
	socket.on("disconnect", function() {
		socket.connect();
	});
	socket.on("save-credentials", function(data) {
		document.getElementsByClassName("add-button-border")[0].style.display = "none";
		document.getElementsByClassName("add-button")[0].style.display = "none";
		document.getElementsByClassName("add-page")[0].style.display = "none";
		document.getElementsByClassName("icon-wrapper settings")[0].style.display = "none";
		document.getElementsByClassName("chat-wrapper")[0].style.display = "block";
		if(data.save) {
			window.localStorage.setItem(get_conversation_id() + "anonymous-id", data.anonymous_id);
			update_local_storage();
		}
		if(!empty(get_history())) {
			var history = JSON.parse(get_history());
			var messages = Object.keys(history);
			for(i = 0; i < messages.length; i++) {
				var bubble = document.createElement("div");
				bubble.classList.add("chat-bubble-wrapper");
				bubble.classList.add(history[messages[i]]["from"]);
				bubble.innerHTML = '<div class="chat-bubble"><span>' + history[messages[i]]["text"] + '</span></div>';
				document.getElementsByClassName("messages-list")[0].appendChild(bubble);
			}
			document.getElementsByClassName("messages-list")[0].scrollTop = document.getElementsByClassName("messages-list")[0].scrollHeight;
		}
	});
	socket.on("save-recipient", function(data) {
		if(!empty(data)) {
			if(data.public_key != get_public_key()) {
				window.localStorage.setItem(get_conversation_id() + "recipient-public-key", data.public_key);
				update_local_storage();
				document.getElementsByClassName("keys-wrapper")[0].getElementsByClassName("recipient-public-key")[0].value = get_recipient_public_key();
				document.getElementsByClassName("keys-wrapper")[0].getElementsByClassName("recipient-public-key")[0].style.height = document.getElementsByClassName("keys-wrapper")[0].getElementsByClassName("recipient-public-key")[0].scrollHeight + "px";
			}
		}
	});
	socket.on("new-user", function(data) {
		if(data.public_key != get_public_key()) {
			window.localStorage.setItem(get_conversation_id() + "recipient-public-key", data.public_key);
			update_local_storage();
			document.getElementsByClassName("keys-wrapper")[0].getElementsByClassName("recipient-public-key")[0].value = get_recipient_public_key();
			document.getElementsByClassName("keys-wrapper")[0].getElementsByClassName("recipient-public-key")[0].style.height = document.getElementsByClassName("keys-wrapper")[0].getElementsByClassName("recipient-public-key")[0].scrollHeight + "px";
		}
		socket.emit("announce-existence", { conversation_id:get_conversation_id(), public_key:get_public_key() });
	});
	socket.on("new-image", function(data) {
		if(!empty(data)) {
			var hash = md5(get_public_key());
			if(hash != data.from) {
				var decrypted_key = decrypt_text(data.encrypted_key, get_private_key());
				var decrypted_image = aes_decrypt(data.encrypted_image, decrypted_key);
				var overlay = document.createElement("div");
				overlay.classList.add("image-overlay");
				overlay.innerHTML = '<div class="icon-wrapper close"><svg class="close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/><defs><linearGradient id="gradient-close"><stop offset="5%" stop-color="#33b7f6"/><stop offset="20%" stop-color="#479df8"/><stop offset="25%" stop-color="#6186f6"/><stop offset="35%" stop-color="#8464f0"/><stop offset="45%" stop-color="#ae57cb"/><stop offset="60%" stop-color="#dc529b"/><stop offset="65%" stop-color="#e35691"/><stop offset="80%" stop-color="#f35c71"/><stop offset="100%" stop-color="#fc5b57"/></linearGradient></defs></svg></div><div class="image-wrapper"><img src="' + atob(decrypted_image) + '"><span>Images aren\'t even saved in local storage. Once you close this popup, it\'ll be as if the image was never even sent or received.</span></div>';
				overlay.getElementsByClassName("close-icon")[0].addEventListener("click", function() {
					overlay.remove();
				});
				document.body.appendChild(overlay);
			}
		}
	});
	socket.on("new-message", function(data) {
		if(!empty(data)) {
			var hash = md5(get_public_key());
			var encrypted = data[hash];
			var decrypted = decrypt_text(encrypted, get_private_key());
			if(data.from == hash) {
				var from = "me";
			}
			else {
				var from = "other";
			}
			var bubble = document.createElement("div");
			bubble.classList.add("chat-bubble-wrapper");
			bubble.classList.add(from);
			bubble.innerHTML = '<div class="chat-bubble"><span>' + decrypted + '</span></div>';
			document.getElementsByClassName("messages-list")[0].appendChild(bubble);
			document.getElementsByClassName("input-field")[0].value = "";
			set_remaining_characters();
			if(!empty(get_history())) {
				var history = JSON.parse(get_history());
			}
			else {
				var history = new Object();
			}
			var id = generate_id();
			Object.assign(history, { [id]:{ from:from, text:decrypted }});
			window.localStorage.setItem(get_conversation_id() + "history", JSON.stringify(history));
			update_local_storage();
			document.getElementsByClassName("messages-list")[0].scrollTop = document.getElementsByClassName("messages-list")[0].scrollHeight;
		}
	});
	socket.on("count-clients", function(data) {
		if(data.clients == 2) {
			setTimeout(function() {
				if(document.getElementsByClassName("input-field-overlay")[0].style.display == "block") {
					document.getElementsByClassName("input-field-overlay")[0].style.display = "none";
					document.getElementsByClassName("input-field")[0].classList.remove("disabled");
					document.getElementsByClassName("image-button")[0].classList.remove("disabled");
					document.getElementsByClassName("input-button")[0].classList.remove("disabled");
				}
			}, 500);
		}
		else {
			if(document.getElementsByClassName("input-field-overlay")[0].style.display == "none") {
				document.getElementsByClassName("input-field-overlay")[0].style.display = "block";
				document.getElementsByClassName("input-field")[0].classList.add("disabled");
				document.getElementsByClassName("input-field")[0].blur();
				document.getElementsByClassName("image-button")[0].classList.add("disabled");
				document.getElementsByClassName("input-button")[0].classList.add("disabled");
			}
		}
	});
	// Settings functionality.
	document.getElementsByClassName("icon-wrapper settings")[0].addEventListener("click", function() {
		var settings_wrapper = document.getElementsByClassName("settings-wrapper")[0];
		if(settings_wrapper.style.visibility == "visible") {
			settings_wrapper.style.right = "-320px";
			setTimeout(function() {
				settings_wrapper.style.visibility = "hidden";
				settings_wrapper.style.right = "-320px";
			}, 250);
		}
		else {
			settings_wrapper.style.visibility = "visible";
			settings_wrapper.style.right = "20px";
		}
	});
	for(i = 0; i < document.getElementsByClassName("settings-choice").length; i++) {
		document.getElementsByClassName("settings-choice")[i].addEventListener("click", function() {
			if(this.classList.contains("key-size")) {
				window.localStorage.setItem("preference-key-size", this.textContent);
				for(j = 0; j < document.getElementsByClassName("settings-choice key-size").length; j++) {
					document.getElementsByClassName("settings-choice key-size")[j].classList.remove("active");
				}
			}
			else if(this.classList.contains("theme")) {
				window.localStorage.setItem("preference-theme", this.textContent.toLowerCase());
				set_theme(this.textContent.toLowerCase());
				for(j = 0; j < document.getElementsByClassName("settings-choice theme").length; j++) {
					document.getElementsByClassName("settings-choice theme")[j].classList.remove("active");
				}
			}
			update_local_storage();
			this.classList.add("active");
		});
	}
	for(i = 0; i < document.getElementsByClassName("settings-action").length; i++) {
		document.getElementsByClassName("settings-action")[i].addEventListener("click", function() {
			if(this.classList.contains("clear-storage")) {
				clear_storage();
				notify("Done", "Local storage has been cleared. Refreshing...", "theme", 4000);
			}
		});
	}
	// Keys pane functionality.
	document.getElementsByClassName("icon-wrapper keys")[0].addEventListener("click", function() {
		var keys_wrapper = document.getElementsByClassName("keys-wrapper")[0];
		if(keys_wrapper.style.visibility == "visible") {
			keys_wrapper.style.right = "-320px";
			setTimeout(function() {
				keys_wrapper.style.visibility = "hidden";
				keys_wrapper.style.right = "-320px";
			}, 250);
		}
		else {
			keys_wrapper.style.visibility = "visible";
			keys_wrapper.style.right = "20px";
			keys_wrapper.getElementsByClassName("conversation-id")[0].value = get_conversation_id();
			keys_wrapper.getElementsByClassName("anonymous-id")[0].value = get_anonymous_id();
			keys_wrapper.getElementsByClassName("public-key")[0].value = get_public_key();
			keys_wrapper.getElementsByClassName("private-key")[0].value = get_private_key();
			if(get_recipient_public_key() !== "[object Object]" && get_recipient_public_key() !== null) {
				keys_wrapper.getElementsByClassName("recipient-public-key")[0].value = get_recipient_public_key();
			}
			else {
				keys_wrapper.getElementsByClassName("recipient-public-key")[0].value = "Other user not connected.";
			}
			for(i = 0; i < keys_wrapper.getElementsByTagName("textarea").length; i++) {
				keys_wrapper.getElementsByTagName("textarea")[i].style.height = keys_wrapper.getElementsByTagName("textarea")[i].scrollHeight + "px";
			}
		}
	});
	// Drive button functionality.
	document.getElementsByClassName("icon-wrapper drive")[0].addEventListener("click", function() {
		var space = local_storage_space();
		var used = space.used;
		var free = space.free;
		notify("Local Storage", used + " KBs Used | " + free + " KBs Free", "theme", 4000);
	});
	// Share button functionality.
	document.getElementsByClassName("icon-wrapper share")[0].addEventListener("click", function() {
		copy_to_clipboard(window.location.href);
		notify("Copied", "The URL of this chat has been copied to your clipboard. Share it to talk to someone anonymously.", "theme", 4000);
	});
	// Clicking to dismiss keys pane.
	document.getElementsByClassName("messages-list")[0].addEventListener("click", function(e) {
		var keys_wrapper = document.getElementsByClassName("keys-wrapper")[0];
		if(keys_wrapper.style.visibility == "visible") {
			keys_wrapper.style.right = "-320px";
			setTimeout(function() {
				keys_wrapper.style.visibility = "hidden";
				keys_wrapper.style.right = "-320px";
			}, 250);
		}
	});
	// Clicking to dismiss settings.
	document.getElementsByClassName("add-page")[0].addEventListener("click", function() {
		var settings_wrapper = document.getElementsByClassName("settings-wrapper")[0];
		if(settings_wrapper.style.visibility == "visible") {
			settings_wrapper.style.right = "-320px";
			setTimeout(function() {
				settings_wrapper.style.visibility = "hidden";
				settings_wrapper.style.right = "-320px";
			}, 250);
		}
	});
	// Create conversation.
	document.getElementsByClassName("add-button")[0].addEventListener("click", function() {
		if(!document.getElementsByClassName("input-field")[0].classList.contains("disabled")) {
			document.getElementsByClassName("input-field")[0].focus();
		}
		notify("Creating Conversation", "This might take more than 20 seconds.", "theme", 4000);
		document.getElementsByClassName("add-button-border")[0].classList.add("animated");
		document.getElementsByClassName("add-button")[0].innerHTML = document.getElementsByClassName("add-button")[0].innerHTML.replace("Create Conversation", "Loading...");
		document.getElementsByClassName("add-button")[0].style.padding = "0 20px 0 30px";
		if(document.getElementsByClassName("settings-choice key-size active").length > 0) {
			var key_size = document.getElementsByClassName("settings-choice key-size active")[0].textContent;
		}
		else {
			var key_size = 4096;
		}
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = async function() {
			if(xhr.readyState == XMLHttpRequest.DONE) {
				var chat_id = xhr.responseText;
				var keys = await generate_keys(parseInt(key_size), chat_id);
				setInterval(function() {
					if(!empty(window.localStorage.getItem(chat_id + "public-key")) && !empty(window.localStorage.getItem(chat_id + "private-key"))) {
						window.location.href = "./chat?id=" + chat_id;
					}
				}, 500);
			}
		}
		xhr.open("POST", "/create", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(JSON.stringify({
			key_size:key_size
		}));
	});
	// Send image.
	document.getElementsByClassName("image-button")[0].addEventListener("click", function() {
		if(!document.getElementsByClassName("image-button")[0].classList.contains("disabled")) {
			var input = document.createElement("input");
			input.setAttribute("type", "file");
			input.classList.add("hidden");
			input.click();
			input.addEventListener("change", function() {
				var files = input.files;
				if(files.length > 0) {
					var image = files[0];
					var reader = new FileReader();
					reader.addEventListener("load", function(e) {
						var base64 = btoa(e.target.result);
						var aes_key = generate_hash();
						var encrypted_image = aes_encrypt(base64, aes_key);
						var encrypted_key = encrypt_text(aes_key, get_recipient_public_key());
						send_image(encrypted_image, encrypted_key);
						input.remove();
					});
					reader.readAsDataURL(image);
				}
			});
		}
	});
	// Send message.
	document.getElementsByClassName("input-button")[0].addEventListener("click", function() {
		if(!document.getElementsByClassName("input-field")[0].classList.contains("disabled")) {
			document.getElementsByClassName("input-field")[0].focus();
			var value = document.getElementsByClassName("input-field")[0].value;
			if(!empty(value) && !empty(value.trim())) {
				var max;
				var key_size = get_key_size();
				if(key_size == 2048) {
					max = 230;
				}
				else if(key_size == 3072) {
					max = 340;
				}
				else {
					max = 450;
				}
				var text = value.trim();
				var length = text.length;
				// RSA can't encrypt content that's bigger than the key size.
				if(length <= max) {
					send_message(text);
				}
				else {
					notify("Error", "Message too long.", "theme", 4000);
				}
			}
			var keys_wrapper = document.getElementsByClassName("keys-wrapper")[0];
			if(keys_wrapper.style.visibility == "visible") {
				keys_wrapper.style.right = "-320px";
				setTimeout(function() {
					keys_wrapper.style.visibility = "hidden";
					keys_wrapper.style.right = "-320px";
				}, 250);
			}
		}
	});
	document.getElementsByClassName("input-field")[0].addEventListener("keydown", function(e) {
		if(e.which == 13) {
			document.getElementsByClassName("input-button")[0].click();
		}
		set_remaining_characters();
	});
	document.getElementsByClassName("input-field")[0].addEventListener("keyup", function() {
		set_remaining_characters();
	});
	document.addEventListener("keydown", function(e) {
		if(!document.getElementsByClassName("input-field")[0].classList.contains("disabled")) {
			var keys_wrapper = document.getElementsByClassName("keys-wrapper")[0];
			if(keys_wrapper.style.visibility == "visible") {
				keys_wrapper.style.right = "-320px";
				setTimeout(function() {
					keys_wrapper.style.visibility = "hidden";
					keys_wrapper.style.right = "-320px";
				}, 250);
			}
		}
	});
	window.addEventListener("resize", function() {
		setTimeout(function() {
			document.getElementsByClassName("messages-list")[0].scrollTop = document.getElementsByClassName("messages-list")[0].scrollHeight;
		}, 100);
	});
	// Window visibility functionality.
	var window_hidden;
	var window_visibility_change; 
	if(typeof document.hidden !== "undefined") { 
		hidden = "hidden";
		window_visibility_change = "visibilitychange";
	} 
	else if(typeof document.webkitHidden !== "undefined") {
		hidden = "webkitHidden";
		window_visibility_change = "webkitvisibilitychange";
	}
	document.addEventListener(window_visibility_change, function() {
		socket.connect();
	}, false);
	setInterval(function() {
		socket.connect();
	}, 30000);
	// Join conversation.
	async function join_conversation() {
		if(empty(get_public_key()) && empty(get_private_key())) {
			var key_size = get_key_size();
			var keys = await generate_keys(key_size, get_conversation_id());
		}
		var joining = setInterval(function() {
			if(!empty(get_public_key()) && !empty(get_private_key())) {
				socket.emit("join-conversation", { conversation_id:get_conversation_id(), anonymous_id:get_anonymous_id(), public_key:get_public_key() });
				clearInterval(joining);
				// Check if other user is connected.
				setInterval(function() {
					socket.emit("count-clients", { conversation_id:get_conversation_id() });
				}, 2000);
			}
		}, 500);
	}
	// Send image.
	function send_image(encrypted_image, encrypted_key) {
		socket.emit("new-image", { conversation_id:get_conversation_id(), encrypted_image:encrypted_image.toString(), encrypted_key:encrypted_key, from:md5(get_public_key()) });
	}
	// Send message.
	function send_message(text) {
		var sender_encrypted = encrypt_text(text, get_public_key());
		var recipient_encrypted = encrypt_text(text, get_recipient_public_key());
		socket.emit("new-message", { conversation_id:get_conversation_id(), [md5(get_public_key())]:sender_encrypted, [md5(get_recipient_public_key())]:recipient_encrypted, from:md5(get_public_key()) });
	}
	// Update local storage monitors.
	function update_local_storage() {
		var space = local_storage_space();
		var used = space.used;
		var free = space.free;
		var width = Math.ceil((used.replace_all(",", "") / free.replace_all(",", "")) * 100);
		document.getElementsByClassName("settings-wrapper")[0].getElementsByClassName("settings-storage-foreground")[0].style.width = width + "%";
		document.getElementsByClassName("settings-wrapper")[0].getElementsByClassName("settings-storage-title")[0].textContent = used + " KBs Used | " + free + " KBs Free";
		if(used > free - 100) {
			notify("Local Storage", "The local storage is almost full.", "theme", 4000);
		}
	}
	// Clear local storage.
	function clear_storage() {
		window.localStorage.clear();
		setTimeout(function() {
			window.location.reload();
		}, 4000);
	}
	// Get conversation history.
	function get_history() {
		return window.localStorage.getItem(get_conversation_id() + "history");
	}
	// Generate hash.
	function generate_hash() {
		var result = "";
		var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		var charactersLength = characters.length;
		for(i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
	// Generate RSA keys.
	async function generate_keys(size, chat_id) {
		var crypt = new JSEncrypt({ default_key_size:size });
		var public_key = crypt.getPublicKey();
		var private_key = crypt.getPrivateKey();
		window.localStorage.setItem(chat_id + "key-size", size);
		window.localStorage.setItem(chat_id + "public-key", public_key);
		window.localStorage.setItem(chat_id + "private-key", private_key);
		update_local_storage();
		var keys = { public_key:public_key, private_key:private_key };
		return keys;
	}
	// Get conversation ID.
	function get_conversation_id() {
		return get_url_query("id");
	}
	// Get key size.
	function get_key_size() {
		return get_conversation_id().substring(0, 4);
	}
	// Get code.
	function get_code() {
		return get_conversation_id().substring(5, 9);
	}
	// Get anonymous ID.
	function get_anonymous_id() {
		return window.localStorage.getItem(get_conversation_id() + "anonymous-id");
	}
	// Get public key.
	function get_public_key() {
		return window.localStorage.getItem(get_conversation_id() + "public-key");
	}
	// Get private key.
	function get_private_key() {
		return window.localStorage.getItem(get_conversation_id() + "private-key");
	}
	// Get recipient public key.
	function get_recipient_public_key() {
		return window.localStorage.getItem(get_conversation_id() + "recipient-public-key");
	}
	// Encrypt text.
	function encrypt_text(plaintext, key) {
		var jsencrypt = new JSEncrypt();
		jsencrypt.setKey(key);
		return jsencrypt.encrypt(plaintext);
	}
	// Decrypt text.
	function decrypt_text(encrypted, key) {
		var jsencrypt = new JSEncrypt();
		jsencrypt.setKey(key);
		return jsencrypt.decrypt(encrypted);
	}
	// Encrypt text using AES-256.
	function aes_encrypt(plaintext, password) {
		return CryptoJS.AES.encrypt(plaintext, password);
	}
	// Decrypt text using AES-256.
	function aes_decrypt(encrypted, password) {
		var bytes  = CryptoJS.AES.decrypt(encrypted.toString(), password);
		return bytes.toString(CryptoJS.enc.Utf8);
	}
	// Get URL query by key.
	function get_url_query(key) {  
		return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
	}
	// Generate an ID.
	function generate_id() {
		return epoch() + "-" + random_int(10000000, 99999999);
	}
	// Set theme.
	function set_theme(color) {
		if(color == "light") {
			document.getElementsByClassName("theme-css")[0].href = document.getElementsByClassName("theme-css")[0].href.replace("dark", "light");
			document.getElementsByClassName("theme-css")[0].setAttribute("data-color", "light");
		}
		else if(color == "dark") {
			document.getElementsByClassName("theme-css")[0].href = document.getElementsByClassName("theme-css")[0].href.replace("light", "dark");
			document.getElementsByClassName("theme-css")[0].setAttribute("data-color", "dark");
		}
	}
	// Set remaining characters.
	function set_remaining_characters() {
		var max;
		var key_size = window.localStorage.getItem(get_conversation_id() + "key-size");
		if(key_size == 2048) {
			max = 230;
		}
		else if(key_size == 3072) {
			max = 340;
		}
		else {
			max = 450;
		}
		if(empty(document.getElementsByClassName("input-field")[0].value)) {
			document.getElementsByClassName("input-count")[0].textContent = max;
			document.getElementsByClassName("input-count")[0].style.color = "#8464f0";
		}
		else {
			document.getElementsByClassName("input-count")[0].textContent = max - document.getElementsByClassName("input-field")[0].value.length;
			if(document.getElementsByClassName("input-count")[0].textContent > 30) {
				document.getElementsByClassName("input-count")[0].style.color = "#8464f0";
			}
			else if(document.getElementsByClassName("input-count")[0].textContent <= 30 && document.getElementsByClassName("input-count")[0].textContent > 0) {
				document.getElementsByClassName("input-count")[0].style.color = "#fc5b57";
			}
			else if(document.getElementsByClassName("input-count")[0].textContent <= 0) {
				document.getElementsByClassName("input-count")[0].textContent = 0;
				document.getElementsByClassName("input-field")[0].value = document.getElementsByClassName("input-field")[0].value.substring(0, max);
			}
		}
	}
	// Convert date into UNIX timestamp.
	function to_epoch(date){
		var date = Date.parse(date);
		return date / 1000;
	}
	// Check if a string or variable is empty.
	function empty(text) {
		if(text != null && text != "null" && text != "" && typeof text != "undefined" && text != undefined && JSON.stringify(text) != "{}") {
			return false;
		}
		return true;
	}
	// Return full date with hours and minutes.
	function full_date(timestamp) {
		var date = new Date(timestamp * 1000);
		var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
		var year = date.getFullYear();
		var month = months[date.getMonth()];
		var day = date.getDate();
		var hour = date.getHours();
		var minute = "0" + date.getMinutes();
		var ampm = hour >= 12 ? "PM" : "AM";
		var hour = hour % 12;
		var hour = hour ? hour : 12; // Hour "0" would be "12".
		return day + nth(day) + " of " + month + ", " + year + " at " + hour + ":" + minute.substr(-2) + " " + ampm;
	}
	// Return date.
	function date(timestamp) {
		var date = new Date(timestamp * 1000);
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		return day + "/" + month + "/" + year;
	}
	// Return time.
	function hour(timestamp) {
		var date = new Date(timestamp * 1000);
		var hour = date.getHours();
		var minute = "0" + date.getMinutes();
		var ampm = hour >= 12 ? "PM" : "AM";
		var hour = hour % 12;
		var hour = hour ? hour : 12; // Hour "0" would be "12".
		return hour + ":" + minute.substr(-2) + " " + ampm;
	}
	// Separate number by thousands.
	function separate_thousands(number) {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	// Return current UNIX timestamp.
	function epoch() {
		var date = new Date();
		var time = Math.round(date.getTime() / 1000);
		return time;
	}
	// Return st, nd, rd or th.
	function nth(d) {
		if(d > 3 && d < 21) {
			return 'th';
		}
		switch(d % 10) {
			case 1:  return "st";
			case 2:  return "nd";
			case 3:  return "rd";
			default: return "th";
		}
	}
	// Generate random integer.
	function random_int(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}
	// Copy text to clipboard.
	function copy_to_clipboard(text) {
		var temp = document.createElement("textarea");
		temp.classList.add("select");
		temp.classList.add("hidden");
		document.body.appendChild(temp);
		temp.textContent = text;
		temp.select();
		document.execCommand("copy");
		temp.remove();
	}
	function initialize() {
		if(local_storage_available()) {
			if(canvas_available()) {
				update_local_storage();
				if(detect_mobile()) {
					document.getElementsByTagName("body")[0].setAttribute("id", "mobile");
				}
				else {
					document.getElementsByTagName("body")[0].setAttribute("id", "desktop");
				}
				if(empty(get_url_query("id"))) {
					document.getElementsByClassName("add-button-border")[0].style.display = "block";
					document.getElementsByClassName("add-button")[0].style.display = "block";
					if(!empty(window.localStorage.getItem("preference-key-size"))) {
						for(j = 0; j < document.getElementsByClassName("settings-choice key-size").length; j++) {
							document.getElementsByClassName("settings-choice key-size")[j].classList.remove("active");
						}
						document.getElementsByClassName("settings-choice key-size " + window.localStorage.getItem("preference-key-size"))[0].classList.add("active");
					}
					if(!empty(window.localStorage.getItem("preference-theme"))) {
						for(j = 0; j < document.getElementsByClassName("settings-choice theme").length; j++) {
							document.getElementsByClassName("settings-choice theme")[j].classList.remove("active");
						}
						document.getElementsByClassName("settings-choice theme " + window.localStorage.getItem("preference-theme"))[0].classList.add("active");
					}
				}
				else {
					document.getElementsByClassName("icon-wrapper github")[0].style.display = "none";
					document.getElementsByClassName("icon-wrapper settings")[0].style.display = "none";
					document.getElementsByClassName("add-button-border")[0].classList.add("animated");
					document.getElementsByClassName("add-button")[0].classList.add("disabled");
					document.getElementsByClassName("add-button")[0].innerHTML = document.getElementsByClassName("add-button")[0].innerHTML.replace("Create Conversation", "Loading...");
					document.getElementsByClassName("add-button")[0].style.padding = "0 20px 0 30px";
					document.getElementsByClassName("input-field-overlay")[0].style.display = "block";
					join_conversation();
					document.getElementsByTagName("title")[0].textContent = get_code() + " - " + "X:/Anonymous";
					set_remaining_characters();
				}
				if(!empty(window.localStorage.getItem("preference-theme")) && window.localStorage.getItem("preference-theme") == "dark") {
					document.getElementsByClassName("theme-css")[0].href = document.getElementsByClassName("theme-css")[0].href.replace("light", "dark");
					document.getElementsByClassName("theme-css")[0].setAttribute("data-color", "dark");
				}
				var cache = true;
				if(!cache) {
					for(i = 0; i < document.getElementsByTagName("link").length; i++) {
						document.getElementsByTagName("link")[i].href = document.getElementsByTagName("link")[i].href + "?" + epoch();
					}
				}
			}
			else {
				document.body.innerHTML = "";
				notify("Error", "Your browser doesn't support HTML5's canvas element.", "theme", 4000);
			}
		}
		else {
			document.body.innerHTML = "";
			notify("Error", "Your browser doesn't support local storage.", "theme", 4000);
		}
	}
	function detect_mobile() {
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	}
	// Check if canvas is available.
	function canvas_available() {
		var canvas = document.createElement("canvas");
		return !!(canvas.getContext && canvas.getContext("2d"));
	}
	// Check if local storage is supported.
	function local_storage_available() {
		try {
			window.localStorage.setItem("test", "test");
			window.localStorage.removeItem("test");
			return true;
		} 
		catch(e) {
			return false;
		}
	}
	// Check how much free space local storage has.
	function local_storage_space() {
		var data = "";
		for(var key in window.localStorage) {
			if(window.localStorage.hasOwnProperty(key)) {
				data += window.localStorage[key];
			}
		}
		var used = (Math.ceil((data.length * 16) / (8 * 1024))).toFixed(0);
		if(used < 2 && used > 0) {
			used = 2;
		}
		var free = 5120 - used;
		var space = { used:separate_thousands(used), free:separate_thousands(free) };
		return space;
	}
	// Notification function.
	function notify(title, description, color, duration) {
		if(color == "theme") {
			if(!empty(window.localStorage.getItem("preference-theme"))) {
				if(window.localStorage.getItem("preference-theme") == "light") {
					color = "rgb(250,250,250)";
				}
				else if(window.localStorage.getItem("preference-theme") == "dark") {
					color = "rgb(50,50,50)";
				}
			}
			else {
				color = "rgb(250,250,250)";
			}
		}
		var area = document.createElement("div");
		area.classList.add("notifiaction-area");
		area.classList.add("noselect");
		document.body.appendChild(area);
		var notification = document.createElement("div");
		notification.classList.add("notification-wrapper");
		notification.innerHTML = '<div class="notification-bubble" style="background:' + color + ';"><div class="notification-title-wrapper"><span class="notification-title">' + title + '</span></div><div class="notification-description-wrapper"><span class="notification-description">' + description + '</span></div></div>';
		area.appendChild(notification);
		notification.style.height = notification.scrollHeight + "px";
		notification.style.visibility = "visible";
		notification.getElementsByClassName("notification-bubble")[0].style.left = "20px";
		setTimeout(function() {
			notification.getElementsByClassName("notification-bubble")[0].style.left = "-600px";
			setTimeout(function() {
				notification.remove();
				if(area.innerHTML == "") {
					area.remove();
				}
			}, 500);
		}, duration);
	}
});
// Replace all occurrences in a string.
String.prototype.replace_all = function(str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}