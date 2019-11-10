var port = 80;
if(!empty(process.env.PORT)) {
	port = process.env.PORT;
}

const express = require("express");
const session = require("express-session");
const app = express();
const server = app.listen(port);

const fs = require("fs");
const path = require("path");
const io = require("socket.io")(server);
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const crypto_js = require("crypto-js");
const body_parser = require("body-parser");

const conversations_folder = path.join(__dirname, "./conversations/");

app.set("view engine", "ejs");
app.use("/assets", express.static("assets"));
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

// Create the conversation folder if it doesn't exist.
if(!fs.existsSync(conversations_folder)) {
	fs.mkdir(conversations_folder, function(error) {
		if(error) {
			console.log(error);
		}
	});
}

// The server's root directory. If the user is logged in, they'll see the main chat page, otherwise, they'll be shown the login page.
app.get("/", function(req, res) {
	res.render("home");
});
app.get("/chat", function(req, res) {
	res.render("home");
});
app.post("/create", function(req, res) {
	if(!empty(req.body.key_size)) {
		var key_size = req.body.key_size;
		if(fs.existsSync(conversations_folder)) {
			var code = generate_code(4);
			var conversation_id = generate_conversation_id(key_size, code);
			var conversation_file = conversations_folder + generate_conversation_file_name(conversation_id) + ".txt";
			while(fs.existsSync(conversation_file)) {
				conversation_id = generate_conversation_id(key_size, code);
				conversation_file = conversations_folder + generate_conversation_file_name(conversation_id) + ".txt";
			}
			var info = { time_created:epoch(), time_modified:epoch(), code:code, conversation_id:conversation_id, clients:{ }};
			fs.writeFile(conversation_file, JSON.stringify(info), { flag:"w" }, function(error) {
				if(error) {
					console.log(error);
				}
				else {
					res.send(conversation_id);
				}
			});
		}
	}
});

io.sockets.on("connection", function(socket) {
	socket.on("join-conversation", function(data) {
		if(!empty(data)) {
			var conversation_id = data.conversation_id;
			var conversation_file = conversations_folder + generate_conversation_file_name(conversation_id) + ".txt";
			if(fs.existsSync(conversation_file)) {
				fs.readFile(conversation_file, { encoding:"utf-8" }, function(error, json) {
					if(error) {
						console.log(error);
					}
					else {
						if(!empty(json)) {
							var info = JSON.parse(json);
							if(empty(data.anonymous_id)) {
								var anonymous_id = generate_anonymous_id(conversation_id);
								while(anonymous_id in info.clients) {
									anonymous_id = generate_anonymous_id(conversation_id);
								}
								var user = { [anonymous_id]:{ socket_id:socket.id, public_key:"" }};
								Object.assign(info.clients, user);
							}
							else {
								info.clients[data.anonymous_id]["socket_id"] = socket.id;
							}
							if(!empty(info)) {
								fs.writeFile(conversation_file, JSON.stringify(info), function(error) {
									if(error) {
										console.log(error);
									}
									else {
										if(empty(data.anonymous_id)) {
											var public_key = data.public_key;
											info.clients[anonymous_id]["public_key"] = public_key;
											if(!empty(info)) {
												fs.writeFile(conversation_file, JSON.stringify(info), function(error) {
													if(error) {
														console.log(error);
													}
													else {
														socket.join(data.conversation_id);
														io.to(info.clients[anonymous_id]["socket_id"]).emit("save-credentials", { save:true, anonymous_id:anonymous_id });
														io.to(data.conversation_id).emit("new-user", { public_key:public_key });
													}
												});
											}
										}
										else {
											if(!empty(data.public_key)) {
												socket.join(data.conversation_id);
												io.to(info.clients[data.anonymous_id]["socket_id"]).emit("save-credentials", { save:false });
												io.to(data.conversation_id).emit("new-user", { public_key:data.public_key });
											}
										}
									}
								});
							}
						}
					}
				});
			}
		}
	});
	socket.on("new-image", function(data) {
		if(!empty(data)) {
			var conversation_file = conversations_folder + generate_conversation_file_name(data.conversation_id) + ".txt";
			if(fs.existsSync(conversation_file)) {
				fs.readFile(conversation_file, { encoding:"utf-8" }, function(error, json) {
					if(error) {
						console.log(error);
					}
					else {
						if(!empty(json)) {
							var info = JSON.parse(json);
							info.time_modified = epoch();
							if(!empty(info)) {
								fs.writeFile(conversation_file, JSON.stringify(info), function(error) {
									if(error) {
										console.log(error);
									}
									else {
										io.to(data.conversation_id).emit("new-image", data);
									}
								});
							}
						}
					}
				});
			}
		}
	});
	socket.on("new-message", function(data) {
		if(!empty(data)) {
			var conversation_file = conversations_folder + generate_conversation_file_name(data.conversation_id) + ".txt";
			if(fs.existsSync(conversation_file)) {
				fs.readFile(conversation_file, { encoding:"utf-8" }, function(error, json) {
					if(error) {
						console.log(error);
					}
					else {
						if(!empty(json)) {
							var info = JSON.parse(json);
							info.time_modified = epoch();
							if(!empty(info)) {
								fs.writeFile(conversation_file, JSON.stringify(info), function(error) {
									if(error) {
										console.log(error);
									}
									else {
										io.to(data.conversation_id).emit("new-message", data);
									}
								});
							}
						}
					}
				});
			}
		}
	});
	socket.on("announce-existence", function(data) {
		if(!empty(data)) {
			io.to(data.conversation_id).emit("save-recipient", { public_key:data.public_key });
		}
	});
	socket.on("count-clients", function(data) {
		if(!empty(data)) {
			io.in(data.conversation_id).clients(function(error, clients) {
				if(error) {
					console.log(error);
				}
				else {
					io.to(data.conversation_id).emit("count-clients", { clients:clients.length });
				}
			});
		}
	});
});

// AES encrypt.
function aes_encrypt(plaintext, password) {
	return crypto_js.AES.encrypt(plaintext, password);
}
// AES decrypt.
function aes_decrypt(encrypted, password) {
	var bytes  = crypto_js.AES.decrypt(encrypted.toString(), password);
	return bytes.toString(crypto_js.enc.Utf8);
}
// Get the key of a value in an object.
function get_key(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}
// Generate a random integer.
function random_int(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}
// Generate an ID.
function generate_id() {
	return epoch() + "-" + random_int(10000000, 99999999);
}
// Generate code.
function generate_code(length) {
	var letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
	var code = "";
	for(i = 0; i < length; i++) {
		code += letters[random_int(0, 26)];
	}
	return code.toUpperCase();
}
// Generate a token.
function generate_token() {
	var salt1 = bcrypt.genSaltSync();
	var salt2 = bcrypt.genSaltSync();
	return bcrypt.hashSync(salt1 + salt2, 10);
}
// Generate a conversation ID.
function generate_conversation_id(key_size, code) {
	return key_size + "-" + code + "-" + epoch() + generate_token() + generate_token() + "-" + "cv";
}
// Generate an anonymous ID.
function generate_anonymous_id(conversation_id) {
	return "anon#" + conversation_id + generate_token() + generate_token();
}
// Generate a conversation file name.
function generate_conversation_file_name(conversation_id) {
	return crypto.createHash("sha256").update(conversation_id).digest("hex");
}
// Check if a string contains only letters and numbers.
function alphanumeric(string) {
	return string.match(/^[a-z0-9]+$/i);
}
// Convert a date to a timestamp.
function to_epoch(date){
	var date = Date.parse(date);
	return date / 1000;
}
// Convert a timestamp to a full date in a format like "3rd of January, 2019 at 3:45 PM".
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
// Convert a timestamp to a date in the format DD / MM / YYYY.
function date(timestamp) {
	var date = new Date(timestamp * 1000);
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	return day + "/" + month + "/" + year;
}
// Get the hour from a timestamp.
function hour(timestamp) {
	var date = new Date(timestamp * 1000);
	var hour = date.getHours();
	var minute = "0" + date.getMinutes();
	var ampm = hour >= 12 ? "PM" : "AM";
	var hour = hour % 12;
	var hour = hour ? hour : 12; // Hour "0" would be "12".
	return hour + ":" + minute.substr(-2) + " " + ampm;
}
// Get the current UNIX timestamp.
function epoch() {
	var date = new Date();
	var time = Math.round(date.getTime() / 1000);
	return time;
}
// Get the ordinal number suffix.
function nth(d) {
	if(d > 3 && d < 21) {
		return "th";
	}
	switch(d % 10) {
		case 1:  return "st";
		case 2:  return "nd";
		case 3:  return "rd";
		default: return "th";
	}
}
// Check if a string is empty.
function empty(text) {
	if(text != null && text != "null" && text != "" && typeof text != "undefined" && text != undefined && JSON.stringify(text) != "{}") {
		return false;
	}
	return true;
}
// Replace all instances of a string.
String.prototype.replace_all = function(str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

console.log("Server running - " + hour(epoch()));